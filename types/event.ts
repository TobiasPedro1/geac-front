export type EventCategory =
  | "palestra"
  | "seminario"
  | "cultural"
  | "feira"
  | "workshop"
  | "livre"
  | "conferencia"
  | "festival"
  | "outro";

export type Campus =
  | "reitoria"
  | "ondina"
  | "sao lazaro"
  | "canela"
  | "graca"
  | "federacao";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  campus: Campus;
  speakers: string[];
  capacity: number;
  registered: number;
  requirements: string[];
  organizer: string;
  organizerType: string;
  image?: string;
  tags: string[];
  isRegistered?: boolean;
}

export interface EventRequestDTO {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  categoryId: number;
  requirementId: number;
  locationId?: number;
  workloadHours: number;
  maxCapacity: number;
  onlineLink?: string;
  tags:number[]
}

export interface LocationResponseDTO {
  id: number;
  name: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  referencePoint: string;
  capacity: number;
}

export interface EventResponseDTO {
  id: string;
  title: string;
  description: string;
  onlineLink: string;
  startTime: string;
  endTime: string;
  workloadHours: number;
  maxCapacity: number;
  status: string;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  location: Location;
  organizerName: string;
  organizerEmail: string;
  reqId: number;
  requirementDescription: string[];
  tags: string[];
  speakers: string[];
}

export interface Location {
  id: number;
  name: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  referencePoint: string;
  capacity: number;
}
