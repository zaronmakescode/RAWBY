// ============================================================
// RAWBY — Prompt Model
// ============================================================
import 'package:hive/hive.dart';


@HiveType(typeId: 1)
class SongSuggestion extends HiveObject {
  @HiveField(0)
  final String type; // 'best_match', 'trending', 'classic_fit'

  @HiveField(1)
  final String title;

  @HiveField(2)
  final String artist;

  @HiveField(3)
  final String whyItWorks;

  SongSuggestion({
    required this.type,
    required this.title,
    required this.artist,
    required this.whyItWorks,
  });

  factory SongSuggestion.fromJson(Map<String, dynamic> json) => SongSuggestion(
        type: json['type'] as String? ?? '',
        title: json['title'] as String? ?? '',
        artist: json['artist'] as String? ?? '',
        whyItWorks: json['whyItWorks'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {
        'type': type,
        'title': title,
        'artist': artist,
        'whyItWorks': whyItWorks,
      };
}

@HiveType(typeId: 2)
class PromptModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String level; // 'Sequence', 'Short Story', 'Story + Character'

  @HiveField(2)
  final int points; // 10, 30, or 50

  @HiveField(3)
  final String category;

  @HiveField(4)
  final String inspiration; // creator handle

  @HiveField(5)
  final String inspirationStyle;

  @HiveField(6)
  final String inspirationProfileUrl;

  @HiveField(7)
  final String inspirationReferenceHint;

  @HiveField(8)
  final String inspirationVideoUrl;

  @HiveField(9)
  final String text;

  @HiveField(10)
  final List<String> shots;

  @HiveField(11)
  final List<SongSuggestion> songs;

  @HiveField(12)
  final List<String> licenseFreeKeywords;

  @HiveField(13)
  final String outcome;

  @HiveField(14)
  final String purpose;

  @HiveField(15)
  final String emotion;

  @HiveField(16)
  final String source; // 'local', 'ai', 'custom', 'big'

  @HiveField(17)
  final bool isSaved;

  @HiveField(18)
  final DateTime? savedAt;

  PromptModel({
    required this.id,
    required this.level,
    required this.points,
    required this.category,
    required this.inspiration,
    this.inspirationStyle = '',
    this.inspirationProfileUrl = '',
    this.inspirationReferenceHint = '',
    this.inspirationVideoUrl = '',
    required this.text,
    this.shots = const [],
    this.songs = const [],
    this.licenseFreeKeywords = const [],
    this.outcome = '',
    this.purpose = '',
    this.emotion = '',
    required this.source,
    this.isSaved = false,
    this.savedAt,
  });

  PromptModel copyWith({
    String? id,
    String? level,
    int? points,
    String? category,
    String? inspiration,
    String? inspirationStyle,
    String? inspirationProfileUrl,
    String? inspirationReferenceHint,
    String? inspirationVideoUrl,
    String? text,
    List<String>? shots,
    List<SongSuggestion>? songs,
    List<String>? licenseFreeKeywords,
    String? outcome,
    String? purpose,
    String? emotion,
    String? source,
    bool? isSaved,
    DateTime? savedAt,
  }) {
    return PromptModel(
      id: id ?? this.id,
      level: level ?? this.level,
      points: points ?? this.points,
      category: category ?? this.category,
      inspiration: inspiration ?? this.inspiration,
      inspirationStyle: inspirationStyle ?? this.inspirationStyle,
      inspirationProfileUrl:
          inspirationProfileUrl ?? this.inspirationProfileUrl,
      inspirationReferenceHint:
          inspirationReferenceHint ?? this.inspirationReferenceHint,
      inspirationVideoUrl: inspirationVideoUrl ?? this.inspirationVideoUrl,
      text: text ?? this.text,
      shots: shots ?? this.shots,
      songs: songs ?? this.songs,
      licenseFreeKeywords: licenseFreeKeywords ?? this.licenseFreeKeywords,
      outcome: outcome ?? this.outcome,
      purpose: purpose ?? this.purpose,
      emotion: emotion ?? this.emotion,
      source: source ?? this.source,
      isSaved: isSaved ?? this.isSaved,
      savedAt: savedAt ?? this.savedAt,
    );
  }

  factory PromptModel.fromJson(Map<String, dynamic> json) => PromptModel(
        id: json['id'] as String? ?? '',
        level: json['level'] as String? ?? 'Sequence',
        points: (json['points'] as num?)?.toInt() ?? 10,
        category: json['category'] as String? ?? '',
        inspiration: json['inspiration'] as String? ?? '',
        inspirationStyle: json['inspirationStyle'] as String? ?? '',
        inspirationProfileUrl: json['inspirationProfileUrl'] as String? ?? '',
        inspirationReferenceHint:
            json['inspirationReferenceHint'] as String? ?? '',
        inspirationVideoUrl: json['inspirationVideoUrl'] as String? ?? '',
        text: json['text'] as String? ?? '',
        shots: (json['shots'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        songs: (json['songs'] as List<dynamic>?)
                ?.map((e) => SongSuggestion.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        licenseFreeKeywords: (json['licenseFreeKeywords'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        outcome: json['outcome'] as String? ?? '',
        purpose: json['purpose'] as String? ?? '',
        emotion: json['emotion'] as String? ?? '',
        source: json['source'] as String? ?? 'local',
        isSaved: json['isSaved'] as bool? ?? false,
        savedAt: json['savedAt'] != null
            ? DateTime.tryParse(json['savedAt'] as String)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'level': level,
        'points': points,
        'category': category,
        'inspiration': inspiration,
        'inspirationStyle': inspirationStyle,
        'inspirationProfileUrl': inspirationProfileUrl,
        'inspirationReferenceHint': inspirationReferenceHint,
        'inspirationVideoUrl': inspirationVideoUrl,
        'text': text,
        'shots': shots,
        'songs': songs.map((s) => s.toJson()).toList(),
        'licenseFreeKeywords': licenseFreeKeywords,
        'outcome': outcome,
        'purpose': purpose,
        'emotion': emotion,
        'source': source,
        'isSaved': isSaved,
        'savedAt': savedAt?.toIso8601String(),
      };
}
