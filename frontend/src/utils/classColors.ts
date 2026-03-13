export interface ColorOption {
  key: string;
  label: string;
  main: string;
  hover: string;
}

export const CLASS_COLOR_PALETTE: ColorOption[] = [
  { key: "teal", label: "Teal", main: "#00796B", hover: "#00695C" },
  { key: "blue", label: "Blue", main: "#1565C0", hover: "#0D47A1" },
  { key: "indigo", label: "Indigo", main: "#303F9F", hover: "#283593" },
  { key: "purple", label: "Purple", main: "#7B1FA2", hover: "#6A1B9A" },
  { key: "pink", label: "Pink", main: "#C2185B", hover: "#AD1457" },
  { key: "red", label: "Red", main: "#D32F2F", hover: "#C62828" },
  { key: "orange", label: "Orange", main: "#EF6C00", hover: "#E65100" },
  { key: "green", label: "Green", main: "#2E7D32", hover: "#1B5E20" },
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
