const FORBIDDEN_SCRIPT_PATTERN =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff]/;

export function containsForbiddenJohnScript(text: string) {
  return FORBIDDEN_SCRIPT_PATTERN.test(text);
}

export function johnEnglishOnlyFallback() {
  return "I caught a non-English phrase there, so let's keep this in English. Try saying the same idea with this starter: I want to say...";
}

export function enforceJohnEnglishOnly(text: string) {
  return containsForbiddenJohnScript(text) ? johnEnglishOnlyFallback() : text;
}
