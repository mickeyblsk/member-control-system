import "server-only";
import { Customer, CustomerDTO, CustomerInput } from "@/types/customer";

const SEED: CustomerDTO[] = [
  {
    id: 1,
    name: "王小明",
    phone: "0912-345-678",
    address: "台北市中正區重慶南路一段 122 號",
    email: "ming.wang@example.com",
    birthday: "1990-03-15",
  },
  {
    id: 2,
    name: "陳美玲",
    phone: "0922-111-222",
    address: "新北市板橋區文化路二段 88 號 5 樓",
    email: "meiling.chen@example.com",
    birthday: "1985-07-22",
  },
  {
    id: 3,
    name: "李志強",
    phone: "0933-456-789",
    address: "台中市西屯區台灣大道三段 99 號",
    email: "zhiqiang.li@example.com",
    birthday: "1978-11-03",
  },
  {
    id: 4,
    name: "林雅雯",
    phone: "0955-987-654",
    address: "高雄市苓雅區四維三路 77 號 12 樓",
    email: "yawen.lin@example.com",
    birthday: "1995-01-30",
  },
  {
    id: 5,
    name: "張俊豪",
    phone: "0988-321-654",
    address: "桃園市中壢區中央西路二段 50 號",
    email: "junhao.zhang@example.com",
    birthday: "2001-09-18",
  },
];

const globalForStore = globalThis as unknown as {
  __customerStore?: CustomerDTO[];
};

const store: CustomerDTO[] =
  globalForStore.__customerStore ??
  (globalForStore.__customerStore = [...SEED]);

const nextId = (): number =>
  store.length === 0 ? 1 : Math.max(...store.map((c) => c.id)) + 1;

const toCustomer = (dto: CustomerDTO): Customer => ({
  id: dto.id,
  name: dto.name,
  phone: dto.phone,
  address: dto.address,
  email: dto.email,
  birthday: dto.birthday ? new Date(dto.birthday) : null,
});

export function listCustomers(): Customer[] {
  return [...store].sort((a, b) => b.id - a.id).map(toCustomer);
}

export function createCustomer(input: CustomerInput): Customer {
  const dto: CustomerDTO = {
    id: nextId(),
    name: input.name,
    phone: input.phone,
    address: input.address,
    email: input.email,
    birthday: input.birthday ?? null,
  };
  store.push(dto);
  return toCustomer(dto);
}

export function updateCustomer(id: number, input: CustomerInput): Customer | null {
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const dto: CustomerDTO = {
    id,
    name: input.name,
    phone: input.phone,
    address: input.address,
    email: input.email,
    birthday: input.birthday ?? null,
  };
  store[idx] = dto;
  return toCustomer(dto);
}

export function deleteCustomer(id: number): boolean {
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function importCustomers(rows: CustomerInput[]): Customer[] {
  return rows.map((row) => createCustomer(row));
}
