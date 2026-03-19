export function validateEmail(email: string): string {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
  return "";
}

export function validatePassword(password: string): string {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/\d/.test(password)) return "Password must contain at least one digit.";
  if (!/[@$!%*?&]/.test(password)) return "Password must contain at least one special character (@$!%*?&).";
  return "";
}

export function validateTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Required";
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "Use HH:MM format";
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23) return "Hours must be 0-23";
  if (minutes < 0 || minutes > 59) return "Minutes must be 0-59";
  return "";
}

export function timeToMinutes(value: string): number {
  const [h, m] = value.trim().split(":").map(Number);
  return h * 60 + m;
}
