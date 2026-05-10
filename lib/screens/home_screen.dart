// ============================================================
// RAWBY — Home Screen (Full Implementation)
// Shows current project workflow, deadline, and action buttons
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../providers/user_session_provider.dart';
import '../providers/router_provider.dart';
import '../models/project_model.dart';
import '../services/scoring_service.dart';
import '../theme/app_colors.dart';
import '../widgets/projects/submit_modal.dart';
import '../widgets/projects/record_stats_modal.dart';
import '../widgets/projects/big_project_modal.dart';
import '../widgets/projects/history_list.dart';
import '../widgets/home/countdown_timer.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(userSessionProvider);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final currentProject = session.prompts.isNotEmpty ? session.prompts.first : null;
    final deadline = DateTime.tryParse(session.deadline);
    final now = DateTime.now().toUtc();
    final activeBigProject = session.activeBigProject;
    final isBigProject = activeBigProject != null;

    // Deadline calculations
    final isOverdue = (deadline != null && now.isAfter(deadline));
    final daysLeft = deadline != null ? ScoringService.daysUntilDeadline(deadline) : 0;
    final hoursLeft = deadline != null ? ScoringService.hoursUntilDeadline(deadline) : 0;
    final deadlineStatus = deadline != null ? ScoringService.deadlineStatus(deadline) : DeadlineStatus.safe;

    Color deadlineColor;
    String deadlineLabel;
    switch (deadlineStatus) {
      case DeadlineStatus.overdue:
        deadlineColor = theme.colorScheme.error;
        deadlineLabel = 'Overdue!';
        break;
      case DeadlineStatus.urgent:
        deadlineColor = RawbyPalette.danger;
        deadlineLabel = 'Due in $hoursLeft hours!';
        break;
      case DeadlineStatus.warning:
        deadlineColor = RawbyPalette.caution;
        deadlineLabel = 'Due in $daysLeft days!';
        break;
      case DeadlineStatus.safe:
      default:
        deadlineColor = theme.colorScheme.primary;
        deadlineLabel = 'Due in $daysLeft days';
        if (daysLeft == 0 && hoursLeft > 0) {
          deadlineLabel = 'Due in $hoursLeft hours';
        }
    }

    final submitted = session.submittedAt != null;
    final statsReady = session.statsReady;
    final statsRecorded = session.statsRecordedAt != null;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Text(
                    isBigProject ? 'Big Project' : 'This Week',
                    style: theme.textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 4),
                  if (isBigProject)
                    Text(
                      activeBigProject.title,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.primary,
                      ),
                    )
                  else
                    Text(
                      '${DateFormat.MMMEd().format(DateTime.parse(session.weekStart))} – ${DateFormat.MMMEd().format(DateTime.parse(session.deadline))}',
                      style: theme.textTheme.bodySmall,
                    ),
                  const SizedBox(height: 20),

                  // ── Current Project Section ──────────────────────────
                  if (currentProject != null && !isBigProject) ...[
                    Text(
                      'Your Current Prompt',
                      style: theme.textTheme.titleSmall,
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark ? RawbyPalette.darkCard : RawbyPalette.lightCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark ? RawbyPalette.darkBorder : RawbyPalette.lightBorder,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                currentProject.level == 'Sequence'
                                    ? '🎞️'
                                    : currentProject.level == 'Short Story'
                                        ? '🎬'
                                        : '🎭',
                                style: const TextStyle(fontSize: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${currentProject.level} · ${currentProject.points} pts',
                                      style: theme.textTheme.bodyMedium?.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: theme.colorScheme.primary,
                                      ),
                                    ),
                                    Text(
                                      currentProject.text,
                                      style: theme.textTheme.bodySmall,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // ── Action Buttons (Submit, Record Stats) ────────────
                  if (currentProject != null) ...[
                    if (!submitted && !isBigProject) // Weekly Project: Submit
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            HapticFeedback.mediumImpact();
                            _showSubmitModal(context, ref);
                          },
                          icon: const Icon(Icons.upload_outlined, size: 18),
                          label: Text(
                            deadlineStatus == DeadlineStatus.overdue
                                ? 'Submit Late'
                                : 'Submit Project',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ) // Big Project: DNF
                    else if (isBigProject && activeBigProject.status == 'active')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _confirmDnfBigProject(context, ref),
                          icon: const Icon(Icons.close, size: 18),
                          label: const Text(
                            'DNF Big Project (Lose 150 pts)',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.colorScheme.error,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),

                    // Submitted success card
                    if (submitted && !statsReady && !statsRecorded)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: RawbyPalette.success.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: RawbyPalette.success.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, color: RawbyPalette.success, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Project Submitted!',
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                      color: RawbyPalette.success,
                                    ),
                                  ),
                                  Text(
                                    'Stats will be ready in ${session.statsUnlockDate.difference(DateTime.now()).inDays} days',
                                    style: theme.textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                    if (submitted && statsReady && !statsRecorded) ...[
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            HapticFeedback.mediumImpact();
                            _showRecordStatsModal(context, ref);
                          },
                          icon: const Icon(Icons.bar_chart, size: 18),
                          label: const Text(
                            'Stats Ready: Record Likes/Views',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: RawbyPalette.caution,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                    ],
                  ],

                  // ── No Active Project / Start New ────────────────────
                  if (currentProject == null && !isBigProject) ...[
                    const SizedBox(height: 20),
                    Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.videocam_off_outlined,
                            size: 48,
                            color: theme.colorScheme.outline,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'No active project',
                            style: theme.textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton.icon(
                            onPressed: () => context.go(Routes.prompts),
                            icon: const Icon(Icons.lightbulb_outline, size: 16),
                            label: const Text('Choose a Prompt'),
                          ),
                          const SizedBox(height: 12),
                          TextButton.icon(
                            onPressed: () => _showBigProjectModal(context, ref),
                            icon: const Icon(Icons.movie_creation_outlined, size: 16),
                            label: const Text('Start a Big Project'),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // ── Workflow & Deadline ──────────────────────────────
                  if (currentProject != null) ...[
                    const SizedBox(height: 20),
                    Text(
                      'Your Workflow',
                      style: theme.textTheme.titleSmall,
                    ),
                    const SizedBox(height: 8),
                    // Deadline Card with Countdown
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: deadlineColor.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: deadlineColor.withOpacity(0.3),
                        ),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.access_time,
                                size: 18,
                                color: deadlineColor,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  DateFormat.yMMMEd().add_jm().format(deadline!),
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: deadlineColor,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: deadlineColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  deadlineLabel,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: deadlineColor,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          CountdownTimer(
                            deadline: deadline!,
                            accentColor: deadlineColor,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Workflow tasks
                    ...session.workflow.map((task) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: _WorkflowTaskTile(task: task, theme: theme),
                        )),
                  ],
                ],
              ),
            ),
          ),

          // ── Project History Section ──────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Project History',
                    style: theme.textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 12),
                  const HistoryList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showSubmitModal(BuildContext context, WidgetRef ref) async {
    final submitted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const SubmitModal(),
    );
    if (submitted == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(
            'Project submitted! Stats ready in 7 days.',
          ),
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _showRecordStatsModal(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const RecordStatsModal(),
    );
  }

  Future<void> _showBigProjectModal(BuildContext context, WidgetRef ref) async {
    final started = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const BigProjectModal(),
    );
    if (started == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(
            'Big project started! Good luck!',
          ),
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _confirmDnfBigProject(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text(
          'DNF Big Project?',
          style: TextStyle(color: RawbyPalette.danger),
        ),
        content: const Text(
          'You will lose 150 points from your total score if you give up now. Are you sure?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(
              'Give Up (-150 pts)',
              style: TextStyle(color: Theme.of(ctx).colorScheme.error),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      ref.read(userSessionProvider.notifier).dnfBigProject();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Big project DNF! 150 points deducted.',
            ),
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }
}

// ── Workflow Task Tile ───────────────────────────────────────

class _WorkflowTaskTile extends ConsumerWidget {
  final WorkflowTask task;
  final ThemeData theme;

  const _WorkflowTaskTile({
    required this.task,
    required this.theme,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: task.done
            ? theme.colorScheme.primary.withOpacity(0.06)
            : (isDark ? RawbyPalette.darkCard : RawbyPalette.lightCard),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: task.done
              ? theme.colorScheme.primary.withOpacity(0.2)
              : theme.colorScheme.outline,
        ),
      ),
      child: Row(
        children: [
          Icon(
            task.done ? Icons.check_circle_outline : Icons.radio_button_off,
            size: 18,
            color: task.done ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.label,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                    decoration: task.done ? TextDecoration.lineThrough : null,
                    color: task.done
                        ? theme.colorScheme.onSurfaceVariant
                        : theme.colorScheme.onSurface,
                  ),
                ),
                Text(
                  task.done
                      ? 'Completed: ${DateFormat.yMMMd().format(task.completedAt!)}'
                      : 'Due on ${task.day}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          if (!task.done && !ref.watch(userSessionProvider).isLocked)
            IconButton(
              icon: const Icon(Icons.check, size: 18),
              color: theme.colorScheme.primary,
              onPressed: () {
                ref
                    .read(userSessionProvider.notifier)
                    .completeWorkflowTask(task.id);
              },
            ),
        ],
      ),
    );
  }
}
