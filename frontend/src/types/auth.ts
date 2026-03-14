export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}
