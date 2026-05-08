export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  birthday: Date | null;
}

export interface CustomerDTO {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  birthday: string | null;
}

export type CustomerInput = Omit<CustomerDTO, "id">;
