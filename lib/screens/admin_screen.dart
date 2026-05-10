// ============================================================
// RAWBY — Admin Screen (Full Implementation)
// Admin dashboard for managing global updates, feedback, IG stats.
// ============================================================
import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../providers/user_session_provider.dart";
import "../providers/router_provider.dart";
import "../services/api_service.dart";
import "../widgets/admin/global_updates_modal.dart";
import "../widgets/admin/instagram_stats_modal.dart";
import "../theme/app_colors.dart";

class AdminScreen extends ConsumerWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(userSessionProvider);
    final theme = Theme.of(context);

    if (!session.isAdmin) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.lock_outline, size: 48, color: theme.colorScheme.outline),
              const SizedBox(height: 12),
              Text("Admin access only", style: theme.textTheme.bodyMedium),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Admin Panel", style: theme.textTheme.headlineMedium),
            const SizedBox(height: 4),
            Text("Manage the platform", style: theme.textTheme.bodySmall),
            const SizedBox(height: 24),

            // ── Global Updates ───────────────────────────────────
            _AdminSection(
              icon: Icons.campaign_outlined,
              title: "Global Updates",
              subtitle: "Post announcements to all users",
              onTap: () => _showGlobalUpdatesModal(context, ref),
              theme: theme,
            ),

            // ── Feedback Wall ────────────────────────────────────
            _AdminSection(
              icon: Icons.feedback_outlined,
              title: "Feedback Wall",
              subtitle: "View and manage user feedback",
              onTap: () => context.go(Routes.feedbackWall),
              theme: theme,
            ),

            // ── Instagram Stats ──────────────────────────────────
            _AdminSection(
              icon: Icons.camera_alt_outlined,
              title: "Instagram Stats",
              subtitle: "Fetch likes from Reel URLs",
              onTap: () => _showInstagramStatsModal(context, ref),
              theme: theme,
            ),

            // ── Users ────────────────────────────────────────────
            _AdminSection(
              icon: Icons.people_outline,
              title: "Users",
              subtitle: "View all registered users",
              onTap: () async {
                // Example: Fetch and show users (simple snackbar for now)
                try {
                  final api = ref.read(apiServiceProvider);
                  final users = await api.getUsers();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text("Fetched ${users.length} users.")),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text("Failed to fetch users: ${e.toString()}")),
                    );
                  }
                }
              },
              theme: theme,
            ),

            // ── Force Sync ───────────────────────────────────────
            _AdminSection(
              icon: Icons.sync_outlined,
              title: "Force Sync",
              subtitle: "Push current state to backend immediately",
              onTap: () {
                ref.read(userSessionProvider.notifier).saveNow();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Sync triggered")),
                );
              },
              theme: theme,
            ),

            const SizedBox(height: 32),
            Center(
              child: Text(
                "— Admin panel complete —",
                style: theme.textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showGlobalUpdatesModal(BuildContext context, WidgetRef ref) async {
    final posted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const GlobalUpdatesModal(),
    );
    if (posted == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Global update posted successfully!"),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _showInstagramStatsModal(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const InstagramStatsModal(),
    );
  }
}

// ── Admin Section Widget ─────────────────────────────────────

class _AdminSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final ThemeData theme;

  const _AdminSection({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: theme.colorScheme.primary, size: 20),
        ),
        title: Text(title, style: theme.textTheme.titleMedium),
        subtitle: Text(subtitle, style: theme.textTheme.bodySmall),
        trailing: Icon(
          Icons.chevron_right,
          color: theme.colorScheme.onSurfaceVariant,
          size: 18,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: BorderSide(color: theme.colorScheme.outline),
        ),
        tileColor: theme.colorScheme.surfaceContainerHighest,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      ),
    );
  }
}
