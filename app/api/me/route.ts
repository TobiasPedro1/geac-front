import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "@/types/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const decoded: CustomJwtPayload = jwtDecode(token);

    // ✅ MELHORIA: Validar expiração do token
    const now = Math.floor(Date.now() / 1000); // Unix timestamp em segundos

    if (decoded.exp && decoded.exp < now) {
      // Token expirado!
      cookieStore.delete("token"); // Limpa o token expirado
      return NextResponse.json(
        { user: null, error: "Token expirado" },
        { status: 401 },
      );
    }

    const user = {
      name: decoded.name,
      email: decoded.sub,
      role: decoded.role,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
