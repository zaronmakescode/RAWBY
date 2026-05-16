// ============================================================
// RAWBY — User Bar (desktop header)
// Identity + rank + streak + quick links (settings, assistant).
// Mobile uses immersive in-screen headers instead.
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/router_provider.dart';
import '../providers/user_session_provider.dart';
import '../theme/app_colors.dart';

class UserBar extends ConsumerWidget {
  const UserBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(userSessionProvider);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final rank = session.currentRank;
    final streak = session.streak;

    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 10,
        left: 24,
        right: 24,
        bottom: 12,
      ),
      decoration: BoxDecoration(
        color: isDark ? RawbyPalette.darkSurface : RawbyPalette.lightSurface,
        border: Border(
          bottom: BorderSide(
            color: isDark ? RawbyPalette.darkBorder : RawbyPalette.lightBorder,
          ),
        ),
      ),
      child: Row(
        children: [
          Text(
            rank.icon,
            style: TextStyle(fontSize: 18, color: theme.colorScheme.primary),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  session.displayName.isNotEmpty
                      ? session.displayName
                      : session.username,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  rank.label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          _Chip(
            label: '${session.totalScore} pts',
            color: theme.colorScheme.primary,
          ),
          if (streak > 0) ...[
            const SizedBox(width: 6),
            _Chip(
              icon: Icons.local_fire_department,
              label: '$streak',
              color: const Color(0xFFE85D75),
            ),
          ],
          const SizedBox(width: 12),
          IconButton(
            tooltip: 'Aurora assistant',
            icon: Icon(Icons.auto_awesome,
                color: theme.colorScheme.primary, size: 20),
            onPressed: () => context.go(Routes.assistant),
          ),
          IconButton(
            tooltip: 'Settings',
            icon: const Icon(Icons.tune, size: 20),
            onPressed: () => context.go(Routes.settings),
          ),
          if (session.isAdmin)
            IconButton(
              tooltip: 'Admin',
              icon: Icon(Icons.shield_outlined,
                  color: theme.colorScheme.primary, size: 20),
              onPressed: () => context.go(Routes.admin),
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            color: isDark ? RawbyPalette.darkCard : RawbyPalette.lightCard,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            offset: const Offset(0, 40),
            onSelected: (value) {
              switch (value) {
                case 'profile':
                  context.go(Routes.profile);
                  break;
                case 'settings':
                  context.push(Routes.settings);
                  break;
                case 'admin':
                  context.go(Routes.admin);
                  break;
                case 'theme':
                  final prefs = session.preferences;
                  ref.read(userSessionProvider.notifier).updatePreferences(
                        prefs.copyWith(
                          theme: prefs.theme == 'dark' ? 'light' : 'dark',
                        ),
                      );
                  break;
              }
            },
            itemBuilder: (ctx) => [
              PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    Icon(Icons.person_outline, size: 18, color: theme.colorScheme.onSurface),
                    const SizedBox(width: 10),
                    Text('Profile', style: theme.textTheme.bodyMedium),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'settings',
                child: Row(
                  children: [
                    Icon(Icons.settings_outlined, size: 18, color: theme.colorScheme.onSurface),
                    const SizedBox(width: 10),
                    Text('Settings', style: theme.textTheme.bodyMedium),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'theme',
                child: Row(
                  children: [
                    Icon(
                      isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                      size: 18,
                      color: theme.colorScheme.onSurface,
                    ),
                    const SizedBox(width: 10),
                    Text(isDark ? 'Light Mode' : 'Dark Mode', style: theme.textTheme.bodyMedium),
                  ],
                ),
              ),
              if (session.isAdmin)
                PopupMenuItem(
                  value: 'admin',
                  child: Row(
                    children: [
                      Icon(Icons.admin_panel_settings_outlined, size: 18, color: theme.colorScheme.primary),
                      const SizedBox(width: 10),
                      Text('Admin', style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.primary)),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;

  const _Chip({required this.label, required this.color, this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(40),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
