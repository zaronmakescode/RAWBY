// ============================================================
// RAWBY — Profile Screen (Full Implementation)
// Shows user stats, achievements, and project history
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/router_provider.dart';
import '../providers/user_session_provider.dart';
import '../widgets/common/glass_card.dart';
import '../widgets/projects/history_list.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(userSessionProvider);
    final theme = Theme.of(context);
    final achievements = session.achievements;
    final earned = achievements.where((a) => a.earned).toList();

    return Scaffold(
      body: AuraBackground(
        topOnly: true,
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(colors: [
                          theme.colorScheme.primary,
                          theme.colorScheme.secondary,
                        ]),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        session.displayName.isNotEmpty
                            ? session.displayName[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            session.displayName.isNotEmpty
                                ? session.displayName
                                : session.username,
                            style: theme.textTheme.headlineLarge,
                          ),
                          Text(
                            '@${session.username}',
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      tooltip: 'Settings',
                      icon: const Icon(Icons.tune),
                      onPressed: () => context.push(Routes.settings),
                    ),
                    IconButton(
                      tooltip: 'Gear',
                      icon: const Icon(Icons.camera_outlined),
                      onPressed: () => context.push(Routes.gear),
                    ),
                  ],
                ).animate().fadeIn().slideX(begin: -0.04),
                const SizedBox(height: 16),

            // Rank progress card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary.withOpacity(0.12),
                    theme.colorScheme.primary.withOpacity(0.04),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: theme.colorScheme.primary.withOpacity(0.2),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        session.currentRank.icon,
                        style: const TextStyle(fontSize: 24),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            session.currentRank.label,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                          Text(
                            '${session.totalScore} points total',
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (session.nextRank != null) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: (() {
                                final next = session.nextRank!;
                                final current = session.currentRank;
                                final range = next.minScore - current.minScore;
                                if (range <= 0) return 1.0;
                                return ((session.totalScore - current.minScore) / range).clamp(0.0, 1.0);
                              })(),
                              minHeight: 6,
                              backgroundColor: theme.colorScheme.outline.withOpacity(0.2),
                              valueColor: AlwaysStoppedAnimation<Color>(
                                theme.colorScheme.primary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          '${session.nextRank!.minScore - session.totalScore} pts to ${session.nextRank!.label}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w500,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Stats row
            Row(
              children: [
                _StatBox(
                  label: 'Score',
                  value: '${session.totalScore}',
                  theme: theme,
                ),
                const SizedBox(width: 10),
                _StatBox(
                  label: 'Projects',
                  value: '${session.scoringHistory.length}',
                  theme: theme,
                ),
                const SizedBox(width: 10),
                _StatBox(
                  label: 'Streak',
                  value: '${session.streak}🔥',
                  theme: theme,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Achievements
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Achievements', style: theme.textTheme.headlineSmall),
                Text(
                  '${earned.length}/${achievements.length}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: achievements.map((a) {
                return Tooltip(
                  message: '${a.label}: ${a.description}',
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: a.earned
                          ? theme.colorScheme.primary.withOpacity(0.12)
                          : theme.colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: a.earned
                            ? theme.colorScheme.primary.withOpacity(0.3)
                            : theme.colorScheme.outline,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          a.icon,
                          style: TextStyle(
                            fontSize: 14,
                            color: a.earned ? null : Colors.grey,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          a.label,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: a.earned
                                ? theme.colorScheme.primary
                                : theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        if (a.target > 1 && !a.earned) ...[
                          const SizedBox(width: 6),
                          Text(
                            '${a.progress}/${a.target}',
                            style: TextStyle(
                              fontSize: 10,
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                          SizedBox(
                            width: 30,
                            height: 4,
                            child: LinearProgressIndicator(
                              value: a.progressPercent,
                              backgroundColor: theme.colorScheme.outline.withOpacity(0.3),
                              valueColor: AlwaysStoppedAnimation<Color>(
                                a.progressPercent >= 1.0
                                    ? theme.colorScheme.primary
                                    : theme.colorScheme.primary.withOpacity(0.6),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            // Engagement stats
            const SizedBox(height: 20),
            Text('Engagement', style: theme.textTheme.titleSmall),
            const SizedBox(height: 8),
            Row(
              children: [
                _StatBox(
                  label: 'Total Likes',
                  value: '${session.totalLikes}',
                  theme: theme,
                ),
                const SizedBox(width: 10),
                _StatBox(
                  label: 'Total Views',
                  value: '${session.totalViews}',
                  theme: theme,
                ),
                const SizedBox(width: 10),
                _StatBox(
                  label: 'Avg Likes',
                  value: '${session.avgLikes}',
                  theme: theme,
                ),
              ],
            ),

            const SizedBox(height: 32),
            Text(
              'Project History',
              style: theme.textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            const HistoryList(),

            // Logout
            const SizedBox(height: 32),
            Center(
              child: TextButton.icon(
                onPressed: () => _confirmLogout(context, ref),
                icon: Icon(Icons.logout, size: 16, color: theme.colorScheme.error),
                label: Text(
                  'Log Out',
                  style: TextStyle(
                    color: theme.colorScheme.error,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log Out?'),
        content: const Text(
          'Your data is saved. You can log back in anytime.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(
              'Log Out',
              style: TextStyle(color: Theme.of(ctx).colorScheme.error),
            ),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      ref.read(userSessionProvider.notifier).logout();
    }
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final ThemeData theme;

  const _StatBox({
    required this.label,
    required this.value,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: theme.colorScheme.outline),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 2),
            Text(label, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
