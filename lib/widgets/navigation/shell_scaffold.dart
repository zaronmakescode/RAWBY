// ============================================================
// RAWBY — Shell Scaffold
// Responsive: bottom nav (mobile) / side nav (desktop)
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../constants/app_constants.dart';
import '../../providers/user_session_provider.dart';
import '../../providers/router_provider.dart';
import '../user_bar.dart';
import 'bottom_nav.dart';
import 'side_nav.dart';

class ShellScaffold extends ConsumerWidget {
  final Widget child;

  const ShellScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= AppConstants.mobileBreakpoint;
    final session = ref.watch(userSessionProvider);
    final location = GoRouterState.of(context).matchedLocation;
    final currentIndex = _locationToIndex(location, session.isAdmin);

    if (isDesktop) {
      return _DesktopLayout(
        child: child,
        currentIndex: currentIndex,
        isAdmin: session.isAdmin,
      );
    }

    return _MobileLayout(
      child: child,
      currentIndex: currentIndex,
      isAdmin: session.isAdmin,
    );
  }

  int _locationToIndex(String location, bool isAdmin) {
    switch (location) {
      case Routes.home:
        return 0;
      case Routes.prompts:
        return 1;
      case Routes.leaderboard:
        return 2;
      case Routes.gear:
        return 3;
      case Routes.profile:
        return 4;
      case Routes.admin:
        return isAdmin ? 5 : 0;
      default:
        return 0;
    }
  }
}

// ── Mobile Layout ────────────────────────────────────────────

class _MobileLayout extends StatelessWidget {
  final Widget child;
  final int currentIndex;
  final bool isAdmin;

  const _MobileLayout({
    required this.child,
    required this.currentIndex,
    required this.isAdmin,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const UserBar(),
          Expanded(child: child),
        ],
      ),
      bottomNavigationBar: RawbyBottomNav(
        currentIndex: currentIndex,
        isAdmin: isAdmin,
      ),
    );
  }
}

// ── Desktop Layout ───────────────────────────────────────────

class _DesktopLayout extends StatelessWidget {
  final Widget child;
  final int currentIndex;
  final bool isAdmin;

  const _DesktopLayout({
    required this.child,
    required this.currentIndex,
    required this.isAdmin,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Row(
        children: [
          RawbySideNav(
            currentIndex: currentIndex,
            isAdmin: isAdmin,
          ),
          VerticalDivider(
            width: 1,
            color: theme.colorScheme.outline,
          ),
          Expanded(
            child: Column(
              children: [
                const UserBar(),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
