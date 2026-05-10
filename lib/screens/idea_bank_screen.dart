// ============================================================
// RAWBY — Idea Bank Screen
// Shows all saved (starred) prompts for future use
// ============================================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/user_session_provider.dart';
import '../widgets/prompts/prompt_card.dart';

class IdeaBankScreen extends ConsumerWidget {
  const IdeaBankScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(userSessionProvider);
    final theme = Theme.of(context);
    final saved = session.savedPrompts;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Idea Bank'),
            const SizedBox(width: 8),
            if (saved.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${saved.length}',
                  style: TextStyle(
                    color: theme.colorScheme.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          if (saved.isNotEmpty)
            TextButton(
              onPressed: () => _confirmClearAll(context, ref),
              child: Text(
                'Clear all',
                style: TextStyle(
                  color: theme.colorScheme.error,
                  fontSize: 13,
                ),
              ),
            ),
        ],
      ),
      body: saved.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.star_border,
                    size: 56,
                    color: theme.colorScheme.outline,
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'No saved prompts yet',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Tap ★ on any prompt to save it here\nfor a future week.',
                    style: theme.textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              itemCount: saved.length,
              itemBuilder: (context, index) {
                final prompt = saved[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Stack(
                    children: [
                      PromptCard(
                        prompt: prompt,
                        isSelected: false,
                        isLocked: false,
                        onChoose: () {
                          // Use this saved prompt as the current week's prompt
                          ref
                              .read(userSessionProvider.notifier)
                              .setPrompts([prompt]);
                          ref
                              .read(userSessionProvider.notifier)
                              .selectPrompt(prompt.id);
                          Navigator.of(context).pop();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'Prompt from Idea Bank activated!',
                              ),
                              duration: const Duration(seconds: 2),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  Future<void> _confirmClearAll(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clear Idea Bank?'),
        content: const Text(
          'This will remove all saved prompts. This cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(
              'Clear All',
              style: TextStyle(
                color: Theme.of(ctx).colorScheme.error,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      ref.read(userSessionProvider.notifier).clearSavedPrompts();
    }
  }
}
