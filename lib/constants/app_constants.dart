// ============================================================
// RAWBY — App Constants
// ============================================================

class AppConstants {
  AppConstants._();

  // API — change to your Render URL after deployment
  // e.g. 'https://rawby-server.onrender.com'
  static const String apiBaseUrl = 'https://rawby-1.onrender.com';
  static const String storageKey = 'rawby_state_v1';
  static const String aiSettingsKey = 'rawby_ai_settings_v1';
  static const String themeKey = 'rawby_theme_v1';
  static const String authTokenKey = 'rawby_auth_token';

  // Timezone
  static const String hungaryTz = 'Europe/Budapest';

  // Scoring
  static const int sequencePoints = 10;
  static const int shortStoryPoints = 30;
  static const int storyCharacterPoints = 50;
  static const int bigProjectPoints = 150;
  static const int bigProjectDnfPenalty = -150;

  // Penalty multipliers
  static const double penaltyOnTime = 1.0;
  static const double penaltyOneDay = 0.9;
  static const double penaltyTwoDays = 0.75;
  static const double penaltyThreePlus = 0.5;

  // Test run cutoff
  static final DateTime testRunCutoff = DateTime.utc(2026, 5, 1);

  // Regen limit per week
  static const int regenLimit = 3;

  // Big project duration
  static const int bigProjectMinDays = 14;
  static const int bigProjectMaxDays = 24;

  // Gear idle warning (days)
  static const int gearIdleWarningDays = 30;

  // Responsive breakpoint
  static const double mobileBreakpoint = 768.0;

  // Debounce sync delay
  static const Duration syncDebounce = Duration(seconds: 3);

  // IG stats refresh throttle
  static const Duration igRefreshThrottle = Duration(minutes: 10);
}
