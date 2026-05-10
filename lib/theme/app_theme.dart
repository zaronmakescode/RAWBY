// ============================================================
// RAWBY — Theme System
// Builds ThemeData for light/dark × green/grey/basic
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData build({
    required String mode, // 'light' or 'dark'
    required String accent, // 'green', 'grey', 'basic'
  }) {
    final isDark = mode == 'dark';
    final colors = AccentColors.forAccent(accent);

    final colorScheme = isDark
        ? _darkColorScheme(colors)
        : _lightColorScheme(colors);

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      brightness: isDark ? Brightness.dark : Brightness.light,

      // Page Transitions (mimics document.startViewTransition)
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: _FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.iOS: _FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.fuchsia: _FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.linux: _FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.macOS: _FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.windows: _FadeUpwardsPageTransitionsBuilder(),
        },
      ),

      // Scaffold
      scaffoldBackgroundColor: colorScheme.surface,

      // AppBar
      appBarTheme: AppBarTheme(
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        systemOverlayStyle: isDark
            ? SystemUiOverlayStyle.light
            : SystemUiOverlayStyle.dark,
        titleTextStyle: TextStyle(
          color: colorScheme.onSurface,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.3,
        ),
      ),

      // Cards
      cardTheme: CardThemeData(
        color: isDark ? RawbyPalette.darkCard : RawbyPalette.lightCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: isDark ? RawbyPalette.darkBorder : RawbyPalette.lightBorder,
            width: 1,
          ),
        ),
        margin: EdgeInsets.zero,
      ),

      // Elevated Button (primary action)
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: colors.primary,
          foregroundColor: colors.onPrimary,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.1,
          ),
        ),
      ),

      // Outlined Button
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: colors.primary,
          side: BorderSide(color: colors.primary, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),

      // Text Button
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: colors.primary,
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),

      // Input fields
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? RawbyPalette.inputCreamDark : RawbyPalette.inputCream,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: colors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: RawbyPalette.danger, width: 1.5),
        ),
        hintStyle: TextStyle(
          color: isDark ? const Color(0xFF8A8A7A) : const Color(0xFF9A9A8A),
          fontSize: 14,
        ),
        labelStyle: TextStyle(
          color: isDark ? RawbyPalette.textMutedDark : RawbyPalette.textMutedLight,
          fontSize: 14,
        ),
      ),

      // Divider
      dividerTheme: DividerThemeData(
        color: isDark ? RawbyPalette.darkBorder : RawbyPalette.lightBorder,
        thickness: 1,
        space: 1,
      ),

      // Bottom Navigation Bar
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: isDark
            ? RawbyPalette.darkSurface.withOpacity(0.95)
            : RawbyPalette.lightSurface.withOpacity(0.95),
        selectedItemColor: colors.primary,
        unselectedItemColor: isDark
            ? RawbyPalette.textMutedDark
            : RawbyPalette.textMutedLight,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w400,
        ),
      ),

      // Navigation Rail (desktop side nav)
      navigationRailTheme: NavigationRailThemeData(
        backgroundColor: isDark ? RawbyPalette.darkSurface : RawbyPalette.lightSurface,
        selectedIconTheme: IconThemeData(color: colors.primary, size: 22),
        unselectedIconTheme: IconThemeData(
          color: isDark ? RawbyPalette.textMutedDark : RawbyPalette.textMutedLight,
          size: 22,
        ),
        selectedLabelTextStyle: TextStyle(
          color: colors.primary,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelTextStyle: TextStyle(
          color: isDark ? RawbyPalette.textMutedDark : RawbyPalette.textMutedLight,
          fontSize: 12,
          fontWeight: FontWeight.w400,
        ),
        indicatorColor: colors.primary.withOpacity(0.12),
        elevation: 0,
        minWidth: 72,
        minExtendedWidth: 200,
      ),

      // Chip
      chipTheme: ChipThemeData(
        backgroundColor: isDark ? RawbyPalette.darkCard : RawbyPalette.lightCard,
        selectedColor: colors.primary.withOpacity(0.15),
        labelStyle: TextStyle(
          fontSize: 12,
          color: isDark ? RawbyPalette.textDark : RawbyPalette.textLight,
        ),
        side: BorderSide(
          color: isDark ? RawbyPalette.darkBorder : RawbyPalette.lightBorder,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      ),

      // List Tile
      listTileTheme: ListTileThemeData(
        tileColor: Colors.transparent,
        iconColor: isDark ? RawbyPalette.textMutedDark : RawbyPalette.textMutedLight,
        textColor: isDark ? RawbyPalette.textDark : RawbyPalette.textLight,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),

      // Switch
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return colors.primary;
          return isDark ? RawbyPalette.darkMuted : RawbyPalette.lightMuted;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return colors.primary.withOpacity(0.4);
          }
          return isDark ? RawbyPalette.darkBorder : RawbyPalette.lightBorder;
        }),
      ),

      // Progress Indicator
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: colors.primary,
        linearTrackColor: isDark ? RawbyPalette.darkBorder : RawbyPalette.lightBorder,
        linearMinHeight: 4,
      ),

      // Snackbar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: isDark ? RawbyPalette.darkCard : RawbyPalette.textLight,
        contentTextStyle: TextStyle(
          color: isDark ? RawbyPalette.textDark : RawbyPalette.lightBg,
          fontSize: 14,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        behavior: SnackBarBehavior.floating,
      ),

      // Dialog
      dialogTheme: DialogThemeData(
        backgroundColor: isDark ? RawbyPalette.darkCard : RawbyPalette.lightSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 8,
        titleTextStyle: TextStyle(
          color: isDark ? RawbyPalette.textDark : RawbyPalette.textLight,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),

      // Text theme
      textTheme: _buildTextTheme(isDark),

      // Icon theme
      iconTheme: IconThemeData(
        color: isDark ? RawbyPalette.textMutedDark : RawbyPalette.textMutedLight,
        size: 20,
      ),
    );
  }

  // ── Color Schemes ────────────────────────────────────────────

  static ColorScheme _darkColorScheme(AccentColors colors) {
    return ColorScheme.dark(
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      primaryContainer: colors.primaryDark,
      onPrimaryContainer: colors.onPrimary,
      secondary: colors.primaryLight,
      onSecondary: Colors.white,
      surface: RawbyPalette.darkBg,
      onSurface: RawbyPalette.textDark,
      surfaceContainerHighest: RawbyPalette.darkCard,
      onSurfaceVariant: RawbyPalette.textMutedDark,
      outline: RawbyPalette.darkBorder,
      outlineVariant: RawbyPalette.darkBorder.withOpacity(0.5),
      error: RawbyPalette.danger,
      onError: Colors.white,
      shadow: Colors.black.withOpacity(0.5),
    );
  }

  static ColorScheme _lightColorScheme(AccentColors colors) {
    return ColorScheme.light(
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      primaryContainer: colors.primaryLight.withOpacity(0.2),
      onPrimaryContainer: colors.primaryDark,
      secondary: colors.primaryLight,
      onSecondary: Colors.white,
      surface: RawbyPalette.lightBg,
      onSurface: RawbyPalette.textLight,
      surfaceContainerHighest: RawbyPalette.lightCard,
      onSurfaceVariant: RawbyPalette.textMutedLight,
      outline: RawbyPalette.lightBorder,
      outlineVariant: RawbyPalette.lightBorder.withOpacity(0.5),
      error: RawbyPalette.danger,
      onError: Colors.white,
      shadow: Colors.black.withOpacity(0.1),
    );
  }

  // ── Text Theme ───────────────────────────────────────────────

  static TextTheme _buildTextTheme(bool isDark) {
    final baseColor = isDark ? RawbyPalette.textDark : RawbyPalette.textLight;
    final mutedColor = isDark ? RawbyPalette.textMutedDark : RawbyPalette.textMutedLight;

    return TextTheme(
      // Display
      displayLarge: TextStyle(
        fontSize: 48,
        fontWeight: FontWeight.w700,
        color: baseColor,
        letterSpacing: -1.5,
        height: 1.1,
      ),
      displayMedium: TextStyle(
        fontSize: 36,
        fontWeight: FontWeight.w700,
        color: baseColor,
        letterSpacing: -1.0,
        height: 1.15,
      ),
      displaySmall: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: baseColor,
        letterSpacing: -0.5,
        height: 1.2,
      ),
      // Headline
      headlineLarge: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: baseColor,
        letterSpacing: -0.3,
        height: 1.25,
      ),
      headlineMedium: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: baseColor,
        letterSpacing: -0.2,
        height: 1.3,
      ),
      headlineSmall: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: baseColor,
        letterSpacing: -0.1,
        height: 1.35,
      ),
      // Title
      titleLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: baseColor,
        letterSpacing: 0,
        height: 1.4,
      ),
      titleMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: baseColor,
        letterSpacing: 0.1,
        height: 1.4,
      ),
      titleSmall: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: mutedColor,
        letterSpacing: 0.1,
        height: 1.4,
      ),
      // Body
      bodyLarge: TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: baseColor,
        height: 1.6,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: baseColor,
        height: 1.55,
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: mutedColor,
        height: 1.5,
      ),
      // Label
      labelLarge: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: baseColor,
        letterSpacing: 0.1,
      ),
      labelMedium: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: mutedColor,
        letterSpacing: 0.2,
      ),
      labelSmall: TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w500,
        color: mutedColor,
        letterSpacing: 0.5,
      ),
    );
  }
}

/// Custom page transition to mimic document.startViewTransition
class _FadeUpwardsPageTransitionsBuilder extends PageTransitionsBuilder {
  const _FadeUpwardsPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutQuad,
      ),
      child: child,
    );
  }
}
