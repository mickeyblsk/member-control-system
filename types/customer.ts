export interface CustomerType {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  birthday: Date | null;
}

export interface CustomerResponse {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  birthday: string | null;
}

export type CustomerSeed = Omit<CustomerResponse, "id">;
