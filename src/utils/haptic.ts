type HapticType = "light" | "medium" | "heavy" | "success" | "error" | "select";

const PATTERNS: Record<HapticType, number | number[]> = {
  light:   10,
  medium:  25,
  heavy:   50,
  success: [15, 60, 15],
  error:   [30, 40, 30, 40, 60],
  select:  8,
};

export function haptic(type: HapticType = "light") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(PATTERNS[type]);
  }
}
