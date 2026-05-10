// ============================================================
// RAWBY — Achievement / Badge Model
// ============================================================
import 'package:hive/hive.dart';


@HiveType(typeId: 10)
class Achievement extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String icon;

  @HiveField(2)
  final String label;

  @HiveField(3)
  final String description;

  @HiveField(4)
  final String category; // 'production', 'streak', 'virality', 'gear', 'growth', 'special'

  @HiveField(5)
  bool earned;

  @HiveField(6)
  int progress;

  @HiveField(7)
  final int target;

  @HiveField(8)
  DateTime? earnedAt;

  Achievement({
    required this.id,
    required this.icon,
    required this.label,
    required this.description,
    required this.category,
    this.earned = false,
    this.progress = 0,
    required this.target,
    this.earnedAt,
  });

  double get progressPercent =>
      target > 0 ? (progress / target).clamp(0.0, 1.0) : 0.0;

  Achievement copyWith({
    bool? earned,
    int? progress,
    DateTime? earnedAt,
  }) {
    return Achievement(
      id: id,
      icon: icon,
      label: label,
      description: description,
      category: category,
      earned: earned ?? this.earned,
      progress: progress ?? this.progress,
      target: target,
      earnedAt: earnedAt ?? this.earnedAt,
    );
  }

  factory Achievement.fromJson(Map<String, dynamic> json) => Achievement(
        id: json['id'] as String? ?? '',
        icon: json['icon'] as String? ?? '🎬',
        label: json['label'] as String? ?? '',
        description: json['desc'] as String? ?? json['description'] as String? ?? '',
        category: json['category'] as String? ?? 'production',
        earned: json['earned'] as bool? ?? false,
        progress: (json['progress'] as num?)?.toInt() ?? 0,
        target: (json['target'] as num?)?.toInt() ?? 1,
        earnedAt: json['earnedAt'] != null
            ? DateTime.tryParse(json['earnedAt'] as String)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'icon': icon,
        'label': label,
        'description': description,
        'category': category,
        'earned': earned,
        'progress': progress,
        'target': target,
        'earnedAt': earnedAt?.toIso8601String(),
      };
}

/// All 17 achievement definitions
class AchievementDefinitions {
  AchievementDefinitions._();

  static List<Achievement> buildAll({
    required int projectCount,
    required int streak,
    required int maxLikes,
    required int gearCount,
    required int skillEntries,
    required bool hasBigProject,
    required int savedPromptsCount,
  }) {
    return [
      // Production
      Achievement(
        id: 'first_submit',
        icon: '🎬',
        label: 'First Submit',
        description: 'Completed your first project',
        category: 'production',
        earned: projectCount >= 1,
        progress: projectCount.clamp(0, 1),
        target: 1,
      ),
      Achievement(
        id: 'five_projects',
        icon: '🎯',
        label: 'Five Down',
        description: 'Completed 5 projects',
        category: 'production',
        earned: projectCount >= 5,
        progress: projectCount,
        target: 5,
      ),
      Achievement(
        id: 'ten_projects',
        icon: '🔥',
        label: 'Double Digits',
        description: 'Completed 10 projects',
        category: 'production',
        earned: projectCount >= 10,
        progress: projectCount,
        target: 10,
      ),
      Achievement(
        id: 'twentyfive',
        icon: '💎',
        label: 'Quarter Century',
        description: 'Completed 25 projects',
        category: 'production',
        earned: projectCount >= 25,
        progress: projectCount,
        target: 25,
      ),
      Achievement(
        id: 'fifty',
        icon: '👑',
        label: 'Half Hundred',
        description: 'Completed 50 projects',
        category: 'production',
        earned: projectCount >= 50,
        progress: projectCount,
        target: 50,
      ),
      // Streaks
      Achievement(
        id: 'streak_3',
        icon: '🔥',
        label: '3-Week Streak',
        description: '3 consecutive weeks submitted',
        category: 'streak',
        earned: streak >= 3,
        progress: streak,
        target: 3,
      ),
      Achievement(
        id: 'streak_5',
        icon: '⚡',
        label: '5-Week Streak',
        description: '5 consecutive weeks submitted',
        category: 'streak',
        earned: streak >= 5,
        progress: streak,
        target: 5,
      ),
      Achievement(
        id: 'streak_10',
        icon: '🌟',
        label: '10-Week Streak',
        description: '10 consecutive weeks submitted',
        category: 'streak',
        earned: streak >= 10,
        progress: streak,
        target: 10,
      ),
      // Virality
      Achievement(
        id: 'viral_100',
        icon: '❤️',
        label: '100 Likes',
        description: 'A post reached 100 likes',
        category: 'virality',
        earned: maxLikes >= 100,
        progress: maxLikes,
        target: 100,
      ),
      Achievement(
        id: 'viral_500',
        icon: '💗',
        label: '500 Likes',
        description: 'A post reached 500 likes',
        category: 'virality',
        earned: maxLikes >= 500,
        progress: maxLikes,
        target: 500,
      ),
      Achievement(
        id: 'viral_1k',
        icon: '🚀',
        label: '1K Likes',
        description: 'A post reached 1,000 likes',
        category: 'virality',
        earned: maxLikes >= 1000,
        progress: maxLikes,
        target: 1000,
      ),
      // Gear
      Achievement(
        id: 'first_gear',
        icon: '📷',
        label: 'Geared Up',
        description: 'Added your first piece of gear',
        category: 'gear',
        earned: gearCount >= 1,
        progress: gearCount.clamp(0, 1),
        target: 1,
      ),
      Achievement(
        id: 'five_gear',
        icon: '🎒',
        label: 'Kit Builder',
        description: '5 gear items logged',
        category: 'gear',
        earned: gearCount >= 5,
        progress: gearCount,
        target: 5,
      ),
      // Self-Growth
      Achievement(
        id: 'first_skill',
        icon: '📝',
        label: 'Self Aware',
        description: 'First skill reflection entry',
        category: 'growth',
        earned: skillEntries >= 1,
        progress: skillEntries.clamp(0, 1),
        target: 1,
      ),
      Achievement(
        id: 'ten_skill',
        icon: '🧠',
        label: 'Growth Mindset',
        description: '10 skill reflection entries',
        category: 'growth',
        earned: skillEntries >= 10,
        progress: skillEntries,
        target: 10,
      ),
      // Special
      Achievement(
        id: 'big_done',
        icon: '🎞️',
        label: 'Big Thinker',
        description: 'Completed a Big Project',
        category: 'special',
        earned: hasBigProject,
        progress: hasBigProject ? 1 : 0,
        target: 1,
      ),
      Achievement(
        id: 'idea_bank',
        icon: '💡',
        label: 'Idea Bank',
        description: 'Saved 5 or more prompts for later',
        category: 'special',
        earned: savedPromptsCount >= 5,
        progress: savedPromptsCount,
        target: 5,
      ),
    ];
  }
}
