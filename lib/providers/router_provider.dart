// ============================================================
// RAWBY — Router (go_router)
// ============================================================
import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../screens/login_screen.dart";
import "../screens/register_screen.dart";
import "../screens/home_screen.dart";
import "../screens/prompts_screen.dart";
import "../screens/leaderboard_screen.dart";
import "../screens/gear_screen.dart";
import "../screens/profile_screen.dart";
import "../screens/admin_screen.dart";
import "../screens/idea_bank_screen.dart";
import "../screens/feedback_wall_screen.dart"; // New import
import "../widgets/navigation/shell_scaffold.dart";
import "user_session_provider.dart";

// Route names
class Routes {
  Routes._();
  static const login = "/login";
  static const register = "/register";
  static const home = "/";
  static const prompts = "/prompts";
  static const ideaBank = "/prompts/idea-bank";
  static const leaderboard = "/leaderboard";
  static const gear = "/gear";
  static const profile = "/profile";
  static const admin = "/admin";
  static const feedbackWall = "/admin/feedback"; // New route
}

final routerProvider = Provider<GoRouter>((ref) {
  final session = ref.watch(userSessionProvider);
  final isLoggedIn = session.userId.isNotEmpty;

  return GoRouter(
    initialLocation: isLoggedIn ? Routes.home : Routes.login,
    redirect: (context, state) {
      final loggedIn = session.userId.isNotEmpty;
      final onLogin = state.matchedLocation == Routes.login;
      final onRegister = state.matchedLocation == Routes.register;

      if (!loggedIn && !onLogin && !onRegister) return Routes.login;
      if (loggedIn && onLogin) return Routes.home;
      return null;
    },
    routes: [
      // Login (no shell)
      GoRoute(
        path: Routes.login,
        name: "login",
        pageBuilder: (context, state) => _fadeTransition(
          state,
          const LoginScreen(),
        ),
      ),

      // Register (no shell)
      GoRoute(
        path: Routes.register,
        name: "register",
        pageBuilder: (context, state) => _fadeTransition(
          state,
          const RegisterScreen(),
        ),
      ),

      // Idea Bank — standalone (has its own AppBar, no shell nav)
      GoRoute(
        path: Routes.ideaBank,
        name: "ideaBank",
        pageBuilder: (context, state) => _fadeTransition(
          state,
          const IdeaBankScreen(),
        ),
      ),

      // Feedback Wall — standalone
      GoRoute(
        path: Routes.feedbackWall,
        name: "feedbackWall",
        pageBuilder: (context, state) => _fadeTransition(
          state,
          const FeedbackWallScreen(),
        ),
      ),

      // Main app shell (with navigation)
      ShellRoute(
        builder: (context, state, child) {
          return ShellScaffold(child: child);
        },
        routes: [
          GoRoute(
            path: Routes.home,
            name: "home",
            pageBuilder: (context, state) => _fadeTransition(
              state,
              const HomeScreen(),
            ),
          ),
          GoRoute(
            path: Routes.prompts,
            name: "prompts",
            pageBuilder: (context, state) => _fadeTransition(
              state,
              const PromptsScreen(),
            ),
          ),
          GoRoute(
            path: Routes.leaderboard,
            name: "leaderboard",
            pageBuilder: (context, state) => _fadeTransition(
              state,
              const LeaderboardScreen(),
            ),
          ),
          GoRoute(
            path: Routes.gear,
            name: "gear",
            pageBuilder: (context, state) => _fadeTransition(
              state,
              const GearScreen(),
            ),
          ),
          GoRoute(
            path: Routes.profile,
            name: "profile",
            pageBuilder: (context, state) => _fadeTransition(
              state,
              const ProfileScreen(),
            ),
          ),
          GoRoute(
            path: Routes.admin,
            name: "admin",
            pageBuilder: (context, state) => _fadeTransition(
              state,
              const AdminScreen(),
            ),
          ),
        ],
      ),
    ],
  );
});

// Smooth fade transition (mirrors document.startViewTransition)
CustomTransitionPage<void> _fadeTransition(
  GoRouterState state,
  Widget child,
) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 220),
    reverseTransitionDuration: const Duration(milliseconds: 180),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: CurvedAnimation(
          parent: animation,
          curve: Curves.easeInOut,
        ),
        child: child,
      );
    },
  );
}
