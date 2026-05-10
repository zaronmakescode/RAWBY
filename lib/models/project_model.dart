// ============================================================
// RAWBY — Project & History Models
// ============================================================
import 'package:hive/hive.dart';


@HiveType(typeId: 3)
class WorkflowTask extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String label;

  @HiveField(2)
  final String day; // e.g. 'Friday', 'Saturday or Sunday'

  @HiveField(3)
  bool done;

  @HiveField(4)
  DateTime? completedAt;

  WorkflowTask({
    required this.id,
    required this.label,
    this.day = '',
    this.done = false,
    this.completedAt,
  });

  WorkflowTask copyWith({
    String? id,
    String? label,
    String? day,
    bool? done,
    DateTime? completedAt,
  }) {
    return WorkflowTask(
      id: id ?? this.id,
      label: label ?? this.label,
      day: day ?? this.day,
      done: done ?? this.done,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  factory WorkflowTask.fromJson(Map<String, dynamic> json) => WorkflowTask(
        id: json['id'] as String? ?? '',
        label: json['label'] as String? ?? '',
        day: json['day'] as String? ?? '',
        done: json['done'] as bool? ?? false,
        completedAt: json['completedAt'] != null
            ? DateTime.tryParse(json['completedAt'] as String)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'day': day,
        'done': done,
        'completedAt': completedAt?.toIso8601String(),
      };
}

@HiveType(typeId: 4)
class ProjectStartWindow extends HiveObject {
  @HiveField(0)
  final String type; // 'weekly' or 'big'

  @HiveField(1)
  final String label;

  @HiveField(2)
  final DateTime startedAt;

  @HiveField(3)
  final DateTime expiresAt;

  @HiveField(4)
  bool confirmed;

  ProjectStartWindow({
    required this.type,
    required this.label,
    required this.startedAt,
    required this.expiresAt,
    this.confirmed = false,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get isActive => !isExpired || confirmed;

  factory ProjectStartWindow.fromJson(Map<String, dynamic> json) =>
      ProjectStartWindow(
        type: json['type'] as String? ?? 'weekly',
        label: json['label'] as String? ?? '',
        startedAt: DateTime.parse(json['startedAt'] as String),
        expiresAt: DateTime.parse(json['expiresAt'] as String),
        confirmed: json['confirmed'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'type': type,
        'label': label,
        'startedAt': startedAt.toIso8601String(),
        'expiresAt': expiresAt.toIso8601String(),
        'confirmed': confirmed,
      };
}

@HiveType(typeId: 5)
class HistoryEntry extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String weekStart;

  @HiveField(2)
  final String deadline;

  @HiveField(3)
  final String submittedAt;

  @HiveField(4)
  final String? statsRecordedAt;

  @HiveField(5)
  final String promptText;

  @HiveField(6)
  final String level;

  @HiveField(7)
  final int points;

  @HiveField(8)
  final String inspiration;

  @HiveField(9)
  final int likes;

  @HiveField(10)
  final int views;

  @HiveField(11)
  final double penaltyMultiplier;

  @HiveField(12)
  final int finalScore;

  int get score => finalScore;

  @HiveField(13)
  final bool isTestRun;

  @HiveField(14)
  final String instagramUrl;

  @HiveField(15)
  final String createdAt;

  @HiveField(16)
  final String source; // 'local', 'ai', 'custom', 'big'

  HistoryEntry({
    required this.id,
    required this.weekStart,
    required this.deadline,
    required this.submittedAt,
    this.statsRecordedAt,
    required this.promptText,
    required this.level,
    required this.points,
    required this.inspiration,
    this.likes = 0,
    this.views = 0,
    this.penaltyMultiplier = 1.0,
    this.finalScore = 0,
    this.isTestRun = false,
    this.instagramUrl = '',
    required this.createdAt,
    this.source = 'local',
  });

  HistoryEntry copyWith({
    String? id,
    String? weekStart,
    String? deadline,
    String? submittedAt,
    String? statsRecordedAt,
    String? promptText,
    String? level,
    int? points,
    String? inspiration,
    int? likes,
    int? views,
    double? penaltyMultiplier,
    int? finalScore,
    bool? isTestRun,
    String? instagramUrl,
    String? createdAt,
    String? source,
  }) {
    return HistoryEntry(
      id: id ?? this.id,
      weekStart: weekStart ?? this.weekStart,
      deadline: deadline ?? this.deadline,
      submittedAt: submittedAt ?? this.submittedAt,
      statsRecordedAt: statsRecordedAt ?? this.statsRecordedAt,
      promptText: promptText ?? this.promptText,
      level: level ?? this.level,
      points: points ?? this.points,
      inspiration: inspiration ?? this.inspiration,
      likes: likes ?? this.likes,
      views: views ?? this.views,
      penaltyMultiplier: penaltyMultiplier ?? this.penaltyMultiplier,
      finalScore: finalScore ?? this.finalScore,
      isTestRun: isTestRun ?? this.isTestRun,
      instagramUrl: instagramUrl ?? this.instagramUrl,
      createdAt: createdAt ?? this.createdAt,
      source: source ?? this.source,
    );
  }

  factory HistoryEntry.fromJson(Map<String, dynamic> json) => HistoryEntry(
        id: json['id'] as String? ?? '',
        weekStart: json['weekStart'] as String? ?? '',
        deadline: json['deadline'] as String? ?? '',
        submittedAt: json['submittedAt'] as String? ?? '',
        statsRecordedAt: json['statsRecordedAt'] as String?,
        promptText: json['promptText'] as String? ?? '',
        level: json['level'] as String? ?? '',
        points: (json['points'] as num?)?.toInt() ?? 0,
        inspiration: json['inspiration'] as String? ?? '',
        likes: (json['likes'] as num?)?.toInt() ?? 0,
        views: (json['views'] as num?)?.toInt() ?? 0,
        penaltyMultiplier:
            (json['penaltyMultiplier'] as num?)?.toDouble() ?? 1.0,
        finalScore: (json['finalScore'] as num?)?.toInt() ?? 0,
        isTestRun: json['isTestRun'] as bool? ?? false,
        instagramUrl: json['instagramUrl'] as String? ?? '',
        createdAt: json['createdAt'] as String? ?? '',
        source: json['source'] as String? ?? 'local',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'weekStart': weekStart,
        'deadline': deadline,
        'submittedAt': submittedAt,
        'statsRecordedAt': statsRecordedAt,
        'promptText': promptText,
        'level': level,
        'points': points,
        'inspiration': inspiration,
        'likes': likes,
        'views': views,
        'penaltyMultiplier': penaltyMultiplier,
        'finalScore': finalScore,
        'isTestRun': isTestRun,
        'instagramUrl': instagramUrl,
        'createdAt': createdAt,
        'source': source,
      };

  PendingStats toPendingStats() => PendingStats(
        id: 'pending_$id',
        weekStart: weekStart,
        deadline: deadline,
        submittedAt: submittedAt,
        promptText: promptText,
        level: level,
        points: points,
        inspiration: inspiration,
        instagramUrl: instagramUrl,
        dueOn: DateTime.parse(deadline).add(const Duration(days: 7)).toIso8601String(),
      );
}

@HiveType(typeId: 6)
class PendingStats extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String weekStart;

  @HiveField(2)
  final String deadline;

  @HiveField(3)
  final String submittedAt;

  @HiveField(4)
  final String promptText;

  @HiveField(5)
  final String level;

  @HiveField(6)
  final int points;

  @HiveField(7)
  final String inspiration;

  @HiveField(8)
  final String instagramUrl; // New field

  @HiveField(9)
  final String dueOn; // when stats unlock (7 days after deadline)

  PendingStats({
    required this.id,
    required this.weekStart,
    required this.deadline,
    required this.submittedAt,
    required this.promptText,
    required this.level,
    required this.points,
    required this.inspiration,
    this.instagramUrl = '', // Default to empty string
    required this.dueOn,
  });

  PendingStats copyWith({
    String? id,
    String? weekStart,
    String? deadline,
    String? submittedAt,
    String? promptText,
    String? level,
    int? points,
    String? inspiration,
    String? instagramUrl,
    String? dueOn,
  }) {
    return PendingStats(
      id: id ?? this.id,
      weekStart: weekStart ?? this.weekStart,
      deadline: deadline ?? this.deadline,
      submittedAt: submittedAt ?? this.submittedAt,
      promptText: promptText ?? this.promptText,
      level: level ?? this.level,
      points: points ?? this.points,
      inspiration: inspiration ?? this.inspiration,
      instagramUrl: instagramUrl ?? this.instagramUrl,
      dueOn: dueOn ?? this.dueOn,
    );
  }

  int get likes => 0; // Pending stats don't track likes yet
  int get views => 0; // Pending stats don't track views yet

  bool get isReady => DateTime.now().isAfter(DateTime.parse(dueOn));

  factory PendingStats.fromJson(Map<String, dynamic> json) => PendingStats(
        id: json['id'] as String? ?? '',
        weekStart: json['weekStart'] as String? ?? '',
        deadline: json['deadline'] as String? ?? '',
        submittedAt: json['submittedAt'] as String? ?? '',
        promptText: json['promptText'] as String? ?? '',
        level: json['level'] as String? ?? '',
        points: (json['points'] as num?)?.toInt() ?? 0,
        inspiration: json['inspiration'] as String? ?? '',
        instagramUrl: json['instagramUrl'] as String? ?? '', // Parse new field
        dueOn: json['dueOn'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'weekStart': weekStart,
        'deadline': deadline,
        'submittedAt': submittedAt,
        'promptText': promptText,
        'level': level,
        'points': points,
        'inspiration': inspiration,
        'instagramUrl': instagramUrl, // Include new field
        'dueOn': dueOn,
      };
}

@HiveType(typeId: 7)
class BigProject extends HiveObject {
  static const int basePoints = 150;

  @HiveField(0)
  final String id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final String promptText;

  @HiveField(3)
  final DateTime startedAt;

  @HiveField(4)
  final DateTime deadline;

  @HiveField(5)
  String status; // 'active', 'finished', 'submitted', 'dnf'

  @HiveField(6)
  final int durationDays;

  @HiveField(7)
  int likes;

  @HiveField(8)
  int views;

  @HiveField(9)
  String instagramUrl;

  @HiveField(10)
  DateTime? submittedAt;

  BigProject({
    required this.id,
    required this.title,
    required this.promptText,
    required this.startedAt,
    required this.deadline,
    this.status = 'active',
    required this.durationDays,
    this.likes = 0,
    this.views = 0,
    this.instagramUrl = '',
    this.submittedAt,
  });

  BigProject copyWith({
    String? id,
    String? title,
    String? promptText,
    DateTime? startedAt,
    DateTime? deadline,
    String? status,
    int? durationDays,
    int? likes,
    int? views,
    String? instagramUrl,
    DateTime? submittedAt,
  }) {
    return BigProject(
      id: id ?? this.id,
      title: title ?? this.title,
      promptText: promptText ?? this.promptText,
      startedAt: startedAt ?? this.startedAt,
      deadline: deadline ?? this.deadline,
      status: status ?? this.status,
      durationDays: durationDays ?? this.durationDays,
      likes: likes ?? this.likes,
      views: views ?? this.views,
      instagramUrl: instagramUrl ?? this.instagramUrl,
      submittedAt: submittedAt ?? this.submittedAt,
    );
  }

  factory BigProject.fromJson(Map<String, dynamic> json) => BigProject(
        id: json['id'] as String? ?? '',
        title: json['title'] as String? ?? '',
        promptText: json['promptText'] as String? ?? '',
        startedAt: DateTime.parse(json['startedAt'] as String),
        deadline: DateTime.parse(json['deadline'] as String),
        status: json['status'] as String? ?? 'active',
        durationDays: (json['durationDays'] as num?)?.toInt() ?? 14,
        likes: (json['likes'] as num?)?.toInt() ?? 0,
        views: (json['views'] as num?)?.toInt() ?? 0,
        instagramUrl: json['instagramUrl'] as String? ?? '',
        submittedAt: json['submittedAt'] != null
            ? DateTime.tryParse(json['submittedAt'] as String)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'promptText': promptText,
        'startedAt': startedAt.toIso8601String(),
        'deadline': deadline.toIso8601String(),
        'status': status,
        'durationDays': durationDays,
        'likes': likes,
        'views': views,
        'instagramUrl': instagramUrl,
        'submittedAt': submittedAt?.toIso8601String(),
      };
}
