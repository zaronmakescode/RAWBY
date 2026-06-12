// ============================================================
// RAWBY — Theme Provider
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import 'user_session_provider.dart';

// Watch only the two preference fields that affect ThemeData. Watching the
// whole session would rebuild the (expensive) theme — and with it the entire
// MaterialApp — on every keystroke, sync or stat change.
final appThemeProvider = Provider<ThemeData>((ref) {
  final mode =
      ref.watch(userSessionProvider.select((s) => s.preferences.theme));
  final accent =
      ref.watch(userSessionProvider.select((s) => s.preferences.accent));
  return AppTheme.build(mode: mode, accent: accent);
});

final isDarkProvider = Provider<bool>((ref) {
  return ref.watch(userSessionProvider).preferences.theme == 'dark';
});

final accentProvider = Provider<String>((ref) {
  return ref.watch(userSessionProvider).preferences.accent;
});
