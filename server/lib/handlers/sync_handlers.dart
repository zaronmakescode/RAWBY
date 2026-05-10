import 'dart:convert';
import 'package:shelf/shelf.dart';
import '../auth.dart';
import '../store.dart';

final _json = {'content-type': 'application/json'};

Future<Response> handlePushSnapshot(Request request) async {
  final userId = getUserId(request);
  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;

  // Save the full snapshot
  Store.instance.saveSnapshot(userId, body);

  // Update user-level aggregates
  final user = Store.instance.getUserById(userId);
  if (user != null) {
    user['totalScore'] = body['totalScore'] ?? user['totalScore'] ?? 0;
    user['streak'] = body['streak'] ?? user['streak'] ?? 0;
    Store.instance.updateUser(userId, user);
  }

  return Response.ok(jsonEncode({'status': 'ok'}), headers: _json);
}

Future<Response> handleSyncScores(Request request) async {
  final userId = getUserId(request);
  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;

  // Update score data
  final user = Store.instance.getUserById(userId);
  if (user != null) {
    user['totalScore'] = body['totalScore'] ?? user['totalScore'] ?? 0;
    user['streak'] = body['streak'] ?? user['streak'] ?? 0;
    Store.instance.updateUser(userId, user);
  }

  return Response.ok(jsonEncode({'status': 'ok'}), headers: _json);
}
