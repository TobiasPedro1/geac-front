"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/app/actions/eventActions";
import { EventRequestDTO } from "@/types/event";

interface CreateEventFormProps {
  categories: { id: number; name: string }[];
  locations: { id: number; name: string }[];
  requirements: { id: number; description: string }[];
  tags: { id: number; name: string }[];
}
export default function CreateEventForm({
  categories = [],
  locations = [],
  requirements = [],
  tags = [],
}: Readonly<CreateEventFormProps>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //primeiro item da lista como valor padrão inicial (fallback para "1" se a lista vier vazia)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    categoryId: categories[0]?.id.toString() || "1",
    locationId: locations[0]?.id.toString() || "1",
    requirementId: requirements[0]?.id.toString() || "1",
    tags: [] as string[],
    workloadHours: "",
    maxCapacity: "",
    onlineLink: "",
    isOnline: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


  const addTag = (id: string) => {
    if (!formData.tags.includes(id)) {
      setFormData({ ...formData, tags: [...formData.tags, id] });
    }
  };
  const removeTag = (id: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tagId) => tagId !== id),
    });
  };
  const removeAll = () => {
    setFormData({
      ...formData,
      tags: []
    })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: EventRequestDTO = {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        categoryId: Number(formData.categoryId),
        requirementId: Number(formData.requirementId),
        workloadHours: Number(formData.workloadHours),
        maxCapacity: Number(formData.maxCapacity),
        onlineLink: formData.isOnline ? formData.onlineLink : undefined,
        locationId: !formData.isOnline
          ? Number(formData.locationId)
          : undefined,
        tags: formData.tags.map(Number)
      };

      const result = await createEventAction(payload);

      if (result?.error) {
        throw new Error(result.error);
      }
      await new Promise((res) => setTimeout(res, 1_000));
      router.push("/events");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Erro ao criar evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md"
    >
      {error && (
        <div className="text-red-500 p-2 bg-red-50 rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          Título
        </label>
        <input
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          Descrição
        </label>
        <textarea
          name="description"
          required
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Início
          </label>
          <input
            type="datetime-local"
            name="startTime"
            required
            value={formData.startTime}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:color-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Fim
          </label>
          <input
            type="datetime-local"
            name="endTime"
            required
            value={formData.endTime}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:color-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Categoria
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Requisito do Evento
          </label>
          <select
            name="requirementId"
            value={formData.requirementId}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
          >
            {requirements.map((req) => (
              <option key={req.id} value={req.id}>
                {req.description}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between p-1">
          <label className=" p-1 text-sm font-medium dark:text-gray-200">
            Tags do Evento
          </label>
          <button type="button" onClick={removeAll} className="p-1 text-sm bg-blue-600 font-medium dark:text-gray-200 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 transition-colors"> 
            Remover Todos
          </button>
        </div>


        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border-2 border-dashed rounded-lg border-zinc-200 dark:border-zinc-700">
          {formData.tags.length === 0 && (
            <span className="text-sm text-gray-400">Nenhuma tag selecionada...</span>
          )}
          {formData.tags.map((tagId) => {
            const tagInfo = tags.find((t) => t.id.toString() === tagId);
            return (
              <span
                key={tagId}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200"
              >
                {tagInfo?.name}
                <button
                  type="button"
                  onClick={() => removeTag(tagId)}
                  className="hover:text-red-500 focus:outline-none"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags
            .filter((tag) => !formData.tags.includes(tag.id.toString()))
            .map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag.id.toString())}
                className="px-3 py-1 text-xs border rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-600 transition-colors"
              >
                + {tag.name}
              </button>
            ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="isOnline"
          name="isOnline"
          checked={formData.isOnline}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <label
          htmlFor="isOnline"
          className="text-sm font-medium dark:text-gray-200"
        >
          Este evento será Online
        </label>
      </div >

      {formData.isOnline ? (
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Link do Evento (Online)
          </label>
          <input
            type="url"
            name="onlineLink"
            required={formData.isOnline}
            value={formData.onlineLink}
            onChange={handleChange}
            placeholder="https://meet.google.com/..."
            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Local (Campus)
          </label>
          <select
            name="locationId"
            value={formData.locationId}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Carga Horária (h)
          </label>
          <input
            type="number"
            name="workloadHours"
            required
            min="1"
            value={formData.workloadHours}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Capacidade Máxima
          </label>
          <input
            type="number"
            name="maxCapacity"
            required
            min="1"
            value={formData.maxCapacity}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 transition-colors"
      >
        {loading ? "Criando..." : "Cadastrar Evento"}
      </button>
    </form>
  );
}
