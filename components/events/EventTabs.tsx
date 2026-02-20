"use client";

interface EventTabsProps {
  activeTab: "proximos" | "disponiveis" | "todos";
  setActiveTab: (tab: "proximos" | "disponiveis" | "todos") => void;
}

export function EventTabs({
  activeTab,
  setActiveTab,
}: Readonly<EventTabsProps>) {
  const tabs = [
    { id: "proximos", label: "Próximos" },
    { id: "disponiveis", label: "Disponíveis" },
    { id: "todos", label: "Todos os Eventos" },
  ] as const;

  return (
    <div className="flex p-1 space-x-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl w-fit mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium rounded-lg transition-todos duration-200
            ${
              activeTab === tab.id
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
