"use server";

import { cookies } from "next/headers";
import { SignInData, AuthResponse, SignUpData } from "@/types/auth";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function registerAction(formData: SignUpData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Erro ao criar conta. Tente novamente.",
      };
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return { error: "Servidor indisponível. Tente novamente mais tarde." };
  }

  redirect("/signin");
}

export async function loginAction(formData: SignInData) {
  let data: AuthResponse;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Credenciais inválidas." };
    }

    data = await response.json();

    const cookieStore = await cookies();

    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return { error: "Servidor indisponível. Tente novamente mais tarde." };
  }

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Logout realizado no backend com sucesso.");
    } catch (error) {
      console.error("Erro ao realizar logout no backend:", error);
    }
  }

  cookieStore.delete("token");

  redirect("/signin");
}
