export type Language = "ar" | "en";

export const translations = {
  // Welcome Screen
  "welcome.tagline": {
    ar: "",
    en: "",
  },
  "welcome.subtitle": {
    ar: "",
    en: "",
  },
  "welcome.howToPlay": { ar: "كيفاش كنلعبو؟", en: "How it works" },
  "welcome.step1.title": { ar: "صاوب غرفة", en: "Create Room" },
  "welcome.step1.desc": { ar: "دخل سميتك وصاوب غرفة.", en: "Enter your name and create a room." },
  "welcome.step2.title": { ar: "شارك الكود", en: "Share Code" },
  "welcome.step2.desc": { ar: "عطي الكود لصاحبك باش يدخل.", en: "Send the code to the other player." },
  "welcome.step3.title": { ar: "بداو!", en: "Let's Go!" },
  "welcome.step3.desc": { ar: "جاوبو على الأسئلة وشوفو النتيجة", en: "Answer questions and see the results" },
  "welcome.startTitle": { ar: "يلا نبداو", en: "Let's Start" },
  "welcome.startDesc": { ar: "دخل سميتك وابدا اللعبة.", en: "Enter your name to begin." },
  "welcome.nameLabel": { ar: "سميتك", en: "Your Name" },
  "welcome.nameHint": { ar: "بلا فيلتر", en: "No filter" },
  "welcome.namePlaceholder": { ar: "سميتك هنا...", en: "Your name here..." },
  "welcome.createRoom": { ar: "صاوب غرفة", en: "Create Room" },
  "welcome.haveCode": { ar: "عندي كود ديال غرفة", en: "I have a room code" },
  "welcome.privacy": { ar: "بيناتكم غير — حتا واحد ما غادي يشوف الأجوبة ديالكم حتى للنهاية.", en: "Just between you — answers stay secret until the end." },
  "welcome.relationLabel": { ar: "واش نتوما:", en: "You are:" },
  "welcome.couples": { ar: "كوبل", en: "Couple" },
  "welcome.friends": { ar: "صحاب", en: "Friends" },

  // Room Lobby
  "lobby.joinedSuccess": { ar: "دخلتي!", en: "You're in!" },
  "lobby.joined": { ar: "دخلتي مزيان", en: "You're in" },
  "lobby.inRoom": { ar: "راك دابا ف غرفة", en: "You're now in room" },
  "lobby.waitingHost": { ar: "كنتسناو {name} يبدا...", en: "Waiting for {name} to start..." },
  "lobby.leaveRoom": { ar: "خرج من الغرفة", en: "Leave Room" },
  "lobby.joinRoom": { ar: "دخل لغرفة", en: "Join Room" },
  "lobby.yourName": { ar: "سميتك...", en: "Your name..." },
  "lobby.roomCode": { ar: "الكود...", en: "Room code..." },
  "lobby.back": { ar: "رجع", en: "Back" },
  "lobby.join": { ar: "دخل", en: "Join" },
  "lobby.roomReady": { ar: "الغرفة جاهزة", en: "Room is ready" },
  "lobby.shareCode": { ar: "صيفط الكود لصاحبك باش يدخل", en: "Share the code with your partner" },
  "lobby.tapCopy": { ar: "كليكي باش تكوبي", en: "Tap to copy" },
  "lobby.codeCopied": { ar: "تكوبا الكود!", en: "Code copied!" },
  "lobby.linkCopied": { ar: "تكوبا اللينك!", en: "Link copied!" },
  "lobby.copyLink": { ar: "كوبي اللينك", en: "Copy Link" },
  "lobby.share": { ar: "شارك", en: "Share" },
  "lobby.shareText": { ar: "يلا نلعبو betweenatna! دخل من هاد اللينك", en: "Let's play betweenatna! Join from this link" },
  "lobby.partnerJoined": { ar: "{name} دخل للغرفة", en: "{name} joined the room" },
  "lobby.letsStart": { ar: "يلا نبداو", en: "Start Game" },
  "lobby.waitingPartner": { ar: "كنتسناو الطرف الآخر...", en: "Waiting for partner..." },
  "lobby.cancel": { ar: "إلغاء", en: "Cancel" },

  // Answer Screen
  "answer.round": { ar: "الجولة", en: "Round" },
  "answer.yourTurn": { ar: "دورك يا {name}", en: "Your turn, {name}" },
  "answer.placeholder": { ar: "كتب الجواب ديالك هنا...", en: "Write your answer here..." },
  "answer.submit": { ar: "صيفط", en: "Submit" },
  "answer.privacy": { ar: "الجواب ديالك سري — غير AI اللي كيشوفو.", en: "Your answer is private — only the AI sees it." },

  // Round Result
  "result.roundTitle": { ar: "الجولة {n}", en: "Round {n}" },
  "result.compatibility": { ar: "التوافق", en: "Compatibility" },
  "result.surprise": { ar: "مفاجأة:", en: "Surprise:" },
  "result.nextQuestion": { ar: "التالي", en: "Next" },
  "result.showFinal": { ar: "النتائج النهائية", en: "Final Results" },

  // Dare
  "dare.title": { ar: "تحدّي!", en: "Dare!" },
  "dare.mustDo": { ar: "يا {name}، خاصك دير هادشي:", en: "{name}, you must do this:" },

  // Final Result
  "final.title": { ar: "النتائج", en: "Results" },
  "final.fileNumber": { ar: "ملف", en: "File" },
  "final.overallScore": { ar: "التوافق الإجمالي", en: "Overall Score" },
  "final.awards": { ar: "الجوائز", en: "Awards" },
  "final.winner": { ar: "الفايز:", en: "Winner:" },
  "final.advice": { ar: "رأي AI", en: "AI's Take" },
  "final.shareImage": { ar: "شارك النتيجة", en: "Share Result" },
  "final.playAgain": { ar: "نعاودو مرة خرا", en: "Play Again" },
  "final.showHistory": { ar: "عرض كل الجولات", en: "Show All Rounds" },
  "final.hideHistory": { ar: "إخفاء", en: "Hide" },

  // Shareable Card
  "share.compatibility": { ar: "نسبة التوافق", en: "Compatibility Score" },
  "share.saving": { ar: "صبر...", en: "Saving..." },
  "share.saveImage": { ar: "حفظ الصورة", en: "Save Image" },
  "share.share": { ar: "شارك", en: "Share" },

  // Score labels
  "score.Drama": { ar: "الدراما", en: "Drama" },
  "score.Creativity": { ar: "الإبداع", en: "Creativity" },
  "score.Romance": { ar: "الرومانسية", en: "Romance" },
  "score.Mischief": { ar: "الشقاوة", en: "Mischief" },
  "score.SharedBrain": { ar: "نفس التفكير", en: "Shared Brain" },

  // Theme Selector
  "theme.fresh": { ar: "كلاسيك", en: "Classic" },
  "theme.neon": { ar: "نيون", en: "Neon" },
  "theme.retro": { ar: "ريترو", en: "Retro" },
  "theme.cute": { ar: "كيوت", en: "Cute" },
  "theme.dark": { ar: "دارك", en: "Dark" },

  // Loading
  "loading.analyzing": { ar: "AI كيحلل الأجوبة ديالكم...", en: "AI is analyzing..." },
  "loading.waitingPartner": { ar: "كنتسناو الطرف الآخر يجاوب...", en: "Waiting for partner..." },
  "loading.preparing": { ar: "كنحضرو السؤال...", en: "Preparing question..." },

  // Status bar
  "status.round": { ar: "الجولة {current}/{total}", en: "Round {current}/{total}" },

  // Errors
  "error.timeout": { ar: "سالا الوقت — صاحبك ما جاوبش", en: "Timed out waiting for partner" },
  "error.analysis": { ar: "وقع مشكل ف التحليل", en: "Error during analysis" },
  "error.generic": { ar: "وقع شي مشكل", en: "Something went wrong" },
  "error.roomCreate": { ar: "ما قدرناش نصاوبو الغرفة", en: "Error creating room" },
  "error.roomNotFound": { ar: "الغرفة ما كايناش ولا اللعبة بدات", en: "Room not found or game already started" },
  "error.joinError": { ar: "ما قدرناش ندخلوك للغرفة", en: "Error joining room" },

  // Music
  "music.stop": { ar: "وقف الموسيقى", en: "Stop Music" },
  "music.play": { ar: "شغل الموسيقى", en: "Play Music" },

  // Language
  "lang.switch": { ar: "EN", en: "عر" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language, params?: Record<string, string | number>): string {
  const entry = translations[key];
  let text: string = entry?.[lang] || entry?.["en"] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
