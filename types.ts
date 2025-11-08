
export interface Meaning {
  partOfSpeech: string;
  translations: string[];
}

export interface DetailedTranslationResult {
  pronunciation: string;
  meanings: Meaning[];
  audioBase64?: string;
}

export interface TranslationItem {
  id: string;
  fromText: string;
  toText: string;
  sourceLang: string;
  targetLang: string;
  detailedResult?: DetailedTranslationResult;
}
