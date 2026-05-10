// ============================================================
// RAWBY — Side Navigation (Desktop)
// ============================================================
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../providers/router_provider.dart';
import '../../theme/app_colors.dart';

class RawbySideNav extends StatelessWidget {
  final int currentIndex;
  final bool isAdmin;

  const RawbySideNav({
    super.key,
    required this.currentIndex,
    required this.isAdmin,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final items = _buildItems(isAdmin);

    return Container(
      width: 72,
      color: isDark ? RawbyPalette.darkSurface : RawbyPalette.lightSurface,
      child: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Logo placeholder
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.videocam_rounded,
                color: theme.colorScheme.primary,
                size: 22,
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.builder(
                itemCount: items.length,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                itemBuilder: (context, index) {
                  final item = items[index];
                  final isSelected = currentIndex == index;
                  final color = isSelected
                      ? theme.colorScheme.primary
                      : (isDark
                          ? RawbyPalette.textMutedDark
                          : RawbyPalette.textMutedLight);

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Tooltip(
                      message: item.label,
                      preferBelow: false,
                      child: InkWell(
                        onTap: () => context.go(item.route),
                        borderRadius: BorderRadius.circular(10),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(
                            vertical: 10,
                            horizontal: 8,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? theme.colorScheme.primary.withOpacity(0.12)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isSelected ? item.activeIcon : item.icon,
                                color: color,
                                size: 22,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item.label,
                                style: TextStyle(
                                  color: color,
                                  fontSize: 9,
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.w400,
                                ),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  static List<_NavItem> _buildItems(bool isAdmin) {
    final items = [
      _NavItem(
        label: 'Home',
        icon: Icons.home_outlined,
        activeIcon: Icons.home,
        route: Routes.home,
      ),
      _NavItem(
        label: 'Prompts',
        icon: Icons.lightbulb_outline,
        activeIcon: Icons.lightbulb,
        route: Routes.prompts,
      ),
      _NavItem(
        label: 'Board',
        icon: Icons.leaderboard_outlined,
        activeIcon: Icons.leaderboard,
        route: Routes.leaderboard,
      ),
      _NavItem(
        label: 'Gear',
        icon: Icons.camera_outlined,
        activeIcon: Icons.camera,
        route: Routes.gear,
      ),
      _NavItem(
        label: 'Profile',
        icon: Icons.person_outline,
        activeIcon: Icons.person,
        route: Routes.profile,
      ),
    ];

    if (isAdmin) {
      items.add(_NavItem(
        label: 'Admin',
        icon: Icons.settings_outlined,
        activeIcon: Icons.settings,
        route: Routes.admin,
      ));
    }

    return items;
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String route;

  const _NavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.route,
  });
}
