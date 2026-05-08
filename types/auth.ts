export interface User {
  id: number;
  username: string;
  displayName: string | null;
  permissions: number;
  templeId: string;
}

export interface LoginResponse {
  secret: string;
  user: User;
}
