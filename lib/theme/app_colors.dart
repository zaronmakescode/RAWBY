// ============================================================
// RAWBY — Color Palette
// Three accents × two modes = 6 color schemes
// ============================================================
import 'package:flutter/material.dart';

// ── Raw palette ──────────────────────────────────────────────

class RawbyPalette {
  RawbyPalette._();

  // Greens (primary accent)
  static const Color green500 = Color(0xFF5A8A5E); // main green button
  static const Color green400 = Color(0xFF6FA373);
  static const Color green300 = Color(0xFF8FBD93);
  static const Color green600 = Color(0xFF3D6B41);
  static const Color green700 = Color(0xFF2A4D2D);

  // Greys (grey accent)
  static const Color grey500 = Color(0xFF6B7280);
  static const Color grey400 = Color(0xFF9CA3AF);
  static const Color grey300 = Color(0xFFD1D5DB);
  static const Color grey600 = Color(0xFF4B5563);
  static const Color grey700 = Color(0xFF374151);

  // Basic (neutral/cream accent)
  static const Color basic500 = Color(0xFF8B7355);
  static const Color basic400 = Color(0xFFA68B5B);
  static const Color basic300 = Color(0xFFC4A882);
  static const Color basic600 = Color(0xFF6B5A42);
  static const Color basic700 = Color(0xFF4A3F2F);

  // Dark backgrounds
  static const Color darkBg = Color(0xFF0D0E10);
  static const Color darkSurface = Color(0xFF161719);
  static const Color darkCard = Color(0xFF1E2023);
  static const Color darkBorder = Color(0xFF2A2C30);
  static const Color darkMuted = Color(0xFF6B7280);

  // Light backgrounds
  static const Color lightBg = Color(0xFFF4F4F3);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightCard = Color(0xFFF9F9F8);
  static const Color lightBorder = Color(0xFFE5E5E3);
  static const Color lightMuted = Color(0xFF9CA3AF);

  // Input field (cream/beige — matches login screen)
  static const Color inputCream = Color(0xFFF5F5DC);
  static const Color inputCreamDark = Color(0xFFEEEED0);

  // Status
  static const Color danger = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color caution = Color(0xFFFBBF24);
  static const Color success = Color(0xFF22C55E);
  static const Color info = Color(0xFF3B82F6);

  // Text
  static const Color textDark = Color(0xFFF1F1F0);
  static const Color textLight = Color(0xFF1A1A1A);
  static const Color textMutedDark = Color(0xFF9CA3AF);
  static const Color textMutedLight = Color(0xFF6B7280);
}

// ── Accent color resolver ────────────────────────────────────

class AccentColors {
  final Color primary;
  final Color primaryLight;
  final Color primaryDark;
  final Color onPrimary;

  const AccentColors({
    required this.primary,
    required this.primaryLight,
    required this.primaryDark,
    required this.onPrimary,
  });

  static AccentColors forAccent(String accent) {
    switch (accent) {
      case 'grey':
        return const AccentColors(
          primary: RawbyPalette.grey500,
          primaryLight: RawbyPalette.grey400,
          primaryDark: RawbyPalette.grey600,
          onPrimary: Colors.white,
        );
      case 'basic':
        return const AccentColors(
          primary: RawbyPalette.basic500,
          primaryLight: RawbyPalette.basic400,
          primaryDark: RawbyPalette.basic600,
          onPrimary: Colors.white,
        );
      case 'green':
      default:
        return const AccentColors(
          primary: RawbyPalette.green500,
          primaryLight: RawbyPalette.green400,
          primaryDark: RawbyPalette.green600,
          onPrimary: Colors.white,
        );
    }
  }
}
