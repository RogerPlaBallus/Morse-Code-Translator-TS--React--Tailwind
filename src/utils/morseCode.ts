/**
 * Morse Code Mapping & Translation Utilities
 *
 * Contains the character-to-morse lookup table and a function
 * to translate plain text into its morse code representation.
 */

/** International Morse Code character map */
const MORSE_MAP: Record<string, string> = {
  A: ".-",    B: "-...",  C: "-.-.",  D: "-..",
  E: ".",     F: "..-.",  G: "--.",   H: "....",
  I: "..",    J: ".---",  K: "-.-",   L: ".-..",
  M: "--",    N: "-.",    O: "---",   P: ".--.",
  Q: "--.-",  R: ".-.",   S: "...",   T: "-",
  U: "..-",   V: "...-",  W: ".--",   X: "-..-",
  Y: "-.--",  Z: "--..",

  "0": "-----", "1": ".----", "2": "..---",
  "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..",
  "9": "----.",

  ".": ".-.-.-",  ",": "--..--",  "?": "..--..",
  "'": ".----.",  "!": "-.-.--", "/": "-..-.",
  "(": "-.--.",   ")": "-.--.-", "&": ".-...",
  ":": "---...",  ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.",   "-": "-....-", "_": "..--.-",
  '"': ".-..-.",  "$": "...-..-","@": ".--.-.",
};

/**
 * Translates a plain-text string into morse code.
 *
 * - Each character is separated by a single space.
 * - Each word is separated by " / ".
 * - Unknown characters are replaced with "?".
 *
 * @param text - The input plain-text string.
 * @returns The morse code representation.
 */
export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((char) => MORSE_MAP[char] ?? "")
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean)
    .join(" / ");
}

/**
 * Parses a morse code string into an array of symbols for audio playback.
 *
 * Returns an array of:
 *  - "."  → dot
 *  - "-"  → dash
 *  - "cs" → character space (gap between letters)
 *  - "ws" → word space (gap between words)
 */
export function parseMorseToSymbols(
  morse: string
): Array<"." | "-" | "cs" | "ws"> {
  const symbols: Array<"." | "-" | "cs" | "ws"> = [];

  const words = morse.split(" / ");

  words.forEach((word, wordIndex) => {
    const letters = word.split(" ");

    letters.forEach((letter, letterIndex) => {
      // Add each dot/dash from the letter
      for (const ch of letter) {
        if (ch === "." || ch === "-") {
          symbols.push(ch);
        }
      }

      // Character space after each letter (except last in word)
      if (letterIndex < letters.length - 1) {
        symbols.push("cs");
      }
    });

    // Word space after each word (except last)
    if (wordIndex < words.length - 1) {
      symbols.push("ws");
    }
  });

  return symbols;
}
