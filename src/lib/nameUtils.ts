// ─── Gender detection from name ───────────────────────────────────────────────
const FEMALE_ENDINGS = ["a", "ia", "ya", "na", "ra", "ha", "sa", "la", "ma", "ta", "iya", "ina", "ina", "ée", "ie"];
const FEMALE_NAMES = new Set([
  // Arabic female names (latin script)
  "fatima","fatma","fatiha","khadija","aicha","aisha","zineb","salma","sanaa","laila","leila","nadia","nassima","houda","hafsa","mariam","maryam","zainab","sara","sarah","soukaina","loubna","imane","hanane","hajar","hind","ghita","asma","amina","amal","abir","aya","ilham","ikram","rajaa","rita","rima","noura","nour","widad","wafaa","siham","samira","sana","rim","rabab","oumaima","malak","lina","lena","layla","kenza","kawtar","jasmine","jamila","inas","hiba","hayat","hasna","halima","farida","fadwa","dina","dounia","bouchra","basma","bahia",
  // French/common female names
  "marie","sophie","camille","julie","lea","lucie","alice","emma","chloe","amelie","manon","clara","charlotte","laura","marine","pauline","mathilde","elisa","eva","isabelle","anne","nathalie","sandrine","stephanie","valentina","victoria","elena","ana","ines","yasmin","yasmine","meriem","rania",
  // English female names
  "jessica","jennifer","sarah","ashley","emily","megan","rachel","hannah","nicole","amanda","brittany","lisa","michelle","diana","emily","grace","olivia","madison","abigail","kayla","taylor","morgan","avery",
]);
const MALE_NAMES = new Set([
  // Arabic male names
  "mohammed","mohamed","ahmad","ahmed","ali","omar","youssef","yousef","hassan","hussain","ibrahim","ismail","khalid","said","saad","mehdi","yassine","amine","karim","rachid","hamid","abdellah","abdellatif","abdelmounim","abderrahim","nabil","adil","aziz","bilal","brahim","driss","fouad","hicham","ilias","ilyas","jawad","khalid","majid","mouad","mustapha","mustafa","noureddine","othmane","omar","soufiane","tariq","walid","zakaria","ziad",
  // French/common male names
  "thomas","nicolas","maxime","julien","pierre","antoine","alexandre","clement","lucas","hugo","mathieu","romain","guillaume","paul","simon","baptiste","quentin","kevin","david","michael","eric","christopher","daniel","james","john","robert","william","richard","joseph","charles","mark","steven","ryan","nathan","ethan","tyler",
]);

export type Gender = "male" | "female" | "unknown";

export function detectGender(name: string): Gender {
  if (!name) return "unknown";
  const lower = name.toLowerCase().trim();
  if (FEMALE_NAMES.has(lower)) return "female";
  if (MALE_NAMES.has(lower)) return "male";
  // Check endings
  for (const ending of FEMALE_ENDINGS) {
    if (lower.endsWith(ending) && lower.length > 2) return "female";
  }
  return "unknown";
}

export function getAvatar(name: string): { emoji: string; color: string } {
  const gender = detectGender(name);
  const avatars = {
    female: [
      { emoji: "👩", color: "hsl(345 82% 52%)" },
      { emoji: "👩‍🦱", color: "hsl(320 70% 52%)" },
      { emoji: "👩‍🦰", color: "hsl(15 82% 52%)" },
      { emoji: "👸", color: "hsl(270 65% 50%)" },
    ],
    male: [
      { emoji: "👨", color: "hsl(200 70% 45%)" },
      { emoji: "👨‍🦱", color: "hsl(220 65% 50%)" },
      { emoji: "👦", color: "hsl(180 60% 40%)" },
      { emoji: "🧑", color: "hsl(240 55% 55%)" },
    ],
    unknown: [
      { emoji: "🧑", color: "hsl(260 50% 55%)" },
      { emoji: "🧑‍🤝‍🧑", color: "hsl(230 55% 50%)" },
    ],
  };
  const list = avatars[gender];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return list[hash % list.length];
}

// ─── Latin → Arabic name transliteration ──────────────────────────────────────
// Map common Moroccan/Arabic names from latin to Arabic script
const NAME_MAP: Record<string, string> = {
  // Male
  mohammed: "محمد", mohamed: "محمد", mehdi: "مهدي", yassine: "ياسين", amine: "أمين",
  karim: "كريم", rachid: "رشيد", hamid: "حميد", ibrahim: "إبراهيم", ismail: "إسماعيل",
  khalid: "خالد", said: "سعيد", saad: "سعد", hassan: "حسن", hussain: "حسين",
  ali: "علي", omar: "عمر", youssef: "يوسف", yousef: "يوسف", ahmad: "أحمد", ahmed: "أحمد",
  abdellah: "عبد الله", nabil: "نبيل", adil: "عادل", aziz: "عزيز", bilal: "بلال",
  brahim: "براهيم", driss: "إدريس", fouad: "فؤاد", hicham: "هشام", ilias: "إلياس",
  ilyas: "إلياس", jawad: "جواد", majid: "ماجد", mouad: "معاذ", mustapha: "مصطفى",
  mustafa: "مصطفى", noureddine: "نور الدين", othmane: "عثمان", soufiane: "سفيان",
  tariq: "طارق", walid: "وليد", zakaria: "زكرياء", ziad: "زياد",
  // Female
  fatima: "فاطمة", fatma: "فاطمة", fatiha: "فتيحة", khadija: "خديجة", aicha: "عائشة",
  aisha: "عائشة", zineb: "زينب", salma: "سلمى", sanaa: "سناء", laila: "ليلى",
  leila: "ليلى", nadia: "نادية", nassima: "نسيمة", houda: "هدى", hafsa: "حفصة",
  mariam: "مريم", maryam: "مريم", zainab: "زينب", sara: "سارة", sarah: "سارة",
  soukaina: "سكينة", loubna: "لبنى", imane: "إيمان", hanane: "حنان", hajar: "هاجر",
  hind: "هند", ghita: "غيتة", asma: "أسماء", amina: "أمينة", amal: "أمل",
  aya: "آية", ilham: "إلهام", ikram: "إكرام", rajaa: "رجاء", noura: "نورة",
  nour: "نور", kenza: "كنزة", kawtar: "كوثر", jasmine: "ياسمين", yasmine: "ياسمين",
  meriem: "مريم", rania: "رانية", malak: "ملاك", lina: "لينا", inas: "إيناس",
  hiba: "هبة", hayat: "حياة", dina: "دينا", bouchra: "بشرى", basma: "بسمة",
};

export function toArabicName(name: string): string {
  if (!name) return name;
  // If already contains Arabic chars, return as-is
  if (/[\u0600-\u06FF]/.test(name)) return name;
  const lower = name.toLowerCase().trim();
  if (NAME_MAP[lower]) return NAME_MAP[lower];
  // Unknown name — return as-is (we can't reliably transliterate arbitrary Latin)
  return name;
}

export function getDisplayName(name: string, lang: string): string {
  if (lang === "ar") {
    const arabic = toArabicName(name);
    return arabic;
  }
  return name;
}
