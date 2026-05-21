import 'dart:convert';
import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:uuid/uuid.dart';
import '../auth.dart';
import '../store.dart';

final _json = {'content-type': 'application/json'};
final _uuid = const Uuid();

// ── Feedback ─────────────────────────────────────────────────────

Future<Response> handleGetFeedback(Request request) async {
  return Response.ok(jsonEncode(await Store.instance.getFeedback()), headers: _json);
}

Future<Response> handleDeleteFeedback(Request request, String id) async {
  await Store.instance.deleteFeedback(id);
  return Response.ok(jsonEncode({'status': 'ok'}), headers: _json);
}

// ── Updates ──────────────────────────────────────────────────────

Future<Response> handlePostUpdate(Request request) async {
  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  final username = getUsername(request);

  final update = {
    'id': _uuid.v4(),
    'title': body['title'] ?? '',
    'body': body['body'] ?? '',
    'sendPush': body['sendPush'] ?? false,
    'postedBy': username,
    'createdAt': DateTime.now().toUtc().toIso8601String(),
  };

  await Store.instance.addUpdate(update);
  return Response(201, body: jsonEncode(update), headers: _json);
}

Future<Response> handleGetUpdates(Request request) async {
  return Response.ok(jsonEncode(await Store.instance.getUpdates()), headers: _json);
}

// ── Users ────────────────────────────────────────────────────────

Future<Response> handleGetUsers(Request request) async {
  final allUsers = await Store.instance.getAllUsers();
  final users = allUsers.map((u) {
    // Don't expose password hashes
    return {
      'id': u['id'],
      'username': u['username'],
      'displayName': u['displayName'] ?? u['username'],
      'email': u['email'] ?? '',
      'totalScore': u['totalScore'] ?? 0,
      'streak': u['streak'] ?? 0,
      'isAdmin': u['isAdmin'] ?? false,
      'createdAt': u['createdAt'],
    };
  }).toList();

  return Response.ok(jsonEncode(users), headers: _json);
}

Future<Response> handleDeleteAllUsers(Request request) async {
  await Store.instance.deleteAllUsers();
  return Response.ok(jsonEncode({'status': 'ok', 'message': 'All users deleted'}), headers: _json);
}

Future<Response> handleMakeAdmin(Request request) async {
  final secret = Platform.environment['ADMIN_SECRET'] ?? '';
  final provided = request.headers['x-admin-secret'] ?? '';
  if (secret.isEmpty || provided != secret) {
    return Response(403, body: jsonEncode({'error': 'Forbidden'}), headers: _json);
  }
  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  final username = (body['username'] as String?)?.trim() ?? '';
  if (username.isEmpty) {
    return Response(400, body: jsonEncode({'error': 'username required'}), headers: _json);
  }
  await Store.instance.setUserAdmin(username, true);
  return Response.ok(jsonEncode({'status': 'ok', 'username': username, 'isAdmin': true}), headers: _json);
}

// ── FCM Token ────────────────────────────────────────────────────

Future<Response> handleRegisterFcmToken(Request request) async {
  final userId = getUserId(request);
  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  final token = body['token'] as String? ?? '';

  if (token.isNotEmpty) {
    await Store.instance.saveFcmToken(userId, token);
  }

  return Response.ok(jsonEncode({'status': 'ok'}), headers: _json);
}
