import 'dart:convert';
import 'package:shelf/shelf.dart';
import '../auth.dart';
import '../store.dart';

final _json = {'content-type': 'application/json'};

// POST /api/suggestions — submit suggestion (any auth user)
Future<Response> handleSubmitSuggestion(Request request) async {
  final claims = request.context['claims'] as Map<String, dynamic>;
  final userId = claims['sub'] as String;
  final username = claims['username'] as String? ?? '';

  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  final text = (body['text'] as String?)?.trim() ?? '';
  if (text.isEmpty || text.length > 1000) {
    return Response(400, body: jsonEncode({'error': 'Text must be 1–1000 chars'}), headers: _json);
  }

  final id = await Store.instance.addSuggestion({
    'userId': userId,
    'username': username,
    'text': text,
    'adminReply': null,
    'repliedAt': null,
  });

  return Response.ok(jsonEncode({'id': id, 'message': 'Suggestion submitted'}), headers: _json);
}

// GET /api/suggestions — get user's own suggestions
Future<Response> handleGetMySuggestions(Request request) async {
  final claims = request.context['claims'] as Map<String, dynamic>;
  final userId = claims['sub'] as String;
  final suggestions = await Store.instance.getSuggestionsForUser(userId);
  return Response.ok(jsonEncode({'suggestions': suggestions}), headers: _json);
}

// GET /api/admin/suggestions — get all suggestions (admin only)
Future<Response> handleGetAllSuggestions(Request request) async {
  final claims = request.context['claims'] as Map<String, dynamic>;
  final isAdmin = claims['isAdmin'] == true;
  if (!isAdmin) return Response(403, body: jsonEncode({'error': 'Admin only'}), headers: _json);
  final suggestions = await Store.instance.getAllSuggestions();
  return Response.ok(jsonEncode({'suggestions': suggestions}), headers: _json);
}

// POST /api/admin/suggestions/:id/reply — admin replies (admin only)
Future<Response> handleReplySuggestion(Request request, String id) async {
  final claims = request.context['claims'] as Map<String, dynamic>;
  final isAdmin = claims['isAdmin'] == true;
  if (!isAdmin) return Response(403, body: jsonEncode({'error': 'Admin only'}), headers: _json);

  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  final reply = (body['reply'] as String?)?.trim() ?? '';
  if (reply.isEmpty) {
    return Response(400, body: jsonEncode({'error': 'Reply required'}), headers: _json);
  }

  await Store.instance.replySuggestion(id, reply);
  return Response.ok(jsonEncode({'message': 'Reply saved'}), headers: _json);
}
