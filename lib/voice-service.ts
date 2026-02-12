import * as Speech from 'expo-speech';
import { Language } from './i18n';

export function speak(text: string, lang: Language): void {
  const languageCode = lang === 'ta' ? 'ta-IN' : 'en-IN';
  Speech.speak(text, {
    language: languageCode,
    rate: 0.9,
    pitch: 1.0,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export function speakStockAlert(name: string, lang: Language): void {
  const text = lang === 'ta'
    ? `${name} குறைவாக இருக்கு`
    : `${name} is running low`;
  speak(text, lang);
}

export function speakBillQuestion(amount: number, lang: Language): void {
  const text = lang === 'ta'
    ? `தொகை ${amount} ரூபாய் ஆகுது. பில் வேணுமா?`
    : `Amount is ${amount} rupees. Do you want a bill?`;
  speak(text, lang);
}

export function speakDailySummary(
  revenue: number,
  profit: number,
  topProduct: string,
  lang: Language
): void {
  const text = lang === 'ta'
    ? `இன்று மொத்த விற்பனை ${revenue} ரூபாய். லாபம் ${profit} ரூபாய். அதிகம் விற்ற பொருள் ${topProduct}.`
    : `Today total sales ${revenue} rupees. Profit ${profit} rupees. Top selling product ${topProduct}.`;
  speak(text, lang);
}

export function speakSaleComplete(amount: number, lang: Language): void {
  const text = lang === 'ta'
    ? `விற்பனை முடிந்தது. தொகை ${amount} ரூபாய்.`
    : `Sale completed. Amount ${amount} rupees.`;
  speak(text, lang);
}
