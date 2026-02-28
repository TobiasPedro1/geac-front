import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/certificate/download/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return new NextResponse("Falha ao buscar o certificado", {
        status: response.status,
      });
    }

    // Pega o PDF como um Blob binário
    const blob = await response.blob();

    // Configura os cabeçalhos para forçar o download no navegador
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      `attachment; filename="certificado_${eventId}.pdf"`,
    );

    return new NextResponse(blob, { status: 200, headers });
  } catch (error) {
    console.error("Erro no download do certificado:", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}
