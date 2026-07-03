import 'dart:convert';
import 'package:shelf/shelf.dart';
import '../auth.dart';
import '../store.dart';

final _json = {'content-type': 'application/json'};

/// GET /api/spots — every community shooting spot (any auth user, newest first).
Future<Response> handleGetSpots(Request request) async {
  final spots = await Store.instance.getSpots();
  return Response.ok(jsonEncode({'spots': spots}), headers: _json);
}

/// POST /api/spots — pin a shooting spot for everyone.
/// Body: { name, lat, lng, note? }
Future<Response> handleAddSpot(Request request) async {
  final userId = getUserId(request);
  final username = getUsername(request);

  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  final name = (body['name'] as String?)?.trim() ?? '';
  final note = (body['note'] as String?)?.trim() ?? '';
  final lat = (body['lat'] as num?)?.toDouble();
  final lng = (body['lng'] as num?)?.toDouble();

  if (name.length < 2 || name.length > 80) {
    return Response(400, body: jsonEncode({'error': 'Name must be 2–80 chars'}), headers: _json);
  }
  if (note.length > 200) {
    return Response(400, body: jsonEncode({'error': 'Note must be ≤200 chars'}), headers: _json);
  }
  if (lat == null || lng == null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return Response(400, body: jsonEncode({'error': 'Valid lat/lng required'}), headers: _json);
  }

  final id = await Store.instance.addSpot({
    'userId': userId,
    'by': username,
    'name': name,
    'note': note.isEmpty ? null : note,
    'lat': lat,
    'lng': lng,
  });

  return Response.ok(jsonEncode({'id': id}), headers: _json);
}

/// DELETE /api/spots/:id — owner or admin removes a spot.
Future<Response> handleDeleteSpot(Request request, String id) async {
  final userId = getUserId(request);
  final user = await Store.instance.getUserById(userId);
  final role = user?['role'] as String? ?? '';
  final username = user?['username'] as String? ?? '';
  final isAdmin = role == 'admin' || username == 'zaron.films';

  final spot = await Store.instance.getSpotById(id);
  if (spot == null) {
    return Response(404, body: jsonEncode({'error': 'Spot not found'}), headers: _json);
  }
  if (!isAdmin && spot['userId'] != userId) {
    return Response(403, body: jsonEncode({'error': 'Not your spot'}), headers: _json);
  }

  await Store.instance.deleteSpot(id);
  return Response.ok(jsonEncode({'ok': true}), headers: _json);
}
