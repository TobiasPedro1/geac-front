"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { updateEventAction } from "@/app/actions/eventActions";
import { EventPatchRequestDTO, EventResponseDTO } from "@/types/event";
import { OrganizerResponseDTO } from "@/types/organizer";
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
  X,
  Building,
} from "lucide-react";

interface EditEventModalProps {
  isOpen: boolean;
  event: EventResponseDTO | null;
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
  organizers: OrganizerResponseDTO[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEventModal({
  isOpen,
  event,
  categories,
  locations,
  requirements,
  tags,
  speakers,
  organizers,
  onClose,
  onSuccess,
}: Readonly<EditEventModalProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findCategoryId = useCallback(
    (categoryName: string): string => {
      const cat = categories.find(
        (c) => c.name.toLowerCase() === categoryName?.toLowerCase(),
      );
      return cat?.id.toString() || categories[0]?.id.toString() || "1";
    },
    [categories],
  );

  const findLocationData = useCallback(
    (
      locationName: string,
    ): { locationId: string; city: string; campus: string } => {
      const loc = locations.find((l) => l.name === locationName);
      return {
        locationId: loc?.id.toString() || locations[0]?.id.toString() || "1",
        city: loc?.city || locations[0]?.city || "",
        campus: loc?.campus || locations[0]?.campus || "",
      };
    },
    [locations],
  );

  const findTagIds = useCallback(
    (tagNames: string[]): string[] => {
      return tagNames
        .map((name) => {
          const tag = tags.find(
            (t) => t.name.toLowerCase() === name.toLowerCase(),
          );
          return tag?.id.toString();
        })
        .filter(Boolean) as string[];
    },
    [tags],
  );

  const findSpeakerIds = useCallback(
    (speakerNames: string[]): string[] => {
      return speakerNames
        .map((name) => {
          const speaker = speakers.find(
            (s) => s.name.toLowerCase() === name.toLowerCase(),
          );
          return speaker?.id.toString();
        })
        .filter(Boolean) as string[];
    },
    [speakers],
  );

  const findRequirementIds = useCallback(
    (reqs: { id: number; description: string }[] | undefined): string[] => {
      if (!reqs) return [];
      return reqs.map((r) => r.id.toString());
    },
    [],
  );

  const getInitialFormData = useCallback(() => {
    if (!event) {
      return {
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
      };
    }

    const locData = findLocationData(event.location?.name || "");
    const isOnline = !!event.onlineLink && !event.location;

    return {
      title: event.title || "",
      description: event.description || "",
      startTime: event.startTime ? event.startTime.substring(0, 16) : "",
      endTime: event.endTime ? event.endTime.substring(0, 16) : "",
      categoryId:
        event.categoryId?.toString() ||
        findCategoryId(event.categoryName || ""),
      locationId: event.location?.id?.toString() || locData.locationId,
      organizerId: organizers[0]?.id.toString() || "",
      requirementIds: findRequirementIds(event.requirements),
      tags: findTagIds(event.tags || []),
      workloadHours: event.workloadHours?.toString() || "",
      maxCapacity: event.maxCapacity?.toString() || "",
      onlineLink: event.onlineLink || "",
      isOnline,
      speakers: findSpeakerIds(event.speakers || []),
    };
  }, [
    event,
    categories,
    locations,
    organizers,
    findLocationData,
    findCategoryId,
    findRequirementIds,
    findTagIds,
    findSpeakerIds,
  ]);

  const [formData, setFormData] = useState(getInitialFormData);

  const [selectedCity, setSelectedCity] = useState(() => {
    if (!event?.location) return locations[0]?.city || "";
    return event.location.city || locations[0]?.city || "";
  });

  const [selectedCampus, setSelectedCampus] = useState(() => {
    if (!event?.location) return locations[0]?.campus || "";
    return event.location.campus || locations[0]?.campus || "";
  });

  useEffect(() => {
    if (isOpen && event) {
      const data = getInitialFormData();
      setFormData(data);
      if (event.location) {
        setSelectedCity(event.location.city || locations[0]?.city || "");
        setSelectedCampus(event.location.campus || locations[0]?.campus || "");
      }
      setError("");
    }
  }, [isOpen, event, getInitialFormData, locations]);

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

  if (!isOpen || !event) return null;

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
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addTag = (id: string) => {
    if (!formData.tags.includes(id))
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, id] }));
  };
  const removeTag = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tagId) => tagId !== id),
    }));
  };

  const addSpeaker = (id: string) => {
    if (!formData.speakers.includes(id))
      setFormData((prev) => ({
        ...prev,
        speakers: [...prev.speakers, id],
      }));
  };
  const removeSpeaker = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((sId) => sId !== id),
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.title.trim().length < 1)
        throw new Error("O título não pode estar vazio.");
      if (formData.description.trim().length < 1)
        throw new Error("A descrição não pode estar vazia.");

      const payload: EventPatchRequestDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        categoryId: Number(formData.categoryId),
        requirementIds: formData.requirementIds.map(Number),
        workloadHours: Number(formData.workloadHours) || undefined,
        maxCapacity: Number(formData.maxCapacity) || undefined,
        onlineLink: formData.isOnline ? formData.onlineLink : undefined,
        locationId: formData.isOnline
          ? undefined
          : Number(formData.locationId) || undefined,
        tags: formData.tags.map(Number),
        speakers: formData.speakers.map(Number),
        orgId: formData.organizerId || undefined,
      };

      const result = await updateEventAction(event.id, payload);
      if (!result.success) throw new Error(result.error);

      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl my-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Editar Evento
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[75vh] overflow-y-auto"
        >
          {error && (
            <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Informações Básicas */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Informações Básicas
            </h3>

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
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={`${inputClassName} resize-y`}
                placeholder="Descreva os objetivos, público-alvo e cronograma do evento..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClassName}>
                  <Building className="w-4 h-4 text-zinc-500" /> Organização
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

            {/* Requisitos */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
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
                  const reqInfo = requirements.find(
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
              <select
                className={inputClassName}
                onChange={(e) => {
                  if (e.target.value) addRequirement(e.target.value);
                  e.target.value = "";
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Adicionar requisito...
                </option>
                {requirements
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
          </div>

          {/* Data, Hora e Local */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Data, Hora e Local
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClassName}>
                  <Calendar className="w-4 h-4 text-zinc-500" /> Início
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
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
                  min="1"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: 150"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 w-fit">
                <input
                  type="checkbox"
                  id="editIsOnline"
                  name="isOnline"
                  checked={formData.isOnline}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="editIsOnline"
                  className="text-sm font-medium text-zinc-900 dark:text-white cursor-pointer select-none"
                >
                  Este evento será transmitido Online
                </label>
              </div>

              {formData.isOnline ? (
                <div>
                  <label className={labelClassName}>
                    <Video className="w-4 h-4 text-blue-500" /> Link da Reunião
                  </label>
                  <input
                    type="url"
                    name="onlineLink"
                    value={formData.onlineLink}
                    onChange={handleChange}
                    placeholder="https://meet.google.com/..."
                    className={inputClassName}
                  />
                </div>
              ) : (
                <div>
                  <label className={labelClassName}>
                    <MapPin className="w-4 h-4 text-zinc-500" /> Local
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
                        3. Espaço
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

          {/* Conteúdo e Convidados */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Conteúdo e Convidados
            </h3>

            {/* Palestrantes */}
            <div>
              <label className={labelClassName}>
                <Users className="w-4 h-4 text-zinc-500" /> Palestrantes
              </label>
              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                {formData.speakers.length === 0 && (
                  <span className="text-sm text-zinc-400 flex items-center h-full ml-1">
                    Nenhum palestrante selecionado.
                  </span>
                )}
                {formData.speakers.map((speakerId) => {
                  const speakerInfo = speakers.find(
                    (s) => s.id.toString() === speakerId,
                  );
                  return (
                    <span
                      key={speakerId}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md text-sm font-medium shadow-sm"
                    >
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      {speakerInfo?.name || `Palestrante #${speakerId}`}
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
                  Adicionar palestrante...
                </option>
                {speakers
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

            {/* Tags */}
            <div>
              <label className={labelClassName}>
                <Tag className="w-4 h-4 text-zinc-500" /> Tags
              </label>
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
                      className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800"
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
