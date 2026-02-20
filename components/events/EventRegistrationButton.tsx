"use client";

import { useState } from "react";

interface EventRegistrationButtonProps {
  eventId: string;
  isRegistered?: boolean;
}

export function EventRegistrationButton({
  eventId,
  isRegistered = false,
}: Readonly<EventRegistrationButtonProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    alert(
      `Funcionalidade de (des)inscrição ainda não implementada para o evento ${eventId}.`,
    );
    setIsLoading(false);
  };

  if (isRegistered) {
    return (
      <button
        onClick={handleAction}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-white dark:bg-zinc-900 text-red-600 border border-zinc-200 dark:border-zinc-700 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Processando..." : "Cancelar Inscrição"}
      </button>
    );
  }

  return (
    <button
      onClick={handleAction}
      disabled={isLoading}
      className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-900/10 disabled:opacity-50"
    >
      {isLoading ? "Processando..." : "Inscrever-se no Evento"}
    </button>
  );
}
