import 'dart:convert';
import 'dart:io';
import 'package:uuid/uuid.dart';

/// Simple JSON file-based persistent store.
/// On Render, data persists as long as the service is running.
/// For production, swap with a real database.
class Store {
  Store._();
  static final Store instance = Store._();

  final _uuid = const Uuid();
  final String _dataDir = 'data';

  late Map<String, Map<String, dynamic>> _users; // userId -> user data
  late Map<String, String> _usernameIndex; // username -> userId
  late List<Map<String, dynamic>> _feedback;
  late List<Map<String, dynamic>> _updates;
  late Map<String, String> _fcmTokens; // userId -> token
  late Map<String, Map<String, dynamic>> _snapshots; // userId -> last snapshot

  void initialize() {
    _ensureDataDir();
    _users = _loadMap('users.json');
    _usernameIndex = {};
    for (final entry in _users.entries) {
      final username = entry.value['username'] as String? ?? '';
      if (username.isNotEmpty) {
        _usernameIndex[username.toLowerCase()] = entry.key;
      }
    }
    _feedback = _loadList('feedback.json');
    _updates = _loadList('updates.json');
    _fcmTokens = Map<String, String>.from(_loadMap('fcm_tokens.json').map(
      (k, v) => MapEntry(k, v.toString()),
    ));
    _snapshots = _loadMap('snapshots.json');
  }

  void _ensureDataDir() {
    final dir = Directory(_dataDir);
    if (!dir.existsSync()) dir.createSync(recursive: true);
  }

  Map<String, Map<String, dynamic>> _loadMap(String filename) {
    final file = File('$_dataDir/$filename');
    if (!file.existsSync()) return {};
    try {
      final content = file.readAsStringSync();
      final decoded = jsonDecode(content);
      return Map<String, Map<String, dynamic>>.from(
        (decoded as Map).map((k, v) => MapEntry(k.toString(), Map<String, dynamic>.from(v as Map))),
      );
    } catch (_) {
      return {};
    }
  }

  List<Map<String, dynamic>> _loadList(String filename) {
    final file = File('$_dataDir/$filename');
    if (!file.existsSync()) return [];
    try {
      final content = file.readAsStringSync();
      return List<Map<String, dynamic>>.from(
        (jsonDecode(content) as List).map((e) => Map<String, dynamic>.from(e as Map)),
      );
    } catch (_) {
      return [];
    }
  }

  void _saveMap(String filename, Map data) {
    File('$_dataDir/$filename').writeAsStringSync(jsonEncode(data));
  }

  void _saveList(String filename, List data) {
    File('$_dataDir/$filename').writeAsStringSync(jsonEncode(data));
  }

  // ── Users ──────────────────────────────────────────────────────

  String generateId() => _uuid.v4();

  Map<String, dynamic>? getUserById(String id) => _users[id];

  Map<String, dynamic>? getUserByUsername(String username) {
    final id = _usernameIndex[username.toLowerCase()];
    if (id == null) return null;
    return _users[id];
  }

  String? getUserIdByUsername(String username) {
    return _usernameIndex[username.toLowerCase()];
  }

  bool usernameExists(String username) {
    return _usernameIndex.containsKey(username.toLowerCase());
  }

  void createUser(String id, Map<String, dynamic> data) {
    _users[id] = data;
    final username = data['username'] as String? ?? '';
    if (username.isNotEmpty) {
      _usernameIndex[username.toLowerCase()] = id;
    }
    _saveMap('users.json', _users);
  }

  void updateUser(String id, Map<String, dynamic> data) {
    _users[id] = data;
    _saveMap('users.json', _users);
  }

  List<Map<String, dynamic>> getAllUsers() {
    return _users.entries.map((e) {
      final user = Map<String, dynamic>.from(e.value);
      user['id'] = e.key;
      return user;
    }).toList();
  }

  // ── Snapshots (sync) ───────────────────────────────────────────

  void saveSnapshot(String userId, Map<String, dynamic> snapshot) {
    _snapshots[userId] = snapshot;
    _saveMap('snapshots.json', _snapshots);
  }

  Map<String, dynamic>? getSnapshot(String userId) => _snapshots[userId];

  // ── Feedback ───────────────────────────────────────────────────

  List<Map<String, dynamic>> getFeedback() => _feedback;

  void addFeedback(Map<String, dynamic> item) {
    _feedback.add(item);
    _saveList('feedback.json', _feedback);
  }

  void deleteFeedback(String id) {
    _feedback.removeWhere((f) => f['id'] == id);
    _saveList('feedback.json', _feedback);
  }

  // ── Updates ────────────────────────────────────────────────────

  List<Map<String, dynamic>> getUpdates() => _updates;

  void addUpdate(Map<String, dynamic> update) {
    _updates.insert(0, update);
    _saveList('updates.json', _updates);
  }

  // ── FCM Tokens ─────────────────────────────────────────────────

  void saveFcmToken(String userId, String token) {
    _fcmTokens[userId] = token;
    _saveMap('fcm_tokens.json',
        _fcmTokens.map((k, v) => MapEntry(k, {'token': v})));
  }

  Map<String, String> getAllFcmTokens() => _fcmTokens;
}
