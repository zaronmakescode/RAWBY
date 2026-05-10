import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:shelf/shelf.dart';

// ── Config ───────────────────────────────────────────────────────
// In production, use env vars for the secret
const _jwtSecret = 'rawby_jwt_secret_change_me_in_production';
const _tokenExpiry = Duration(days: 30);

// ── Password Hashing ─────────────────────────────────────────────

String hashPassword(String password) {
  final bytes = utf8.encode(password);
  return sha256.convert(bytes).toString();
}

bool verifyPassword(String password, String hash) {
  return hashPassword(password) == hash;
}

// ── JWT ──────────────────────────────────────────────────────────

String generateToken(String userId, String username) {
  final jwt = JWT({
    'sub': userId,
    'username': username,
    'iat': DateTime.now().millisecondsSinceEpoch ~/ 1000,
  });
  return jwt.sign(
    SecretKey(_jwtSecret),
    expiresIn: _tokenExpiry,
  );
}

Map<String, dynamic>? verifyToken(String token) {
  try {
    final jwt = JWT.verify(token, SecretKey(_jwtSecret));
    return jwt.payload as Map<String, dynamic>;
  } catch (_) {
    return null;
  }
}

// ── Middleware ────────────────────────────────────────────────────

/// Extracts userId from the Authorization header and adds it to request context.
Middleware authMiddleware() {
  return (Handler innerHandler) {
    return (Request request) {
      final authHeader = request.headers['authorization'];
      if (authHeader == null || !authHeader.startsWith('Bearer ')) {
        return Response(401, body: jsonEncode({'error': 'Unauthorized'}));
      }

      final token = authHeader.substring(7);
      final payload = verifyToken(token);
      if (payload == null) {
        return Response(401, body: jsonEncode({'error': 'Invalid or expired token'}));
      }

      final updatedRequest = request.change(context: {
        'userId': payload['sub'] as String,
        'username': payload['username'] as String,
      });
      return innerHandler(updatedRequest);
    };
  };
}

/// Helper to get userId from request context
String getUserId(Request request) => request.context['userId'] as String;
String getUsername(Request request) => request.context['username'] as String;
