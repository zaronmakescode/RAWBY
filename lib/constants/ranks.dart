// ============================================================
// RAWBY — Rank Definitions
// ============================================================

class RankDefinition {
  final int minScore;
  final String label;
  final String icon;

  const RankDefinition({
    required this.minScore,
    required this.label,
    required this.icon,
  });
}

class Ranks {
  Ranks._();

  static const List<RankDefinition> all = [
    RankDefinition(minScore: 0, label: 'Starter', icon: '◊'),
    RankDefinition(minScore: 800, label: 'Apprentice', icon: '◆'),
    RankDefinition(minScore: 2500, label: 'Emerging', icon: '▲'),
    RankDefinition(minScore: 7000, label: 'Builder', icon: '■'),
    RankDefinition(minScore: 18000, label: 'Cinematic', icon: '★'),
    RankDefinition(minScore: 45000, label: 'Senior Director', icon: '⬡'),
    RankDefinition(minScore: 100000, label: 'Master', icon: '♛'),
  ];

  static RankDefinition getRank(int score) {
    RankDefinition current = all.first;
    for (final rank in all) {
      if (score >= rank.minScore) {
        current = rank;
      }
    }
    return current;
  }

  static RankDefinition? getNextRank(int score) {
    for (final rank in all) {
      if (score < rank.minScore) return rank;
    }
    return null;
  }

  static int pointsToNextRank(int score) {
    final next = getNextRank(score);
    if (next == null) return 0;
    return next.minScore - score;
  }
}
