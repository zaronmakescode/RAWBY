// ============================================================
// RAWBY — Theme Provider
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import 'user_session_provider.dart';

final appThemeProvider = Provider<ThemeData>((ref) {
  final session = ref.watch(userSessionProvider);
  return AppTheme.build(
    mode: session.preferences.theme,
    accent: session.preferences.accent,
  );
});

final isDarkProvider = Provider<bool>((ref) {
  return ref.watch(userSessionProvider).preferences.theme == 'dark';
});

final accentProvider = Provider<String>((ref) {
  return ref.watch(userSessionProvider).preferences.accent;
});
