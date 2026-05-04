export interface LoginUser {
  id: number;
  name: string;
  display_name: string | null;
  permissions: number;
  temple_id: string;
}

export interface LoginResponse {
  secret: string;
  user: LoginUser;
}