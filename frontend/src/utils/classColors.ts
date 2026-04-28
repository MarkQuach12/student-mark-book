export interface ColorOption {
  key: string;
  label: string;
  main: string;
  hover: string;
}

export const CLASS_COLOR_PALETTE: ColorOption[] = [
  { key: "teal", label: "Teal", main: "#0F766E", hover: "#115E59" },
  { key: "blue", label: "Blue", main: "#1E3A5F", hover: "#1E40AF" },
  { key: "indigo", label: "Indigo", main: "#3730A3", hover: "#312E81" },
  { key: "purple", label: "Purple", main: "#6D28D9", hover: "#5B21B6" },
  { key: "pink", label: "Pink", main: "#9D174D", hover: "#831843" },
  { key: "red", label: "Red", main: "#B91C1C", hover: "#991B1B" },
  { key: "amber", label: "Amber", main: "#B45309", hover: "#92400E" },
  { key: "green", label: "Green", main: "#15803D", hover: "#166534" },
  { key: "slate", label: "Slate", main: "#475569", hover: "#334155" },
];

export const DEFAULT_COLOR = CLASS_COLOR_PALETTE[0];

type ClassColorMap = Record<string, string>;

function storageKey(userEmail: string): string {
  return `classColors_${userEmail}`;
}

export function getClassColorMap(userEmail: string): ClassColorMap {
  try {
    const raw = localStorage.getItem(storageKey(userEmail));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setClassColor(
  userEmail: string,
  classId: string,
  colorKey: string,
): void {
  const map = getClassColorMap(userEmail);
  map[classId] = colorKey;
  localStorage.setItem(storageKey(userEmail), JSON.stringify(map));
}

export function getColorForClass(
  userEmail: string,
  classId: string,
): ColorOption {
  const map = getClassColorMap(userEmail);
  const key = map[classId];
  return CLASS_COLOR_PALETTE.find((c) => c.key === key) ?? DEFAULT_COLOR;
}
