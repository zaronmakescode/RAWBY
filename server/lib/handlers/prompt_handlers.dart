// ============================================================
// RAWBY — Prompt Handler
// Routes to Groq or OpenAI with the canonical RAWBY system prompt.
// Falls back to a deterministic local payload if keys missing.
// ============================================================
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shelf/shelf.dart';

const _jsonHeaders = {'content-type': 'application/json'};

const _systemPrompt = '''
You write hyper-specific weekly story prompts for a SOLO videographer who films themselves. Write in English. Keep writing clear and direct: short sentences, common vocabulary, no jargon, no flowery language. Output ONLY a JSON array with exactly 3 objects. Each object has these keys:
- text: the prompt itself (the scene the videographer will shoot). 100 to 160 words. Describe the exact location, time of day, what the videographer does in the scene, what objects are present, what changes or happens, and the mood. Be cinematic and specific — name surfaces, textures, weather, the position of light, small actions. Do NOT include camera or shooting instructions in text; those go in the shots array.
- shots: an array of 3 to 5 strings. Each string is one specific camera angle or shot. Start each shot with WHEN in the scene to use it (e.g. "Opening — ", "When they pick up the phone — ", "Final shot — "). Then include lens focal length, camera movement, lighting direction, and framing. CRITICAL: For Sequence and Short Story levels, the videographer is ALONE — there is nobody behind the camera. ALL shots must be achievable solo: tripod, locked-off, timer, or camera placed on a surface. Do NOT suggest handheld tracking, dolly, or pan-follows for these levels (nobody is there to operate the camera while the subject is in frame). Handheld shots are ONLY allowed when shooting objects/details with nobody in frame, or for the Story + Character level where a friend can hold the camera. Each shot: 15-25 words.
- outcome: one sentence naming the closing image or what the viewer sees at the end. Concrete and visual.
- purpose: one sentence stating the message, takeaway, or reason behind the story.
- emotion: 1 to 3 short emotion words separated by commas (e.g. "quiet relief, doubt").
- inspiration: the creator's handle you chose for this prompt.
- category: a short snake_case tag that YOU invent. Pick a fresh, specific theme for each prompt (e.g. "fading_routine", "night_bus_home", "kitchen_doubt"). Never reuse the same category between prompts.
- level: one of "Sequence", "Short Story", "Story + Character".
- points: 10, 30, or 50 matching the level.
- songs: an array of exactly 3 objects, each with "title" (song name), "artist" (performer), "tier" (MUST be exactly one of: "best_match", "trending", "classic_fit"), and "why" (one sentence on why it fits). The 3 songs MUST follow this EXACT structure:
  1. First song: tier MUST be "best_match" — the song that genuinely fits the story mood and energy best, any era, any popularity level.
  2. Second song: tier MUST be "trending" — a song that is currently trending and popular on Instagram Reels or TikTok (2024-2026), that also fits the theme reasonably well. Pick songs people actually use in short-form video right now.
  3. Third song: tier MUST be "classic_fit" — a song that is still popular and widely recognized (not necessarily brand new), and fits the mood well. Think timeless hits or recent classics people still listen to.
IMPORTANT: The tier field MUST be exactly "best_match", "trending", or "classic_fit" — do not use any other values.
- licenseFreeKeywords: an array of 2-3 search keywords/phrases the user can type into a royalty-free music library (like Epidemic Sound, Artlist, or YouTube Audio Library) to find similar-sounding tracks. Be specific about mood and genre, e.g. "ambient piano melancholy" or "lo-fi warm acoustic morning".
No markdown, no commentary, no trailing prose. Just the JSON array.
''';

String _userPrompt({
  required List<Map<String, dynamic>> inspirations,
  required String region,
  required bool seasonalPrompts,
}) {
  final inspirationGuide = inspirations
      .map((i) =>
          '${i['handle']} (${i['profileUrl'] ?? ''}): ${i['style']}. Reference hint: ${i['referenceHint']}')
      .join('\n');

  final locationHint = _buildLocationHint(region: region, seasonal: seasonalPrompts);

  return '''
Create 3 weekly prompts. Each prompt MUST be a CONCRETE scenario, not abstract. Bad: "a conversation about life". Good: "you sit in your kitchen at 6 AM, rain streaking the window, staring at a job offer email on your phone. The espresso machine hisses. A half-packed suitcase is open on the floor. You trace the rim of the mug with your thumb. You pick up the phone, put it down, then open the kitchen window and let the cold air in. Outside the street is empty. You stand there breathing and decide nothing."

The text field MUST be 100 to 160 words. Describe the scene in cinematic detail: location, time, light, objects, small specific actions, the emotional arc. Do NOT put camera instructions in text — those go in the shots array.

The shots array MUST contain 3 to 5 specific shot descriptions. Each shot MUST start with WHEN in the story to use it (e.g. "Opening —", "When they look away —", "Final shot —"). Then include focal length, movement, lighting, and framing. This is a shot list the videographer follows in order.

SONG SUGGESTIONS: For each prompt, include a "songs" array with exactly 3 objects. Each song has: title, artist, tier, why.
- Song 1 (tier: "best_match"): the song that fits the story mood and energy best. Any era, any popularity.
- Song 2 (tier: "trending"): a song currently trending and popular on Instagram Reels / TikTok (2024-2026). Must also fit the theme.
- Song 3 (tier: "classic_fit"): a song that's still popular and widely known, and fits the mood well. Think timeless or recent classics.
CRITICAL: Use EXACTLY these tier values: "best_match", "trending", "classic_fit". Do not use any other tier names.
Also include "licenseFreeKeywords" — 2-3 search phrases for royalty-free music libraries.

LEVEL RULES (strict):
- Prompt 1: level "Sequence", points 10. PURE VISUAL SEQUENCE. No talking, no dialogue. Music + sound + image only. The videographer is COMPLETELY ALONE. Every shot is either: (a) the camera on a tripod/surface filming the videographer, or (b) the videographer holding the camera filming objects, textures, landscapes (no person in frame). Do NOT suggest tracking shots, dolly moves, or handheld follow shots when the person is in frame — there is nobody to operate the camera.
- Prompt 2: level "Short Story", points 30. Solo videographer is the ONLY person on screen. They film themselves using tripod, timer, or camera placed on surfaces. Same camera rules as Sequence: no handheld shots with the person in frame. One spoken line maximum, or none.
- Prompt 3: level "Story + Character", points 50. The solo videographer plus 1 or 2 friends on screen. Since another person is present, handheld tracking shots, pan-follows, and shoulder rigs ARE allowed here. Light dialogue allowed but minimal.

CATEGORY RULES: YOU choose a fresh snake_case theme for each. Never reuse between prompts.
OUTCOME: the closing image or final frame. Concrete. One sentence.
PURPOSE: the message or feeling the viewer walks away with. Plain language. One sentence.
EMOTION: 1-3 short words. Match the mood.

VARIETY RULES (strict — enforce these across the 3 prompts):
1. LOCATION DIVERSITY: The 3 prompts MUST have different location types. Do NOT send 3 indoor/apartment scenes. Do NOT send 3 city street scenes. Mix freely from: indoor (home, kitchen, bedroom, bathroom, hotel, cafe), outdoor nature (park, forest, beach, mountain, river, field, garden), urban exterior (street, alley, bridge, parking lot, bus station, market), hybrid (balcony, window, threshold, stairwell, hallway, courtyard). AT LEAST ONE prompt should feature outdoor nature or natural landscape.
2. SCENARIO DIVERSITY: The 3 stories must have different emotional cores and activities. If one is about decision-making/uncertainty, the next should be action/exploration, the next should be observation/acceptance. Avoid repetitive emotions across all 3 (e.g. don't send 3 prompts about doubt/regret, or 3 about joy/celebration).
3. TIME OF DAY VARIETY: Spread the prompts across different times: one at dawn/early morning, one at midday/afternoon, one at dusk/evening/night. Not all in the blue hour.
4. SHOOTING STYLE VARIETY: For Sequences, vary between: pure visual observation, fast montage, single repeated action, or material/texture study. For Short Stories, vary between: internal emotional moment, external action moment, intimate scale vs. wide environment. For Story + Character stories, vary interaction types (conversation vs. shared activity vs. parallel action).
5. PROPS AND OBJECT DENSITY: One prompt should be sparse/minimal (few objects, empty space), one should be prop-rich/detailed environment, one should be medium. Avoid all 3 being cluttered or all 3 being empty.

Inspiration (pick one per prompt; match their visual style):
$inspirationGuide

Set inspiration to the chosen handle only.$locationHint
''';
}

String _buildLocationHint({required String region, required bool seasonal}) {
  if (region.isEmpty && !seasonal) return '';

  final buf = StringBuffer('\n\nREGIONAL CONTEXT:');
  if (region.isNotEmpty) {
    buf.write(
        '\n- Setting: $region. Locations, plants, weather, architecture and street life must be plausible for this region.');
  }
  if (seasonal) {
    final now = DateTime.now().toUtc();
    final season = _seasonFor(now.month, region);
    buf.write(
        '\n- Current season: $season. ONE of the 3 prompts must lean into this season. The other two may be neutral but none may contradict the season.');
  }
  return buf.toString();
}

String _seasonFor(int month, String region) {
  final southern = region.toLowerCase().contains('australia') ||
      region.toLowerCase().contains('south america') ||
      region.toLowerCase().contains('southern africa');
  final map = southern
      ? {
          12: 'summer', 1: 'summer', 2: 'summer',
          3: 'autumn', 4: 'autumn', 5: 'autumn',
          6: 'winter', 7: 'winter', 8: 'winter',
          9: 'spring', 10: 'spring', 11: 'spring',
        }
      : {
          12: 'winter', 1: 'winter', 2: 'winter',
          3: 'spring', 4: 'spring', 5: 'spring',
          6: 'summer', 7: 'summer', 8: 'summer',
          9: 'autumn', 10: 'autumn', 11: 'autumn',
        };
  return map[month] ?? 'spring';
}

Future<Response> handleGeneratePrompts(Request request) async {
  try {
    final body = await request.readAsString();
    final data = body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(body) as Map<String, dynamic>;

    final provider = (data['provider'] as String? ?? 'groq').toLowerCase();
    final model = data['model'] as String? ??
        (provider == 'openai' ? 'gpt-4o' : 'llama-3.3-70b-versatile');
    final inspirations = (data['inspirations'] as List<dynamic>? ?? [])
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
    final region = data['region'] as String? ?? '';
    final seasonalPrompts = data['seasonalPrompts'] as bool? ?? false;

    final userPromptText = _userPrompt(
      inspirations: inspirations,
      region: region,
      seasonalPrompts: seasonalPrompts,
    );

    final rawText = provider == 'openai'
        ? await _callOpenAi(model: model, userPrompt: userPromptText)
        : await _callGroq(model: model, userPrompt: userPromptText);

    final prompts = _parsePrompts(rawText);
    return Response.ok(jsonEncode({'prompts': prompts}), headers: _jsonHeaders);
  } catch (e, st) {
    stderr.writeln('[generate-prompts] $e\n$st');
    return Response.internalServerError(
      body: jsonEncode({'error': e.toString()}),
      headers: _jsonHeaders,
    );
  }
}

Future<String> _callGroq({required String model, required String userPrompt}) async {
  final key = Platform.environment['GROQ_API_KEY'];
  if (key == null || key.isEmpty) {
    throw StateError('GROQ_API_KEY not set');
  }
  final res = await http.post(
    Uri.parse('https://api.groq.com/openai/v1/chat/completions'),
    headers: {
      'Authorization': 'Bearer $key',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'model': model,
      'temperature': 0.85,
      'max_tokens': 8000,
      'response_format': {'type': 'json_object'},
      'messages': [
        {'role': 'system', 'content': _systemPrompt},
        {'role': 'user', 'content': userPrompt},
      ],
    }),
  );
  if (res.statusCode >= 400) {
    throw HttpException('Groq ${res.statusCode}: ${res.body}');
  }
  return _extractContent(res.body, 'Groq');
}

Future<String> _callOpenAi({required String model, required String userPrompt}) async {
  final key = Platform.environment['OPENAI_API_KEY'];
  if (key == null || key.isEmpty) {
    throw StateError('OPENAI_API_KEY not set');
  }
  final res = await http.post(
    Uri.parse('https://api.openai.com/v1/chat/completions'),
    headers: {
      'Authorization': 'Bearer $key',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'model': model,
      'temperature': 0.85,
      'max_tokens': 8000,
      'response_format': {'type': 'json_object'},
      'messages': [
        {'role': 'system', 'content': _systemPrompt},
        {'role': 'user', 'content': userPrompt},
      ],
    }),
  );
  if (res.statusCode >= 400) {
    throw HttpException('OpenAI ${res.statusCode}: ${res.body}');
  }
  return _extractContent(res.body, 'OpenAI');
}

String _extractContent(String responseBody, String label) {
  final body = jsonDecode(responseBody) as Map<String, dynamic>;
  final choices = body['choices'] as List<dynamic>?;
  if (choices == null || choices.isEmpty) {
    throw StateError('Empty $label response');
  }
  final first = choices.first as Map<String, dynamic>;
  final message = first['message'] as Map<String, dynamic>?;
  final content = message?['content'] as String?;
  if (content == null || content.isEmpty) {
    throw StateError('Empty $label content');
  }
  return content;
}

List<Map<String, dynamic>> _parsePrompts(String raw) {
  final cleaned = _stripFences(raw).trim();
  final decoded = jsonDecode(cleaned);

  List<dynamic> arr;
  if (decoded is List) {
    arr = decoded;
  } else if (decoded is Map<String, dynamic>) {
    arr = (decoded['prompts'] ??
            decoded['data'] ??
            decoded['items'] ??
            decoded.values.firstWhere((v) => v is List, orElse: () => []))
        as List<dynamic>;
  } else {
    throw StateError('Unexpected JSON shape');
  }

  return arr.take(3).map((e) {
    final m = Map<String, dynamic>.from(e as Map);
    final songs = (m['songs'] as List<dynamic>? ?? []).map((s) {
      final sm = Map<String, dynamic>.from(s as Map);
      final tier = sm['tier'] as String? ?? sm['type'] as String? ?? 'best_match';
      return {
        'title': sm['title'] ?? '',
        'artist': sm['artist'] ?? '',
        'type': tier,
        'whyItWorks': sm['why'] ?? sm['whyItWorks'] ?? '',
      };
    }).toList();
    return {
      'text': m['text'] ?? '',
      'shots': m['shots'] ?? [],
      'outcome': m['outcome'] ?? '',
      'purpose': m['purpose'] ?? '',
      'emotion': m['emotion'] ?? '',
      'inspiration': m['inspiration'] ?? '',
      'category': m['category'] ?? '',
      'level': m['level'] ?? 'Sequence',
      'points': m['points'] ?? 10,
      'songs': songs,
      'licenseFreeKeywords': m['licenseFreeKeywords'] ?? [],
    };
  }).toList();
}

String _stripFences(String s) {
  var out = s.trim();
  if (out.startsWith('```')) {
    final firstNewline = out.indexOf('\n');
    if (firstNewline != -1) out = out.substring(firstNewline + 1);
    if (out.endsWith('```')) out = out.substring(0, out.length - 3);
  }
  return out;
}
