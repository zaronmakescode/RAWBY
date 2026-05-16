// ============================================================
// RAWBY — Aurora AI Assistant
// Animated orb + text chat + voice (Pro) + navigation commands +
// filmmaking guidance keyed off session state.
// ============================================================
import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../models/user_session.dart';
import '../providers/router_provider.dart';
import '../providers/user_session_provider.dart';
import '../theme/app_colors.dart';
import '../widgets/common/glass_card.dart';

class AssistantScreen extends ConsumerStatefulWidget {
  const AssistantScreen({super.key});

  @override
  ConsumerState<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends ConsumerState<AssistantScreen>
    with TickerProviderStateMixin {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  final List<_Msg> _messages = [];
  late final AnimationController _orb;
  late final stt.SpeechToText _speech;
  bool _listening = false;
  bool _thinking = false;
  bool _speechReady = false;

  @override
  void initState() {
    super.initState();
    _orb = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat();
    _speech = stt.SpeechToText();
    _initSpeech();
    _greet();
  }

  Future<void> _initSpeech() async {
    try {
      _speechReady = await _speech.initialize(
        onStatus: (s) {
          if (mounted && s == 'notListening' && _listening) {
            setState(() => _listening = false);
          }
        },
      );
    } catch (_) {
      _speechReady = false;
    }
  }

  void _greet() {
    final session = ref.read(userSessionProvider);
    final hour = DateTime.now().hour;
    final salute = hour < 5
        ? 'Up late'
        : hour < 12
            ? 'Morning'
            : hour < 18
                ? 'Afternoon'
                : 'Evening';
    final name = session.displayName.isNotEmpty
        ? session.displayName
        : (session.username.isNotEmpty ? session.username : 'creator');
    final hint = _contextHint(session);
    _messages.add(_Msg(
      role: 'aurora',
      text: '$salute, $name. I\'m Aurora — your RAWBY co-pilot.\n$hint',
      at: DateTime.now(),
    ));
  }

  String _contextHint(UserSession s) {
    if (s.prompts.isEmpty && s.selectedPromptId == null) {
      return 'No prompts this week yet. Say "generate prompts" or tap a quick action below.';
    }
    if (s.selectedPromptId == null) {
      return '${s.prompts.length} prompts ready. Want me to pick one for you? Try "recommend".';
    }
    if (s.isSubmitted) {
      return 'Submitted. Stats unlock ${_relativeDays(s.statsUnlockDate)}. Ask anything.';
    }
    final deadline = DateTime.tryParse(s.deadline);
    if (deadline != null) {
      final hours = deadline.difference(DateTime.now()).inHours;
      if (hours < 24) {
        return 'Deadline in $hours hours. Need a fast workflow plan?';
      }
      return 'Working on a ${_levelOfSelected(s)}? Ask for lighting, sound, or story tips.';
    }
    return 'What can I help with?';
  }

  String _levelOfSelected(UserSession s) {
    if (s.prompts.isEmpty) return 'project';
    final p = s.prompts.firstWhere(
      (p) => p.id == s.selectedPromptId,
      orElse: () => s.prompts.first,
    );
    return p.level;
  }

  String _relativeDays(DateTime when) {
    final d = when.difference(DateTime.now()).inDays;
    if (d <= 0) return 'today';
    if (d == 1) return 'tomorrow';
    return 'in $d days';
  }

  @override
  void dispose() {
    _orb.dispose();
    _input.dispose();
    _scroll.dispose();
    _speech.stop();
    super.dispose();
  }

  // ── Mic ──────────────────────────────────────────────────────

  Future<void> _toggleListening() async {
    final session = ref.read(userSessionProvider);
    final isPro = session.role == 'admin' || session.role == 'paid';
    if (!isPro) {
      _showProGate();
      return;
    }
    if (!_speechReady) {
      _bot('Microphone permission denied or unavailable on this device.');
      return;
    }
    HapticFeedback.lightImpact();
    if (_listening) {
      await _speech.stop();
      setState(() => _listening = false);
      return;
    }
    setState(() => _listening = true);
    await _speech.listen(
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
      partialResults: true,
      onResult: (r) {
        _input.text = r.recognizedWords;
        if (r.finalResult && r.recognizedWords.trim().isNotEmpty) {
          _send(r.recognizedWords);
        }
      },
    );
  }

  void _showProGate() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Voice is a Pro feature'),
        content: const Text(
            'Talking to Aurora hands-free is reserved for Pro members. Text input remains free for everyone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Got it')),
        ],
      ),
    );
  }

  // ── Sending ──────────────────────────────────────────────────

  Future<void> _send(String text) async {
    text = text.trim();
    if (text.isEmpty || _thinking) return;
    HapticFeedback.selectionClick();
    setState(() {
      _messages.add(_Msg(role: 'me', text: text, at: DateTime.now()));
      _input.clear();
      _thinking = true;
    });
    _scrollToBottom();

    final navigated = _tryNavigate(text);
    await Future<void>.delayed(const Duration(milliseconds: 700));

    if (!navigated) {
      _bot(_localResponse(text));
    } else {
      _bot('Done. Anything else?');
    }
    setState(() => _thinking = false);
    _scrollToBottom();
  }

  void _bot(String text) {
    _messages.add(_Msg(role: 'aurora', text: text, at: DateTime.now()));
  }

  bool _tryNavigate(String text) {
    final t = text.toLowerCase();
    final triggers = ['go to', 'open', 'navigate to', 'show', 'take me to'];
    if (!triggers.any(t.contains)) return false;
    final map = <String, String>{
      'home': Routes.home,
      'prompt': Routes.prompts,
      'leaderboard': Routes.leaderboard,
      'profile': Routes.profile,
      'gear': Routes.gear,
      'settings': Routes.settings,
      'idea': Routes.ideaBank,
      'bank': Routes.ideaBank,
      'admin': Routes.admin,
    };
    for (final entry in map.entries) {
      if (t.contains(entry.key)) {
        Future.microtask(() {
          if (!mounted) return;
          context.go(entry.value);
        });
        return true;
      }
    }
    return false;
  }

  String _localResponse(String input) {
    final t = input.toLowerCase();
    final s = ref.read(userSessionProvider);

    if (t.contains('recommend') || t.contains('pick') || t.contains('choose')) {
      if (s.prompts.isEmpty) {
        return 'No prompts to choose from. Generate first — say "generate prompts" or open the Prompts screen.';
      }
      final p = s.prompts.firstWhere(
        (p) => p.level == 'Short Story',
        orElse: () => s.prompts.first,
      );
      return 'Try the ${p.level} — "${_firstSentence(p.text)}" Worth ${p.points} pts. Tap a card on the Prompts screen to lock it in.';
    }

    if (t.contains('deadline') || t.contains('how long') || t.contains('when')) {
      final d = DateTime.tryParse(s.deadline);
      if (d == null) return 'No active week.';
      final hours = d.difference(DateTime.now()).inHours;
      return 'Deadline: ${d.toLocal()}. That\'s ${hours} hours from now. Submit early — penalty kicks in after the deadline (0.9× day 1, 0.75× day 2, 0.5× after).';
    }

    if (t.contains('streak')) {
      return 'Current streak: ${s.streak} week${s.streak == 1 ? '' : 's'}. Each consecutive Friday-to-Friday submission keeps it alive.';
    }

    if (t.contains('score') || t.contains('points')) {
      return 'Total score: ${s.totalScore} pts. Level scores: Sequence 10, Short Story 30, Story+Character 50. Likes multiplier kicks in after stats unlock.';
    }

    if (t.contains('light')) {
      return 'Lighting fast rules: 1) one key source, 2) keep faces 45° off-axis from key, 3) practical lights = soul. For solo work, window + bounce card beats most kit. Avoid mixed color temps.';
    }

    if (t.contains('sound') || t.contains('audio')) {
      return 'Sound carries the cut. Record 30s of room tone on every location. For solo dialog use a wired lav or your phone in a pocket — sync in post. Music: choose tempo before story locks.';
    }

    if (t.contains('color') || t.contains('grade') || t.contains('lut')) {
      return 'Grade in 3 passes: 1) match shots (exposure + WB), 2) creative look (LUT or curves), 3) shape attention (power windows on faces). Keep skin in the 60-70 luminance range.';
    }

    if (t.contains('story') || t.contains('script')) {
      return 'A 30-sec story needs: a setup (5s), a turn (10s), a release (15s). Write the LAST shot first — work backwards. The thing the viewer takes away is the only thing that matters.';
    }

    if (t.contains('post') || t.contains('caption') || t.contains('instagram')) {
      return 'IG Reels: 1) lead frame is your hook — full-frame motion in frame 1, 2) caption length 60-90 chars, 3) post Thu-Sun 18-21 local time, 4) reuse trending audio that matches your story\'s tempo.';
    }

    if (t.contains('gear')) {
      final spent = s.gearPurchases.fold<int>(0, (acc, g) => acc + g.pointCost);
      return 'You\'ve declared $spent gear pts (${s.gearPurchases.length} items, ${s.subscriptions.where((x) => x.isActive).length} active subs). Add or edit on the Gear screen.';
    }

    if (t.contains('regen') || t.contains('generate')) {
      if (s.regensLeft <= 0) {
        return 'You\'re out of regens this week — comes back next Friday. Need a custom angle on a current prompt? I can suggest variations.';
      }
      return 'You\'ve got ${s.regensLeft} regen${s.regensLeft == 1 ? '' : 's'} left. Open Prompts → tap "Regenerate" — or say "go to prompts".';
    }

    if (t.contains('help') || t.contains('?')) {
      return 'Try: "recommend a prompt", "how long until deadline", "lighting tips", "go to leaderboard", "explain scoring".';
    }

    return 'Heard. I can give filmmaking advice, navigate the app, or coach you through the workflow. Try the suggestion chips below or ask me anything.';
  }

  String _firstSentence(String text) {
    final idx = text.indexOf('.');
    if (idx == -1) return text.length > 80 ? '${text.substring(0, 80)}…' : text;
    return text.substring(0, idx + 1);
  }

  void _scrollToBottom() {
    Future<void>.delayed(const Duration(milliseconds: 100), () {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent + 100,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ── UI ───────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final session = ref.watch(userSessionProvider);
    final isPro = session.role == 'admin' || session.role == 'paid';

    return Scaffold(
      body: AuraBackground(
        colors: [
          theme.colorScheme.primary.withOpacity(0.18),
          theme.colorScheme.secondary.withOpacity(0.14),
        ],
        child: SafeArea(
          child: Column(
            children: [
              _Header(orb: _orb, listening: _listening, thinking: _thinking),
              Expanded(
                child: ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
                  itemCount: _messages.length + (_thinking ? 1 : 0),
                  itemBuilder: (ctx, i) {
                    if (i == _messages.length) {
                      return const _TypingBubble().animate().fadeIn();
                    }
                    final m = _messages[i];
                    return _Bubble(
                      msg: m,
                      delay: i * 60,
                    );
                  },
                ),
              ),
              _SuggestionRow(onTap: (s) => _send(s)),
              _Composer(
                controller: _input,
                listening: _listening,
                pro: isPro,
                onSubmit: () => _send(_input.text),
                onMic: _toggleListening,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Messages ───────────────────────────────────────────────────

class _Msg {
  final String role;
  final String text;
  final DateTime at;
  _Msg({required this.role, required this.text, required this.at});
}

class _Bubble extends StatelessWidget {
  final _Msg msg;
  final int delay;

  const _Bubble({required this.msg, required this.delay});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMe = msg.role == 'me';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary,
                    theme.colorScheme.secondary,
                  ],
                ),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.auto_awesome,
                  color: Colors.white, size: 14),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                gradient: isMe
                    ? LinearGradient(colors: [
                        theme.colorScheme.primary,
                        theme.colorScheme.secondary,
                      ])
                    : null,
                color: isMe
                    ? null
                    : theme.colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isMe ? 18 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 18),
                ),
                border: isMe
                    ? null
                    : Border.all(color: theme.colorScheme.outline),
              ),
              child: Text(
                msg.text,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.45,
                  color: isMe
                      ? Colors.white
                      : theme.colorScheme.onSurface,
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate(delay: Duration(milliseconds: delay)).fadeIn().slideY(
          begin: 0.06,
          end: 0,
          curve: Curves.easeOutCubic,
        );
  }
}

class _TypingBubble extends StatelessWidget {
  const _TypingBubble();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [
                theme.colorScheme.primary,
                theme.colorScheme.secondary,
              ]),
              shape: BoxShape.circle,
            ),
            child:
                const Icon(Icons.auto_awesome, color: Colors.white, size: 14),
          ),
          const SizedBox(width: 8),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: theme.colorScheme.outline),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (i) {
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: _Dot(delay: 200 * i),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final int delay;
  const _Dot({required this.delay});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: 6,
      height: 6,
      decoration: BoxDecoration(
        color: theme.colorScheme.primary,
        shape: BoxShape.circle,
      ),
    )
        .animate(
          onPlay: (c) => c.repeat(reverse: true),
          delay: Duration(milliseconds: delay),
        )
        .fadeIn(duration: 400.ms)
        .then()
        .fadeOut(duration: 400.ms);
  }
}

// ── Header (animated orb + status) ─────────────────────────────

class _Header extends StatelessWidget {
  final AnimationController orb;
  final bool listening;
  final bool thinking;

  const _Header({
    required this.orb,
    required this.listening,
    required this.thinking,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
      child: Row(
        children: [
          AnimatedBuilder(
            animation: orb,
            builder: (_, __) {
              return Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: theme.colorScheme.primary.withOpacity(
                          listening ? 0.6 : (thinking ? 0.5 : 0.35)),
                      blurRadius: 28,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: CustomPaint(
                  painter: _OrbPainter(
                    progress: orb.value,
                    primary: theme.colorScheme.primary,
                    secondary: theme.colorScheme.secondary,
                    pulse: listening || thinking,
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Aurora',
                  style: theme.textTheme.headlineLarge,
                ),
                Text(
                  listening
                      ? 'Listening…'
                      : thinking
                          ? 'Thinking…'
                          : 'Always on. Always cinematic.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: listening
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurfaceVariant,
                    fontWeight:
                        listening ? FontWeight.w700 : FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.tune),
            tooltip: 'Settings',
            onPressed: () => context.push(Routes.settings),
          ),
        ],
      ),
    );
  }
}

class _OrbPainter extends CustomPainter {
  final double progress;
  final Color primary;
  final Color secondary;
  final bool pulse;

  _OrbPainter({
    required this.progress,
    required this.primary,
    required this.secondary,
    required this.pulse,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final t = progress * 2 * math.pi;
    final pulseAmp = pulse ? 0.06 : 0.02;
    final inner = radius * (0.7 + math.sin(t * 2) * pulseAmp);

    final glow = Paint()
      ..shader = RadialGradient(
        colors: [
          secondary.withOpacity(0.9),
          primary.withOpacity(0.4),
          Colors.transparent,
        ],
        stops: const [0.0, 0.5, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: radius));
    canvas.drawCircle(center, radius, glow);

    for (int i = 0; i < 3; i++) {
      final phase = t + i * (math.pi * 2 / 3);
      final r = inner + math.sin(phase) * 4;
      final blob = Paint()
        ..shader = RadialGradient(
          colors: [
            primary.withOpacity(0.9),
            secondary.withOpacity(0.0),
          ],
        ).createShader(Rect.fromCircle(
            center: center +
                Offset(math.cos(phase) * 4, math.sin(phase) * 4),
            radius: r));
      canvas.drawCircle(
          center + Offset(math.cos(phase) * 4, math.sin(phase) * 4),
          r,
          blob);
    }
  }

  @override
  bool shouldRepaint(covariant _OrbPainter old) =>
      old.progress != progress || old.pulse != pulse;
}

// ── Suggestions row ────────────────────────────────────────────

class _SuggestionRow extends StatelessWidget {
  final ValueChanged<String> onTap;
  const _SuggestionRow({required this.onTap});

  static const _items = [
    ('Recommend a prompt', Icons.auto_awesome),
    ('Lighting tips', Icons.wb_sunny_outlined),
    ('Story structure', Icons.movie_creation_outlined),
    ('Scoring rules', Icons.score),
    ('Go to prompts', Icons.list_alt),
    ('Deadline status', Icons.access_time),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (ctx, i) {
          final (label, icon) = _items[i];
          return ActionChip(
            avatar: Icon(icon, size: 14),
            label: Text(label, style: const TextStyle(fontSize: 12)),
            onPressed: () => onTap(label),
          );
        },
      ),
    );
  }
}

// ── Composer (text + mic) ──────────────────────────────────────

class _Composer extends StatelessWidget {
  final TextEditingController controller;
  final bool listening;
  final bool pro;
  final VoidCallback onSubmit;
  final VoidCallback onMic;

  const _Composer({
    required this.controller,
    required this.listening,
    required this.pro,
    required this.onSubmit,
    required this.onMic,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.fromLTRB(
        16,
        12,
        16,
        MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              minLines: 1,
              maxLines: 4,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => onSubmit(),
              decoration: InputDecoration(
                hintText: listening ? 'Listening…' : 'Ask Aurora anything…',
                prefixIcon: const Icon(Icons.chat_bubble_outline, size: 18),
              ),
            ),
          ),
          const SizedBox(width: 8),
          _MicButton(listening: listening, pro: pro, onTap: onMic),
          const SizedBox(width: 6),
          _SendButton(onTap: onSubmit),
        ],
      ),
    );
  }
}

class _MicButton extends StatelessWidget {
  final bool listening;
  final bool pro;
  final VoidCallback onTap;

  const _MicButton({
    required this.listening,
    required this.pro,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(28),
            onTap: onTap,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: listening
                    ? LinearGradient(colors: [
                        theme.colorScheme.primary,
                        theme.colorScheme.secondary,
                      ])
                    : null,
                color: listening
                    ? null
                    : theme.colorScheme.surfaceContainerHighest,
                border: Border.all(
                  color: listening
                      ? Colors.transparent
                      : theme.colorScheme.outline,
                ),
              ),
              child: Icon(
                listening ? Icons.stop : Icons.mic_none_outlined,
                color: listening
                    ? Colors.white
                    : theme.colorScheme.primary,
                size: 20,
              ),
            ),
          ),
        ),
        if (!pro)
          Positioned(
            top: -6,
            right: -6,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    RawbyPalette.cinema500,
                    RawbyPalette.cinema600,
                  ],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'PRO',
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: 0.6,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _SendButton extends StatelessWidget {
  final VoidCallback onTap;
  const _SendButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(28),
        onTap: onTap,
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(colors: [
              theme.colorScheme.primary,
              theme.colorScheme.secondary,
            ]),
            boxShadow: [
              BoxShadow(
                color: theme.colorScheme.primary.withOpacity(0.4),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Icon(Icons.arrow_upward, color: Colors.white, size: 20),
        ),
      ),
    );
  }
}
