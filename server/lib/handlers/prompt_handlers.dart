import 'dart:convert';
import 'dart:math';
import 'package:shelf/shelf.dart';

final _json = {'content-type': 'application/json'};
final _random = Random();

// ── Prompt templates for local AI-style generation ───────────────
const _promptTemplates = [
  'Film a {adj} {subject} using only {technique}.',
  'Create a {length} about {theme} set in {location}.',
  'Tell the story of {character} discovering {object} for the first time.',
  'Capture the feeling of {emotion} through {visualStyle} shots.',
  'Document a {timeframe} in the life of {subject} with {constraint}.',
  'Shoot a {genre} sequence inspired by {inspiration}.',
  'Film {number} perspectives of the same {event}.',
  'Create a visual poem about {abstract} using only {limitation}.',
];

const _adjectives = ['quiet', 'chaotic', 'dreamy', 'gritty', 'surreal', 'intimate', 'epic', 'melancholic'];
const _subjects = ['a stranger', 'your morning routine', 'a forgotten place', 'the city at night', 'nature', 'hands at work', 'a journey'];
const _techniques = ['natural light', 'one continuous shot', 'handheld', 'slow motion', 'time-lapse', 'extreme close-ups', 'reflections'];
const _themes = ['solitude', 'connection', 'transformation', 'time passing', 'home', 'adventure', 'memory'];
const _locations = ['an empty room', 'a crowded street', 'a rooftop', 'the woods', 'a kitchen', 'public transport'];
const _emotions = ['nostalgia', 'anticipation', 'calm', 'anxiety', 'joy', 'loneliness', 'wonder'];
const _genres = ['thriller', 'romance', 'sci-fi', 'documentary', 'horror', 'comedy', 'drama'];
const _levels = ['Sequence', 'Short Story', 'Narrative'];
const _points = [50, 100, 150];

String _pick(List<String> list) => list[_random.nextInt(list.length)];

Map<String, dynamic> _generatePrompt(int index) {
  final levelIndex = _random.nextInt(3);
  final template = _promptTemplates[_random.nextInt(_promptTemplates.length)];

  var text = template
      .replaceFirst('{adj}', _pick(_adjectives))
      .replaceFirst('{subject}', _pick(_subjects))
      .replaceFirst('{technique}', _pick(_techniques))
      .replaceFirst('{theme}', _pick(_themes))
      .replaceFirst('{location}', _pick(_locations))
      .replaceFirst('{emotion}', _pick(_emotions))
      .replaceFirst('{genre}', _pick(_genres))
      .replaceFirst('{length}', _pick(['30-second short', '1-minute film', '2-minute piece']))
      .replaceFirst('{character}', _pick(['a child', 'an old man', 'an artist', 'a worker']))
      .replaceFirst('{object}', _pick(['a letter', 'a mirror', 'music', 'the sea']))
      .replaceFirst('{visualStyle}', _pick(['wide', 'close-up', 'overhead', 'profile']))
      .replaceFirst('{timeframe}', _pick(['24 hours', 'one hour', 'a season']))
      .replaceFirst('{constraint}', _pick(['no dialogue', 'one lens', 'no cuts', 'black and white']))
      .replaceFirst('{number}', _pick(['3', '4', '5']))
      .replaceFirst('{event}', _pick(['meal', 'conversation', 'walk', 'departure']))
      .replaceFirst('{abstract}', _pick(['time', 'distance', 'warmth', 'silence']))
      .replaceFirst('{limitation}', _pick(['shadows', 'textures', 'movement', 'color']))
      .replaceFirst('{inspiration}', _pick(['Kubrick', 'Wong Kar-wai', 'Tarkovsky', 'Miyazaki']));

  return {
    'id': 'ai_${DateTime.now().millisecondsSinceEpoch}_$index',
    'text': text,
    'level': _levels[levelIndex],
    'points': _points[levelIndex],
    'source': 'ai',
  };
}

Future<Response> handleGeneratePrompts(Request request) async {
  // Generate 3 prompts regardless of provider/model (simulated)
  final prompts = List.generate(3, (i) => _generatePrompt(i));

  return Response.ok(jsonEncode({
    'prompts': prompts,
  }), headers: _json);
}
