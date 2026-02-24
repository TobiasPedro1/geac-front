export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
}

export interface AuthResponse {
  token: string;
}

export interface UserPayload {
  sub: string;
  name: string;
  role: string;
  exp: number;
}

export interface UserData {
  name: string;
  email: string;
  role: string;
}

export interface CustomJwtPayload {
  exp: number;
  iss: string;
  name: string;
  role: string;
  sub: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}
