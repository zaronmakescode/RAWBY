// ============================================================
// RAWBY — AI Chat Handler (Groq / llama-3.3-70b-versatile)
// Real conversation with full message history.
// ============================================================
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shelf/shelf.dart';

const _json = {'content-type': 'application/json'};

const _chatSystemPrompt = '''
You are Aurora, the AI filmmaking co-pilot for RAWBY — a weekly challenge app for solo videographers.

Personality: direct, cinematic, no fluff. Speak like an experienced filmmaker friend, not a textbook. Short sharp answers. Be specific — name techniques, tools, frame rates, focal lengths when relevant.

You help with:
- Story development, script ideas, creative direction for short films and Reels
- Solo shot techniques (tripod, timer, surface placement — the user shoots alone, no crew)
- Camera settings, lighting, colour grading, VFX, sound design
- Instagram Reels strategy (hooks, captions, trending audio, posting timing)
- Workflow planning within the RAWBY weekly cycle:
  Friday: song selection + prompt locked
  Sat-Sun: filming
  Mon-Tue: rough edit
  Tue-Wed: VFX and text overlays
  Tue-Wed: SFX and sound design
  Wed-Thu: colour grading
  Friday: polish and publish
- App navigation (home, prompts, gear, leaderboard, settings, idea bank)
- Holiday mode: the user can plan a trip ahead. Help them shape a prompt for it. When they like one, tell them to hit "Plan a trip" to save it with a date and a filming window — the app drops that prompt in automatically on the day, so they can film a multi-day trip without the Friday cycle.

You remember the user across sessions. The Context line carries what you know — their recent films, gear, location, durable notes, and upcoming trips. Use it: avoid suggesting ideas close to films they've already made, and tailor to their kit and where they shoot.

Scoring: Sequence = 10 pts, Short Story = 30 pts, Story + Character = 50 pts.
Late penalty multipliers: 0.9x day 1, 0.75x day 2, 0.5x day 3 or more.

Rules:
- Keep responses under 150 words
- No markdown formatting — no asterisks, no hashes, no dashes for bullets
- Use plain conversational sentences or short numbered points
- Be actionable and direct
- If you do not know something, say so honestly
''';

const _skillSystemPrompt = '''
You are Aurora, a filmmaking coach inside the RAWBY app. The user is asking for a personalised skill improvement plan.

Be specific, actionable, and direct. Give a concrete plan for the next 1-2 weeks targeting their focus area. Reference their actual stats when they are provided. Keep the response under 200 words. No markdown formatting.
''';

String _buildContextNote(Map<String, dynamic> ctx) {
  final parts = <String>[];
  if (ctx['displayName'] != null && (ctx['displayName'] as String).isNotEmpty) {
    parts.add('name: ${ctx['displayName']}');
  }
  if (ctx['rank'] != null) parts.add('rank: ${ctx['rank']}');
  if (ctx['totalScore'] != null) parts.add('total score: ${ctx['totalScore']} pts');
  if (ctx['streak'] != null) parts.add('streak: ${ctx['streak']} weeks');
  if (ctx['completedWeeks'] != null) parts.add('weeks completed: ${ctx['completedWeeks']}');
  if (ctx['avgLikes'] != null) parts.add('avg likes: ${ctx['avgLikes']}');
  if (ctx['regensLeft'] != null) parts.add('regens left this week: ${ctx['regensLeft']}');
  if (ctx['daysLeft'] != null) parts.add('days until deadline: ${ctx['daysLeft']}');
  if (ctx['promptLevel'] != null) parts.add('current prompt level: ${ctx['promptLevel']}');
  if (ctx['promptText'] != null) {
    final t = (ctx['promptText'] as String).trim();
    if (t.isNotEmpty) {
      final preview = t.length > 120 ? '${t.substring(0, 120)}...' : t;
      parts.add('active prompt: "$preview"');
    }
  }
  if (ctx['note'] != null && (ctx['note'] as String).trim().isNotEmpty) {
    parts.add('quick note: "${(ctx['note'] as String).trim()}"');
  }
  if (ctx['location'] != null && (ctx['location'] as String).trim().isNotEmpty) {
    parts.add('shoots around: ${ctx['location']}');
  }
  if (ctx['style'] != null && (ctx['style'] as String).trim().isNotEmpty) {
    parts.add('style: ${ctx['style']}');
  }

  String joinList(dynamic v, {int max = 6}) {
    if (v is! List) return '';
    final items = v.map((e) => e.toString()).where((s) => s.trim().isNotEmpty).take(max).toList();
    return items.join('; ');
  }

  final gear = joinList(ctx['gear']);
  if (gear.isNotEmpty) parts.add('owns gear: $gear');
  final films = joinList(ctx['films']);
  if (films.isNotEmpty) parts.add('recent films: $films');
  final memory = joinList(ctx['memory']);
  if (memory.isNotEmpty) parts.add('remember: $memory');
  final trips = joinList(ctx['trips']);
  if (trips.isNotEmpty) parts.add('upcoming trips: $trips');

  if (parts.isEmpty) return '';
  return '[Context: ${parts.join(' | ')}]';
}

Future<String> _callGroq({
  required String systemPrompt,
  required List<Map<String, dynamic>> messages,
  int maxTokens = 400,
}) async {
  final key = Platform.environment['GROQ_API_KEY'];
  if (key == null || key.isEmpty) throw StateError('GROQ_API_KEY not set');

  final res = await http.post(
    Uri.parse('https://api.groq.com/openai/v1/chat/completions'),
    headers: {
      'Authorization': 'Bearer $key',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'model': 'llama-3.3-70b-versatile',
      'temperature': 0.75,
      'max_tokens': maxTokens,
      'messages': [
        {'role': 'system', 'content': systemPrompt},
        ...messages,
      ],
    }),
  );

  if (res.statusCode >= 400) {
    throw StateError('Groq ${res.statusCode}: ${res.body}');
  }

  final data = jsonDecode(res.body) as Map<String, dynamic>;
  final reply = ((data['choices'] as List).first as Map)['message']['content'] as String;
  return reply.trim();
}

Future<String> _callClaude({
  required String systemPrompt,
  required List<Map<String, dynamic>> messages,
  int maxTokens = 400,
}) async {
  final key = Platform.environment['ANTHROPIC_API_KEY'];
  if (key == null || key.isEmpty) throw StateError('ANTHROPIC_API_KEY not set');

  final res = await http.post(
    Uri.parse('https://api.anthropic.com/v1/messages'),
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'model': 'claude-sonnet-4-6',
      'max_tokens': maxTokens,
      'system': systemPrompt,
      'messages': messages,
    }),
  );

  if (res.statusCode >= 400) {
    throw StateError('Anthropic ${res.statusCode}: ${res.body}');
  }

  final data = jsonDecode(res.body) as Map<String, dynamic>;
  final content = (data['content'] as List).first as Map;
  return (content['text'] as String).trim();
}

Future<Response> handleAiChat(Request request) async {
  try {
    final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
    final rawMessages = body['messages'] as List<dynamic>? ?? [];
    final ctx = body['context'] as Map<String, dynamic>? ?? {};
    final provider = (body['provider'] as String? ?? 'groq').toLowerCase();

    if (rawMessages.isEmpty) {
      return Response(400, body: jsonEncode({'error': 'messages required'}), headers: _json);
    }

    final messages = rawMessages
        .map((m) => Map<String, dynamic>.from(m as Map))
        .toList();

    // Inject context note into the first user message
    final contextNote = _buildContextNote(ctx);
    if (contextNote.isNotEmpty) {
      for (int i = 0; i < messages.length; i++) {
        if (messages[i]['role'] == 'user') {
          messages[i] = {
            'role': 'user',
            'content': '${messages[i]['content']}\n\n$contextNote',
          };
          break;
        }
      }
    }

    final reply = provider == 'claude'
        ? await _callClaude(
            systemPrompt: _chatSystemPrompt,
            messages: messages,
            maxTokens: 400,
          )
        : await _callGroq(
            systemPrompt: _chatSystemPrompt,
            messages: messages,
            maxTokens: 400,
          );

    return Response.ok(jsonEncode({'reply': reply}), headers: _json);
  } catch (e, st) {
    stderr.writeln('[ai-chat] $e\n$st');
    return Response.internalServerError(
      body: jsonEncode({'error': e.toString()}),
      headers: _json,
    );
  }
}

Future<Response> handleSkillFeedback(Request request) async {
  try {
    final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
    final focusArea = body['focusArea'] as String? ?? 'general filmmaking';
    final notes = body['notes'] as String? ?? '';
    final stats = body['stats'] as Map<String, dynamic>? ?? {};
    final provider = (body['provider'] as String? ?? 'groq').toLowerCase();

    final userMessage = [
      'Focus area: $focusArea',
      if (notes.isNotEmpty) 'Additional notes: $notes',
      if (stats.isNotEmpty) 'Stats: total score ${stats['totalScore'] ?? 0} pts, '
          'avg likes ${stats['avgLikes'] ?? 0}, streak ${stats['streak'] ?? 0} weeks, '
          '${stats['projectsCompleted'] ?? 0} projects completed.',
    ].join('\n');

    final reply = provider == 'claude'
        ? await _callClaude(
            systemPrompt: _skillSystemPrompt,
            messages: [{'role': 'user', 'content': userMessage}],
            maxTokens: 500,
          )
        : await _callGroq(
            systemPrompt: _skillSystemPrompt,
            messages: [{'role': 'user', 'content': userMessage}],
            maxTokens: 500,
          );

    return Response.ok(jsonEncode({'feedback': reply}), headers: _json);
  } catch (e, st) {
    stderr.writeln('[skill-feedback] $e\n$st');
    return Response.internalServerError(
      body: jsonEncode({'error': e.toString()}),
      headers: _json,
    );
  }
}
