// ============================================================
// RAWBY — Scoring Service
// Implements the "Deadly Deadline" penalty math and
// test-run detection (before 2026-05-01).
// ============================================================

class ScoringService {
  ScoringService._();

  static final DateTime _testRunCutoff = DateTime.utc(2026, 5, 1);

  // ── Penalty Multiplier ───────────────────────────────────────
  // Submitted on or before Friday: 1.0x
  // 1 day late: 0.9x
  // 2 days late: 0.75x
  // 3+ days late: 0.5x

  static double penaltyMultiplier(DateTime submittedAt, DateTime deadline) {
    final sub = submittedAt.toUtc();
    final dl = deadline.toUtc();

    if (!sub.isAfter(dl)) return 1.0; // on time

    final daysLate = sub.difference(dl).inDays;
    if (daysLate == 1) return 0.9;
    if (daysLate == 2) return 0.75;
    return 0.5; // 3+ days late
  }

  // ── Score Calculation ────────────────────────────────────────
  // (Likes × Prompt Points) × Penalty Multiplier

  static int calculateScore({
    required int likes,
    required int promptPoints,
    required DateTime submittedAt,
    required DateTime deadline,
  }) {
    final multiplier = penaltyMultiplier(submittedAt, deadline);
    return ((likes * promptPoints) * multiplier).round();
  }

  // ── Test Run Detection ───────────────────────────────────────
  // Projects submitted before 2026-05-01 are test runs

  static bool isTestRun(DateTime submittedAt) {
    return submittedAt.toUtc().isBefore(_testRunCutoff);
  }

  // ── Penalty Label ────────────────────────────────────────────

  static String penaltyLabel(DateTime submittedAt, DateTime deadline) {
    final multiplier = penaltyMultiplier(submittedAt, deadline);
    if (multiplier == 1.0) return 'On time ✓';
    if (multiplier == 0.9) return '1 day late (×0.9)';
    if (multiplier == 0.75) return '2 days late (×0.75)';
    return '3+ days late (×0.5)';
  }

  // ── Days Until Deadline ──────────────────────────────────────

  static int daysUntilDeadline(DateTime deadline) {
    final now = DateTime.now().toUtc();
    final dl = deadline.toUtc();
    if (now.isAfter(dl)) return 0;
    return dl.difference(now).inDays;
  }

  // ── Hours Until Deadline ─────────────────────────────────────

  static int hoursUntilDeadline(DateTime deadline) {
    final now = DateTime.now().toUtc();
    final dl = deadline.toUtc();
    if (now.isAfter(dl)) return 0;
    return dl.difference(now).inHours;
  }

  // ── Deadline Status ──────────────────────────────────────────

  static DeadlineStatus deadlineStatus(DateTime deadline) {
    final hours = hoursUntilDeadline(deadline);
    if (hours <= 0) return DeadlineStatus.overdue;
    if (hours <= 24) return DeadlineStatus.urgent;
    if (hours <= 48) return DeadlineStatus.warning;
    return DeadlineStatus.safe;
  }
}

enum DeadlineStatus { safe, warning, urgent, overdue }
