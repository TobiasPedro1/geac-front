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

export enum EventStatus {
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  campus: string;
  speakers: string[];
  capacity: number;
  registered: number;
  requirements: Array<{ id: number; description: string }>;
  organizer: string;
  organizerEmail: string;
  organizerType: string;
  image?: string;
  tags: string[];
  isRegistered: boolean;
  onlineLink: string;
  status: EventStatus;
  userRegistrationStatus: string;
  userAttended: boolean;
}

export interface EventRequestDTO {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  categoryId: number;
  requirementIds: number[];
  locationId?: number;
  workloadHours: number;
  maxCapacity: number;
  onlineLink?: string;
  tags: number[];
  speakers: number[];
  orgId: string;
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
  status: EventStatus;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  location: LocationResponseDTO;
  organizerName: string;
  organizerEmail: string;
  requirements: RequirementResponseDTO[];
  tags: string[];
  speakers: string[];
  registeredCount: number;
  isRegistered: boolean;
  userRegistrationStatus: string;
  userAttended: boolean;
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
  campus: string;
  referencePoint: string;
  capacity: number;
}

export interface RequirementResponseDTO {
  id: number;
  description: string;
}

export interface RegistrationResponseDTO {
  userId: string;
  userName: string;
  userEmail: string;
  attended: boolean;
  status: string;
}

export interface EventPatchRequestDTO {
  title?: string;
  description?: string;
  onlineLink?: string;
  startTime?: string;
  endTime?: string;
  workloadHours?: number;
  maxCapacity?: number;
  categoryId?: number;
  requirementIds?: number[];
  tags?: number[];
  locationId?: number;
  speakers?: number[];
  orgId?: string;
}
