// ============================================================
// RAWBY — Local Fallback Prompt Templates
// Used when server is down or AI is disabled.
// The AI (Groq/OpenAI) is the primary source of prompts.
// ============================================================

class ScenarioTemplate {
  final String cat;
  final String text;

  const ScenarioTemplate({required this.cat, required this.text});
}

class CreatorStyle {
  final String handle;
  final String profileUrl;
  final String style;
  final String referenceHint;

  const CreatorStyle({
    required this.handle,
    required this.profileUrl,
    required this.style,
    required this.referenceHint,
  });
}

class PromptTemplates {
  PromptTemplates._();

  // ── Creator Styles ──────────────────────────────────────────
  static const List<CreatorStyle> creatorStyles = [
    CreatorStyle(
      handle: '@nicholasklepper',
      profileUrl: 'https://www.instagram.com/nicholasklepper/',
      style:
          'Miami-based cinematic reels, rich filmic color grading with halation and film curves, scroll-stopping short-form brand content, warm contrasty tones, tight framing on faces and products',
      referenceHint:
          'look for his cinematic brand reels and color-graded lifestyle content shot in Miami',
    ),
    CreatorStyle(
      handle: '@jordans.archivess',
      profileUrl: 'https://www.instagram.com/jordans.archivess/',
      style:
          'hand-drawn animation mixed with live footage, visual aesthetic exploration, diary-style archival storytelling, layered mixed-media edits, creative resource sharing',
      referenceHint:
          'look for his visual aesthetic reels that blend animation with real footage and archival elements',
    ),
    CreatorStyle(
      handle: '@omgadrian',
      profileUrl: 'https://www.instagram.com/omgadrian/',
      style:
          'cinematic music video direction, rich storytelling with Filipino heritage influences, punchy color grading, creative direction for brands and artists, educational content on color and filmmaking',
      referenceHint:
          'look for his cinematic short films and color grading breakdowns',
    ),
    CreatorStyle(
      handle: '@batt.maillie',
      profileUrl: 'https://www.instagram.com/batt.maillie/',
      style:
          'British fashion-forward cinematic mini-sitcoms, character-driven short films where he plays multiple roles, stylish wardrobe and set design, high-end brand collaborations, witty scripted storytelling',
      referenceHint:
          'look for his cinematic character-driven skits and The Gatekeepers series',
    ),
    CreatorStyle(
      handle: '@andrews_life',
      profileUrl: 'https://www.instagram.com/andrews_life/',
      style:
          'life lessons through cinematic visuals, personal documentary-style storytelling, warm natural tones, introspective narration over beautifully composed shots, emotional depth in everyday moments',
      referenceHint:
          'look for his personal cinematic essay reels with voiceover storytelling',
    ),
    CreatorStyle(
      handle: '@kylenutt',
      profileUrl: 'https://www.instagram.com/kylenutt/',
      style:
          'warm nostalgic films comparing old times with the present, vintage color grade with his signature LUT pack, sentimental storytelling about how things have changed, soft golden tones, music-driven emotional pacing',
      referenceHint:
          'look for his nostalgic then-vs-now comparison reels with warm vintage grading',
    ),
    CreatorStyle(
      handle: '@ferry.kch',
      profileUrl: 'https://www.instagram.com/ferry.kch/',
      style:
          'moody European street tones, desaturated earth palette, slow handheld drifts, layered ambient sound, contemplative solo moments in urban space',
      referenceHint:
          'look for his atmospheric city-walk reels with muted color grading',
    ),
  ];

  // ── Sequence Templates (10 pts) ─────────────────────────────
  // Purely visual, no talking, music/sound only.
  static const List<ScenarioTemplate> sequence = [
    ScenarioTemplate(
      cat: 'moving_towns',
      text:
          'On the last evening before moving to a smaller town, film your apartment with no people in frame. Four wide shots and three close-ups of objects you must leave behind. End on the closed door seen from the inside. No talking. One ambient music track only.',
    ),
    ScenarioTemplate(
      cat: 'morning_routine',
      text:
          'A six-shot sequence of one room as the light shifts from blue to gold. The same hands repeating small different actions. Tripod for half the shots. No talking. Sound design is room tone and one slow track.',
    ),
    ScenarioTemplate(
      cat: 'rain_walk',
      text:
          'A solo walk in the rain through a quiet street. Five shots only: feet on wet stone, sleeve, a window with someone inside, a puddle reflection, an umbrella closing. Music carries the entire piece, no voice or speech.',
    ),
    ScenarioTemplate(
      cat: 'studio_pack',
      text:
          'Pack a camera bag, then unpack it at a different location. Cut the two halves so the same items appear under different light. No talking. One wide and one over-shoulder angle only.',
    ),
    ScenarioTemplate(
      cat: 'dawn_park',
      text:
          'Dawn in a city park before anyone arrives. Long lens compressions of empty benches and a distant lone figure stretching. Hold each shot at least eight seconds. Sound is wind and distant traffic, plus one slow piano track.',
    ),
    ScenarioTemplate(
      cat: 'window_light',
      text:
          'A pure light study of one room across one hour. Six locked-off shots of how a single window changes a wall, a chair, a glass. No people. No talking. One ambient track only.',
    ),
    ScenarioTemplate(
      cat: 'last_train',
      text:
          'The last train of the night. Film the platform from outside the glass, then inside the carriage as it empties. End on a single seat with something left behind. No talking. One melancholic track only.',
    ),
    ScenarioTemplate(
      cat: 'market_close',
      text:
          'A market stall closing for the day. Hands folding fabric, crates stacked, lights switched off one by one. End on an empty table in the last light. No talking. Ambient sound and one slow instrumental.',
    ),
    ScenarioTemplate(
      cat: 'rooftop_dusk',
      text:
          'A rooftop at dusk. Six shots: the city below, your hands on the railing, a distant antenna, the sky shifting colour, a pigeon landing, the first light turning on in a window. No talking. Wind and one track.',
    ),
    ScenarioTemplate(
      cat: 'bookshop',
      text:
          'A quiet bookshop just before closing. Spines, dust, a reading lamp, a half-drunk cup of tea, the door sign flipping to closed. No people in frame. No talking. One soft jazz or classical track.',
    ),
  ];

  // ── Short Story Templates (30 pts) ──────────────────────────
  // Solo on screen, self-filmed, story arc, no dialogue.
  static const List<ScenarioTemplate> shortStory = [
    ScenarioTemplate(
      cat: 'moving_towns',
      text:
          'Solo on camera. You decide whether to leave the city for a cheaper smaller town. Three short beats: you reading a rent message, you packing one specific object, you locking the door. No dialogue. Show the decision through one final action. Tripod for two beats, handheld for one.',
    ),
    ScenarioTemplate(
      cat: 'missed_call',
      text:
          'Solo on camera. You see a missed call from a parent. You almost call back twice, then put the phone face down and step outside. End on the front door closing from outside. No talking. One held tripod shot per beat.',
    ),
    ScenarioTemplate(
      cat: 'quit_job',
      text:
          'Solo on camera. You sit in a parked car outside an office and type a resignation message on your phone. You send it, then stay still. Show the moment you decide through your eyes only. Shoot from the passenger seat through the windshield.',
    ),
    ScenarioTemplate(
      cat: 'creative_block',
      text:
          'Solo on camera. You stare at an unedited timeline for too long, close the laptop, walk, then come back and make one specific cut. End on the cut on screen. Use only practical lights and one wide lens.',
    ),
    ScenarioTemplate(
      cat: 'last_shoot',
      text:
          'Solo on camera. You finish a small client edit you do not believe in, export it, and delete one clip on purpose before sending. Show only your hands and the screen. Music carries it.',
    ),
    ScenarioTemplate(
      cat: 'late_night_walk',
      text:
          'Solo on camera. A late night walk to clear your head after a hard week. Three beats: leaving the building, sitting on a bench, walking back lighter. No talking. Available light only.',
    ),
    ScenarioTemplate(
      cat: 'deleted_draft',
      text:
          'Solo on camera. You open a folder of old unfinished projects, watch one clip, then delete the whole folder. Three beats: opening, watching, deleting. No talking. Show only the screen and your face in reflection.',
    ),
    ScenarioTemplate(
      cat: 'first_rejection',
      text:
          'Solo on camera. You read a rejection email for a project pitch. You close the laptop, make a coffee, then open a new document and start again. No talking. Natural kitchen light only.',
    ),
    ScenarioTemplate(
      cat: 'sold_gear',
      text:
          'Solo on camera. You pack up a piece of gear you are selling. Three beats: holding it one last time, wrapping it, handing it to a courier. No talking. Close-ups on hands and the object.',
    ),
    ScenarioTemplate(
      cat: 'empty_calendar',
      text:
          'Solo on camera. You open your calendar and see a completely empty week for the first time in months. You sit with it. Then you write one thing in it. No talking. One wide shot, one close-up on the screen.',
    ),
  ];

  // ── Story + Character Templates (50 pts) ────────────────────
  // You + 1 or 2 extra people, you still operate camera, 1 spoken line max per scene.
  static const List<ScenarioTemplate> storyCharacter = [
    ScenarioTemplate(
      cat: 'moving_towns',
      text:
          'You plus one other person. A friend or sibling helps you decide whether to leave the city for a smaller town. Three short scenes: morning coffee where you cannot answer them, a walk where they ask one direct question, a goodbye at a doorway. You film everything yourself. One spoken line maximum per scene. Shallow depth, soft window light.',
    ),
    ScenarioTemplate(
      cat: 'parent_visit',
      text:
          'You plus one parent. The parent visits and quietly watches one finished video of yours on a laptop. Three beats: arrival, watching, goodbye on the staircase. One small spoken line at the end changes the tone. You film it yourself with a tripod for two beats.',
    ),
    ScenarioTemplate(
      cat: 'two_creators',
      text:
          'You plus one creator friend. You both want the same paid project. Three scenes: the agreement at a desk, you alone editing at night, the morning meeting where one of you quietly steps back. You film all of it. Cool grade, low light interiors.',
    ),
    ScenarioTemplate(
      cat: 'old_friend',
      text:
          'You plus one old friend. They visit unannounced. Across one coffee, you realise you have nothing left to say to each other. End on one of you checking the time. You operate the camera. Handheld, available light, slightly underexposed.',
    ),
    ScenarioTemplate(
      cat: 'quiet_breakup',
      text:
          'You plus one partner. You agree the relationship is over without a fight. Three scenes: shared dinner, packing one drawer, the front door. You film everything yourself with locked-off tripod shots and one wide lens. End on the empty hallway.',
    ),
    ScenarioTemplate(
      cat: 'dad_and_gear',
      text:
          'You plus your father (or another close family member). He hands over a piece of his old gear to you for a project. Three beats: him showing how it works, you trying it wrong, him nodding once. You film it yourself. Warm window light, tactile close-ups on the gear.',
    ),
    ScenarioTemplate(
      cat: 'mentor_goodbye',
      text:
          'You plus a mentor or teacher figure. Their last day at a place you both know. Three beats: them clearing a desk, a short walk outside, a handshake that lasts too long. One spoken line each. You film it. Available light, wide then tight.',
    ),
    ScenarioTemplate(
      cat: 'stranger_help',
      text:
          'You plus one stranger who helps you with something small — directions, a dropped bag, a lighter. Three beats: the moment before, the exchange, you watching them leave. One spoken line maximum. Handheld, street light, long lens for the final shot.',
    ),
    ScenarioTemplate(
      cat: 'sibling_return',
      text:
          'You plus a sibling returning home after a long time away. Three beats: the arrival at the door, a shared meal with no words, one of you showing the other something that changed. One spoken line at the end. Warm practical light, tripod for two beats.',
    ),
    ScenarioTemplate(
      cat: 'collaborator_split',
      text:
          'You plus a creative collaborator ending a project together. Three beats: reviewing the final cut, signing off on it, each going a different direction at a junction. One spoken line per scene. Cool blue grade, urban exterior for the final beat.',
    ),
  ];

  // ── Helper: get templates by level ──────────────────────────
  static List<ScenarioTemplate> byLevel(String level) {
    switch (level) {
      case 'Sequence':
        return sequence;
      case 'Short Story':
        return shortStory;
      case 'Story + Character':
        return storyCharacter;
      default:
        return sequence;
    }
  }
}
