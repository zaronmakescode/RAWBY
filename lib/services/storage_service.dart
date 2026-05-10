// ============================================================
// RAWBY — Storage Service (Hive wrapper)
// Replaces localStorage from the JS version
// ============================================================
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

class StorageService {
  static const String _boxName = 'rawby_prefs';
  late Box _box;
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    await Hive.initFlutter();
    _box = await Hive.openBox(_boxName);
    _initialized = true;
  }

  String? getString(String key) {
    if (!_initialized) return null;
    return _box.get(key) as String?;
  }

  Future<void> setString(String key, String value) async {
    if (!_initialized) return;
    await _box.put(key, value);
  }

  Future<void> remove(String key) async {
    if (!_initialized) return;
    await _box.delete(key);
  }

  Future<void> clear() async {
    if (!_initialized) return;
    await _box.clear();
  }

  bool containsKey(String key) {
    if (!_initialized) return false;
    return _box.containsKey(key);
  }
}
