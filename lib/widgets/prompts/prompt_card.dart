// ============================================================
// RAWBY — Prompt Card Widget
// Displays a single prompt with level badge, shots, songs,
// save (star) button, and Choose action.
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/prompt_model.dart';
import '../../providers/user_session_provider.dart';
import '../../theme/app_colors.dart';

class PromptCard extends ConsumerStatefulWidget {
  final PromptModel prompt;
  final bool isSelected;
  final bool isLocked;
  final VoidCallback? onChoose;

  const PromptCard({
    super.key,
    required this.prompt,
    this.isSelected = false,
    this.isLocked = false,
    this.onChoose,
  });

  @override
  ConsumerState<PromptCard> createState() => _PromptCardState();
}

class _PromptCardState extends ConsumerState<PromptCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final session = ref.watch(userSessionProvider);
    final isSaved = session.savedPrompts.any((p) => p.id == widget.prompt.id);
    final p = widget.prompt;

    final levelColor = _levelColor(p.level, theme);
    final levelIcon = _levelIcon(p.level);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: isDark ? RawbyPalette.darkCard : RawbyPalette.lightCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: widget.isSelected
              ? theme.colorScheme.primary
              : (isDark ? RawbyPalette.darkBorder : RawbyPalette.lightBorder),
          width: widget.isSelected ? 2 : 1,
        ),
        boxShadow: widget.isSelected
            ? [
                BoxShadow(
                  color: theme.colorScheme.primary.withOpacity(0.15),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                )
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
            child: Row(
              children: [
                // Level badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: levelColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(levelIcon, style: const TextStyle(fontSize: 11)),
                      const SizedBox(width: 4),
                      Text(
                        '${p.level} · ${p.points} pts',
                        style: TextStyle(
                          color: levelColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),

                // Source badge
                if (p.source == 'ai')
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.secondary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'AI',
                      style: TextStyle(
                        color: theme.colorScheme.secondary,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                if (p.source == 'custom')
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: RawbyPalette.basic500.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'CUSTOM',
                      style: TextStyle(
                        color: RawbyPalette.basic500,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),

                const SizedBox(width: 8),

                // Star / save button
                GestureDetector(
                  onTap: () {
                    if (isSaved) {
                      ref
                          .read(userSessionProvider.notifier)
                          .removeSavedPrompt(p.id);
                    } else {
                      ref
                          .read(userSessionProvider.notifier)
                          .savePrompt(p);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('Saved to Idea Bank ★'),
                          duration: const Duration(seconds: 2),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    }
                  },
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      isSaved ? Icons.star : Icons.star_border,
                      key: ValueKey(isSaved),
                      color: isSaved
                          ? const Color(0xFFF59E0B)
                          : theme.colorScheme.onSurfaceVariant,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Prompt Text ──────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
            child: Text(
              p.text,
              style: theme.textTheme.bodyMedium?.copyWith(
                height: 1.6,
                fontWeight: FontWeight.w400,
              ),
            ),
          ),

          // ── Inspiration ──────────────────────────────────────
          if (p.inspiration.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
              child: Row(
                children: [
                  Icon(
                    Icons.person_outline,
                    size: 13,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Inspired by ${p.inspiration}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.primary.withOpacity(0.8),
                    ),
                  ),
                ],
              ),
            ),

          // ── Expandable Details (shots, songs, metadata) ──────
          if (p.shots.isNotEmpty || p.songs.isNotEmpty || p.outcome.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
              child: GestureDetector(
                onTap: () => setState(() => _expanded = !_expanded),
                child: Row(
                  children: [
                    Text(
                      _expanded ? 'Hide details' : 'Show shots & music',
                      style: TextStyle(
                        color: theme.colorScheme.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      _expanded
                          ? Icons.keyboard_arrow_up
                          : Icons.keyboard_arrow_down,
                      color: theme.colorScheme.primary,
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),

          if (_expanded) ...[
            // Shots
            if (p.shots.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Shot List',
                      style: theme.textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    ...p.shots.map((shot) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 4,
                                height: 4,
                                margin: const EdgeInsets.only(top: 6, right: 8),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primary,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  shot,
                                  style: theme.textTheme.bodySmall,
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),

            // Songs
            if (p.songs.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Music Suggestions',
                      style: theme.textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    ...p.songs.map((song) => Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: isDark
                                ? RawbyPalette.darkBg
                                : RawbyPalette.lightBg,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.music_note,
                                      size: 13, color: RawbyPalette.green500),
                                  const SizedBox(width: 5),
                                  Expanded(
                                    child: Text(
                                      '${song.title} — ${song.artist}',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 5,
                                      vertical: 1,
                                    ),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.primary
                                          .withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      song.type,
                                      style: TextStyle(
                                        color: theme.colorScheme.primary,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              if (song.whyItWorks.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(
                                  song.whyItWorks,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        )),
                  ],
                ),
              ),

            // Metadata (outcome, purpose, emotion)
            if (p.outcome.isNotEmpty || p.purpose.isNotEmpty || p.emotion.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
                child: Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    if (p.outcome.isNotEmpty)
                      _MetaChip(label: '🎯 ${p.outcome}', theme: theme),
                    if (p.purpose.isNotEmpty)
                      _MetaChip(label: '💡 ${p.purpose}', theme: theme),
                    if (p.emotion.isNotEmpty)
                      _MetaChip(label: '🎭 ${p.emotion}', theme: theme),
                  ],
                ),
              ),

            // License-free keywords
            if (p.licenseFreeKeywords.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Royalty-free search terms',
                      style: theme.textTheme.labelMedium,
                    ),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 4,
                      runSpacing: 4,
                      children: p.licenseFreeKeywords
                          .map((kw) => Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? RawbyPalette.darkBg
                                      : RawbyPalette.lightBg,
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(
                                    color: isDark
                                        ? RawbyPalette.darkBorder
                                        : RawbyPalette.lightBorder,
                                  ),
                                ),
                                child: Text(
                                  kw,
                                  style: theme.textTheme.bodySmall,
                                ),
                              ))
                          .toList(),
                    ),
                  ],
                ),
              ),
          ],

          // ── Actions ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                if (!widget.isLocked)
                  Expanded(
                    child: ElevatedButton(
                      onPressed: widget.isSelected ? null : widget.onChoose,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: widget.isSelected
                            ? theme.colorScheme.primary.withOpacity(0.5)
                            : theme.colorScheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: Text(
                        widget.isSelected ? '✓ Chosen' : 'Choose This',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  )
                else
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: theme.colorScheme.primary.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        '✓ This Week\'s Prompt',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: theme.colorScheme.primary,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _levelColor(String level, ThemeData theme) {
    switch (level) {
      case 'Short Story':
        return theme.colorScheme.secondary;
      case 'Story + Character':
        return RawbyPalette.basic500;
      default: // Sequence
        return theme.colorScheme.primary;
    }
  }

  String _levelIcon(String level) {
    switch (level) {
      case 'Short Story':
        return '🎬';
      case 'Story + Character':
        return '🎭';
      default:
        return '🎞️';
    }
  }
}

class _MetaChip extends StatelessWidget {
  final String label;
  final ThemeData theme;

  const _MetaChip({required this.label, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: theme.colorScheme.outline),
      ),
      child: Text(label, style: theme.textTheme.bodySmall),
    );
  }
}
