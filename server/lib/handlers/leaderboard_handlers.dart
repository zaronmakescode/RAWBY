import 'dart:convert';
import 'package:shelf/shelf.dart';
import '../store.dart';

final _json = {'content-type': 'application/json'};

Future<Response> handleGetLeaderboard(Request request) async {
  final users = Store.instance.getAllUsers();

  final entries = users.map((u) {
    return {
      'id': u['id'],
      'username': u['username'],
      'displayName': u['displayName'] ?? u['username'],
      'totalScore': u['totalScore'] ?? 0,
      'streak': u['streak'] ?? 0,
    };
  }).toList();

  // Sort by score descending
  entries.sort((a, b) => (b['totalScore'] as int).compareTo(a['totalScore'] as int));

  // Assign ranks
  for (var i = 0; i < entries.length; i++) {
    entries[i]['rank'] = i + 1;
  }

  return Response.ok(jsonEncode({
    'leaderboard': entries,
  }), headers: _json);
}

Future<Response> handleGetProfile(Request request, String username) async {
  final user = Store.instance.getUserByUsername(username);
  if (user == null) {
    return Response(404, body: jsonEncode({'error': 'User not found'}), headers: _json);
  }

  final userId = Store.instance.getUserIdByUsername(username)!;
  final snapshot = Store.instance.getSnapshot(userId);

  return Response.ok(jsonEncode({
    'user': {
      'id': userId,
      'username': user['username'],
      'displayName': user['displayName'] ?? user['username'],
      'totalScore': user['totalScore'] ?? 0,
      'streak': user['streak'] ?? 0,
      'createdAt': user['createdAt'],
    },
    if (snapshot != null) 'stats': {
      'projectsCount': (snapshot['history'] as List?)?.length ?? 0,
      'totalLikes': snapshot['totalLikes'] ?? 0,
      'totalViews': snapshot['totalViews'] ?? 0,
    },
  }), headers: _json);
}
