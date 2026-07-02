// ============================================================
// RAWBY — shared Claude bridge helper.
// All AI handlers (chat, prompts, skill feedback) use this to route
// through the owner's Claude subscription via the Agent SDK bridge.
// Falls back to Groq in each handler's catch block.
// ============================================================
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

/// Call the owner's Claude subscription through the Agent SDK bridge
/// (see /claude-bridge). The bridge service must be running with
/// CLAUDE_CODE_OAUTH_TOKEN set and reachable at [bridgeUrl].
///
/// [allowTools] = true passes "WebSearch" to the bridge — useful only for
/// open-ended chat where real-time info helps. Keep false for prompt
/// generation so the reply stays pure JSON.
Future<String> callClaudeBridge({
  required String bridgeUrl,
  required String systemPrompt,
  required String prompt,
  bool allowTools = false,
}) async {
  final secret = Platform.environment['BRIDGE_SECRET'] ?? '';
  final base   = bridgeUrl.replaceAll(RegExp(r'/+$'), '');

  final res = await http
      .post(
        Uri.parse('$base/complete'),
        headers: {
          'Content-Type': 'application/json',
          if (secret.isNotEmpty) 'X-Bridge-Secret': secret,
        },
        body: jsonEncode({
          'system':     systemPrompt,
          'prompt':     prompt,
          'allowTools': allowTools,
        }),
      )
      .timeout(const Duration(seconds: 120));

  if (res.statusCode >= 400) {
    throw StateError('bridge ${res.statusCode}: ${res.body}');
  }

  final data  = jsonDecode(res.body) as Map<String, dynamic>;
  final reply = (data['reply'] as String?)?.trim() ?? '';
  if (reply.isEmpty) throw StateError('bridge returned empty reply');
  return reply;
}
