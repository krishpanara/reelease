import { apiHandler } from "@/utils/apiHandler";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Map POST /api/user-setting/update to PUT /api/user-setting in backend
  return apiHandler(request, "/user-setting", "PUT");
}
