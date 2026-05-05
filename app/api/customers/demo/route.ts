import { NextRequest, NextResponse } from "next/server";
import { CustomerResponse } from "@/types/customer";

const fakeCustomers: CustomerResponse[] = [
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

export async function GET() {
  console.log("demo GET /api/customers/demo");
  return NextResponse.json(fakeCustomers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("demo POST /api/customers/demo body:", body);

  const newId = Math.max(...fakeCustomers.map((c) => c.id)) + 1;
  const created: CustomerResponse = {
    id: newId,
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    address: String(body.address ?? ""),
    email: String(body.email ?? ""),
    birthday: body.birthday ? String(body.birthday) : null,
  };

  return NextResponse.json(created);
}
