// ============================================================
// RAWBY — Bottom Navigation
// 5 slots: Home / Prompts / [Aurora FAB] / Leaderboard / Profile.
// Glass-blurred bar with a glowing center FAB to the assistant.
// ============================================================
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../providers/router_provider.dart';

class RawbyBottomNav extends StatelessWidget {
  final int currentIndex;
  final bool isAdmin;

  const RawbyBottomNav({
    super.key,
    required this.currentIndex,
    required this.isAdmin,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: EdgeInsets.fromLTRB(
        14,
        12,
        14,
        MediaQuery.of(context).padding.bottom + 10,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            height: 64,
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withOpacity(0.04)
                  : Colors.white.withOpacity(0.72),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: isDark
                    ? Colors.white.withOpacity(0.08)
                    : Colors.black.withOpacity(0.04),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(isDark ? 0.5 : 0.06),
                  blurRadius: 28,
                  offset: const Offset(0, 14),
                ),
              ],
            ),
            child: Row(
              children: [
                _NavItem(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home,
                  label: 'Home',
                  active: currentIndex == 0,
                  onTap: () => context.go(Routes.home),
                ),
                _NavItem(
                  icon: Icons.movie_outlined,
                  activeIcon: Icons.movie,
                  label: 'Prompts',
                  active: currentIndex == 1,
                  onTap: () => context.go(Routes.prompts),
                ),
                _AuroraFab(
                  active: currentIndex == _idx('assistant'),
                  onTap: () => context.go(Routes.assistant),
                ),
                _NavItem(
                  icon: Icons.leaderboard_outlined,
                  activeIcon: Icons.leaderboard,
                  label: 'Board',
                  active: currentIndex == 2,
                  onTap: () => context.go(Routes.leaderboard),
                ),
                _NavItem(
                  icon: Icons.person_outline,
                  activeIcon: Icons.person,
                  label: 'You',
                  active: currentIndex == 4,
                  onTap: () => context.go(Routes.profile),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  int _idx(String key) => switch (key) { 'assistant' => 6, _ => 0 };
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = active
        ? theme.colorScheme.primary
        : theme.colorScheme.onSurfaceVariant;
    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              transitionBuilder: (c, a) =>
                  ScaleTransition(scale: a, child: c),
              child: Icon(
                active ? activeIcon : icon,
                key: ValueKey(active),
                size: 22,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: active ? FontWeight.w800 : FontWeight.w500,
                color: color,
                letterSpacing: 0.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuroraFab extends StatelessWidget {
  final bool active;
  final VoidCallback onTap;

  const _AuroraFab({required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SizedBox(
      width: 70,
      child: Center(
        child: GestureDetector(
          onTap: () {
            HapticFeedback.mediumImpact();
            onTap();
          },
          child: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(colors: [
                theme.colorScheme.primary,
                theme.colorScheme.secondary,
              ]),
              boxShadow: [
                BoxShadow(
                  color: theme.colorScheme.primary
                      .withOpacity(active ? 0.7 : 0.5),
                  blurRadius: 18,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: const Icon(Icons.auto_awesome,
                color: Colors.white, size: 22),
          )
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .scale(
                begin: const Offset(1, 1),
                end: const Offset(1.04, 1.04),
                duration: 1800.ms,
                curve: Curves.easeInOut,
              ),
        ),
      ),
    );
  }
}
