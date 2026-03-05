export interface UserPatchRequestDTO {
  email?: string;
  name?: string;
  role?: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}