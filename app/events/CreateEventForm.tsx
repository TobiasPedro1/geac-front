"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/app/actions/eventActions";
import { EventRequestDTO } from "@/types/event";
import SpeakerModal from "./SpeakerModal";
import {
  Type,
  AlignLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Tag,
  Users,
  Info,
  Settings,
  Plus,
  X,
  Building,
  BellRingIcon,
} from "lucide-react";
import { createRequirementAction } from "../actions/requirementActions";
import { OrganizerResponseDTO } from "@/types/organizer";

interface CreateEventFormProps {
  categories: { id: number; name: string }[];
  locations: {
    id: number;
    name: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    campus: string;
    referencePoint: string;
    capacity: number;
  }[];
  requirements: { id: number; description: string }[];
  tags: { id: number; name: string }[];
  speakers: { id: number; name: string }[];
  organizers: Array<OrganizerResponseDTO>;
  daysBeforeNotify: string;
}

export default function CreateEventForm({
  categories = [],
  locations = [],
  requirements = [],
  tags = [],
  speakers = [],
  organizers = [],
}: Readonly<CreateEventFormProps>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [localRequirements, setLocalRequirements] = useState(requirements);
  const [localSpeakers, setLocalSpeakers] = useState(speakers);
  const [newRequirementText, setNewRequirementText] = useState("");
  const [isCreatingRequirement, setIsCreatingRequirement] = useState(false);

  const [selectedCity, setSelectedCity] = useState(locations[0]?.city || "");
  const [selectedCampus, setSelectedCampus] = useState(
    locations[0]?.campus || "",
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    categoryId: categories[0]?.id.toString() || "1",
    locationId: locations[0]?.id.toString() || "1",
    organizerId: organizers[0]?.id.toString() || "",
    requirementIds: [] as string[],
    tags: [] as string[],
    workloadHours: "",
    maxCapacity: "",
    onlineLink: "",
    isOnline: false,
    speakers: [] as string[],
    daysBeforeNotify: "ONE_DAY_BEFORE",
  });

  const inputClassName =
    "w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-zinc-900 dark:text-white";
  const labelClassName =
    "text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5";

  const availableCities = useMemo(() => {
    return Array.from(new Set(locations.map((l) => l.city)))
      .filter(Boolean)
      .sort();
  }, [locations]);

  const availableCampuses = useMemo(() => {
    return Array.from(
      new Set(
        locations.filter((l) => l.city === selectedCity).map((l) => l.campus),
      ),
    )
      .filter(Boolean)
      .sort();
  }, [locations, selectedCity]);

  const availableLocations = useMemo(() => {
    return locations
      .filter((l) => l.city === selectedCity && l.campus === selectedCampus)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [locations, selectedCity, selectedCampus]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);

    const firstCampus = locations.find((l) => l.city === newCity)?.campus || "";
    setSelectedCampus(firstCampus);

    const firstLocationId =
      locations
        .find((l) => l.city === newCity && l.campus === firstCampus)
        ?.id.toString() || "";
    setFormData((prev) => ({ ...prev, locationId: firstLocationId }));
  };

  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCampus = e.target.value;
    setSelectedCampus(newCampus);

    const firstLocationId =
      locations
        .find((l) => l.city === selectedCity && l.campus === newCampus)
        ?.id.toString() || "";
    setFormData((prev) => ({ ...prev, locationId: firstLocationId }));
  };

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
    if (!formData.tags.includes(id))
      setFormData({ ...formData, tags: [...formData.tags, id] });
  };
  const removeTag = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tagId) => tagId !== id),
    }));
  };
  const removeAllTags = () => setFormData({ ...formData, tags: [] });

  const addSpeaker = (id: string) => {
    if (!formData.speakers.includes(id))
      setFormData({ ...formData, speakers: [...formData.speakers, id] });
  };
  const removeSpeaker = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((sId) => sId !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.title.trim().length < 1)
        throw new Error("O título não pode estar vazio.");
      if (formData.description.trim().length < 1)
        throw new Error("A descrição não pode estar vazia.");

      if (formData.speakers.length === 0)
        throw new Error("Selecione pelo menos um palestrante.");
      if (formData.tags.length === 0)
        throw new Error("Selecione pelo menos uma tag.");

      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      const now = new Date();

      if (startDate < now) {
        throw new Error("A data de início não pode ser no passado.");
      }
      if (endDate <= startDate) {
        throw new Error(
          "A data de término deve ser posterior à data de início.",
        );
      }

      const diffInHours =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      const workload = Number(formData.workloadHours);

      if (workload < 1) {
        throw new Error("A carga horária deve ser de pelo menos 1 hora.");
      }
      if (workload < diffInHours) {
        throw new Error(
          `A carga horária informada (${workload}h) não pode ser menor que a duração real do evento (${diffInHours.toFixed(0)}h).`,
        );
      }

      const maxCap = Number(formData.maxCapacity);
      if (maxCap <= 0) {
        throw new Error("A capacidade máxima deve ser maior que 0.");
      }

      if (!formData.isOnline) {
        const selectedLocation = locations.find(
          (l) => l.id.toString() === formData.locationId,
        );
        if (selectedLocation && maxCap > selectedLocation.capacity) {
          throw new Error(
            `A capacidade informada (${maxCap}) ultrapassa o limite do espaço selecionado (${selectedLocation.name} comporta no máximo ${selectedLocation.capacity} pessoas).`,
          );
        }
      }

      const payload: EventRequestDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        categoryId: Number(formData.categoryId),
        requirementIds: formData.requirementIds.map(Number),
        workloadHours: workload,
        maxCapacity: maxCap,
        onlineLink: formData.isOnline ? formData.onlineLink : undefined,
        locationId: Number.isNaN(Number(formData.locationId))
          ? 1
          : Number(formData.locationId),
        tags: formData.tags.map(Number),
        speakers: formData.speakers.map(Number),
        orgId: formData.organizerId,
        daysBeforeNotify: formData.daysBeforeNotify,
      };

      const result = await createEventAction(payload);
      if (result?.error) throw new Error(result.error);

      router.refresh();
      router.push("/events");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const addRequirement = (id: string) => {
    if (!formData.requirementIds.includes(id)) {
      setFormData((prev) => ({
        ...prev,
        requirementIds: [...prev.requirementIds, id],
      }));
    }
  };

  const removeRequirement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      requirementIds: prev.requirementIds.filter((r) => r !== id),
    }));
  };

  const handleCreateRequirement = async () => {
    if (!newRequirementText.trim()) return;
    setIsCreatingRequirement(true);

    const result = await createRequirementAction(newRequirementText.trim());

    if (result.error) {
      setError(result.error);
    } else if (result.id) {
      setLocalRequirements((prev) => [...prev, result]);
      addRequirement(result.id.toString());
      setNewRequirementText("");
    }
    setIsCreatingRequirement(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Informações Básicas
          </h2>

          <div className="space-y-5">
            <div>
              <label className={labelClassName}>
                <Type className="w-4 h-4 text-zinc-500" /> Título do Evento
              </label>
              <input
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Ex: I Seminário de Tecnologia..."
              />
            </div>

            <div>
              <label className={labelClassName}>
                <AlignLeft className="w-4 h-4 text-zinc-500" /> Descrição
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`${inputClassName} resize-y`}
                placeholder="Descreva os objetivos, público-alvo e cronograma do evento..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClassName}>
                  <Building className="w-4 h-4 text-zinc-500" /> Organização /
                  Departamento
                </label>
                <select
                  name="organizerId"
                  value={formData.organizerId}
                  onChange={handleChange}
                  className={`${inputClassName} font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800`}
                >
                  {organizers.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClassName}>
                  <Settings className="w-4 h-4 text-zinc-500" /> Categoria
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`${inputClassName} capitalize`}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <label className={labelClassName}>
                <Info className="w-4 h-4 text-zinc-500" /> Requisitos do Evento
              </label>

              <div className="flex flex-wrap gap-2 min-h-[44px] p-2 mb-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md">
                {formData.requirementIds.length === 0 && (
                  <span className="text-sm text-zinc-400 mt-1 ml-1">
                    Nenhum requisito selecionado.
                  </span>
                )}
                {formData.requirementIds.map((reqId) => {
                  const reqInfo = localRequirements.find(
                    (r) => r.id.toString() === reqId,
                  );
                  return (
                    <span
                      key={reqId}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-800/50"
                    >
                      {reqInfo?.description}
                      <button
                        type="button"
                        onClick={() => removeRequirement(reqId)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">
                    Selecionar existente:
                  </label>
                  <select
                    className={inputClassName}
                    onChange={(e) => {
                      if (e.target.value) addRequirement(e.target.value);
                      e.target.value = "";
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Escolha na lista...
                    </option>
                    {localRequirements
                      .filter(
                        (req) =>
                          !formData.requirementIds.includes(req.id.toString()),
                      )
                      .map((req) => (
                        <option key={req.id} value={req.id}>
                          {req.description}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">
                    Ou crie um novo:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRequirementText}
                      onChange={(e) => setNewRequirementText(e.target.value)}
                      placeholder="Ex: Levar notebook..."
                      className={inputClassName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateRequirement();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateRequirement}
                      disabled={
                        !newRequirementText.trim() || isCreatingRequirement
                      }
                      className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 transition-colors font-medium whitespace-nowrap"
                    >
                      {isCreatingRequirement ? "..." : "Adicionar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Data, Hora e Local
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClassName}>
                  <Calendar className="w-4 h-4 text-zinc-500" /> Início
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>
                  <Calendar className="w-4 h-4 text-zinc-500" /> Fim
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>
                  <Clock className="w-4 h-4 text-zinc-500" /> Carga Horária (h)
                </label>
                <input
                  type="number"
                  name="workloadHours"
                  required
                  min="1"
                  value={formData.workloadHours}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: 4"
                />
              </div>
              <div>
                <label className={labelClassName}>
                  <Users className="w-4 h-4 text-zinc-500" /> Capacidade Máxima
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  required
                  min="1"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: 150"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between mb-4 mt-4">
                <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 w-fit">
                  <input
                    type="checkbox"
                    id="isOnline"
                    name="isOnline"
                    checked={formData.isOnline}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isOnline"
                    className="text-sm font-medium text-zinc-900 dark:text-white cursor-pointer select-none"
                  >
                    Este evento será transmitido Online
                  </label>
                </div>

                <div className="flex flex-col items-center  mb-4">
                  <label className={labelClassName}>
                    <BellRingIcon className="w-4 h-4 text-zinc-500" /> Notificar
                  </label>
                  <select
                    name="daysBeforeNotify"
                    value={formData.daysBeforeNotify}
                    onChange={handleChange}
                    className={`${inputClassName} w-auto`}
                  >
                    <option value="ONE_DAY_BEFORE">1 dia antes</option>
                    <option value="ONE_WEEK_BEFORE">1 semana antes</option>
                  </select>
                </div>
              </div>

              {formData.isOnline ? (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className={labelClassName}>
                    <Video className="w-4 h-4 text-blue-500" /> Link da Reunião
                    (Online)
                  </label>
                  <input
                    type="url"
                    name="onlineLink"
                    required={formData.isOnline}
                    value={formData.onlineLink}
                    onChange={handleChange}
                    placeholder="https://meet.google.com/..."
                    className={inputClassName}
                  />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className={labelClassName}>
                    <MapPin className="w-4 h-4 text-zinc-500" /> Selecione o
                    Espaço (Cascata)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block font-medium">
                        1. Cidade
                      </span>
                      <select
                        value={selectedCity}
                        onChange={handleCityChange}
                        className={`${inputClassName} capitalize`}
                      >
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block font-medium">
                        2. Campus
                      </span>
                      <select
                        value={selectedCampus}
                        onChange={handleCampusChange}
                        disabled={!availableCampuses.length}
                        className={`${inputClassName} capitalize disabled:opacity-50`}
                      >
                        {availableCampuses.map((campus) => (
                          <option key={campus} value={campus}>
                            {campus}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block font-medium">
                        3. Espaço Físico
                      </span>
                      <select
                        name="locationId"
                        value={formData.locationId}
                        onChange={handleChange}
                        disabled={!availableLocations.length}
                        className={`${inputClassName} disabled:opacity-50`}
                      >
                        {availableLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} (Cap: {loc.capacity})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Conteúdo e Convidados
          </h2>

          <div className="space-y-8">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <label className={labelClassName}>
                  <Users className="w-4 h-4 text-zinc-500" /> Palestrantes do
                  Evento
                </label>
                <button
                  type="button"
                  onClick={() => setIsSpeakerModalOpen(true)}
                  className="inline-flex items-center text-sm px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors w-fit"
                >
                  <Plus className="w-4 h-4 mr-1" /> Novo Palestrante
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                {formData.speakers.length === 0 && (
                  <span className="text-sm text-zinc-400 flex items-center h-full ml-1">
                    Nenhum palestrante selecionado. Selecione abaixo ou crie um
                    novo.
                  </span>
                )}
                {formData.speakers.map((speakerId) => {
                  const speakerInfo = localSpeakers.find(
                    (s) => s.id.toString() === speakerId,
                  );
                  return (
                    <span
                      key={speakerId}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md text-sm font-medium shadow-sm"
                    >
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      {speakerInfo?.name || "Novo Palestrante"}
                      <button
                        type="button"
                        onClick={() => removeSpeaker(speakerId)}
                        className="ml-1 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  );
                })}
              </div>

              <select
                className={`mt-3 ${inputClassName}`}
                onChange={(e) => {
                  if (e.target.value) addSpeaker(e.target.value);
                  e.target.value = "";
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Ou adicione um palestrante já cadastrado no sistema...
                </option>
                {localSpeakers
                  .filter(
                    (speaker) =>
                      !formData.speakers.includes(speaker.id.toString()),
                  )
                  .map((speaker) => (
                    <option key={speaker.id} value={speaker.id}>
                      {speaker.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <label className={labelClassName}>
                  <Tag className="w-4 h-4 text-zinc-500" /> Tags Relacionadas
                </label>
                {formData.tags.length > 0 && (
                  <button
                    type="button"
                    onClick={removeAllTags}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline w-fit"
                  >
                    Remover Todas
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 mb-3">
                {formData.tags.length === 0 && (
                  <span className="text-sm text-zinc-400 flex items-center h-full ml-1">
                    Nenhuma tag selecionada...
                  </span>
                )}
                {formData.tags.map((tagId) => {
                  const tagInfo = tags.find((t) => t.id.toString() === tagId);
                  return (
                    <span
                      key={tagId}
                      className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800 animate-in fade-in zoom-in duration-200"
                    >
                      {tagInfo?.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tagId)}
                        className="text-blue-500 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {tags
                  .filter((tag) => !formData.tags.includes(tag.id.toString()))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => addTag(tag.id.toString())}
                      className="px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
                    >
                      + {tag.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processando...
              </span>
            ) : (
              "Cadastrar Evento Oficial"
            )}
          </button>
        </div>
      </form>

      <SpeakerModal
        isOpen={isSpeakerModalOpen}
        onClose={() => setIsSpeakerModalOpen(false)}
        onSuccess={(newSpeakerId, newSpeakerName) => {
          setLocalSpeakers((prev) => [
            ...prev,
            { id: Number(newSpeakerId), name: newSpeakerName },
          ]);
          addSpeaker(newSpeakerId);
          setIsSpeakerModalOpen(false);
        }}
      />
    </>
  );
}
