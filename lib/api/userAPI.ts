import { fetchWrapper } from "@/lib/fetchWrapper";
import type { UserProfile } from "@/lib/types";

export interface UserRequestDto {
  email: string;
  username: string;
  full_name?: string;
  phone_number?: string;
  field_of_study?: string;
  avatar_url?: string;
  role?: string;
}

export const userAPI = {

  getAll: async (): Promise<UserProfile[]> => {
    return await fetchWrapper.get<UserProfile[]>("/user");
  },

  getById: async (id: string): Promise<UserProfile> => {
    return await fetchWrapper.get<UserProfile>(`/user/${id}`);
  },

  create: async (payload: UserRequestDto): Promise<UserProfile> => {
    return await fetchWrapper.post<UserProfile>("/user", payload);
  },

  update: async (id: string, payload: Partial<UserRequestDto>): Promise<UserProfile> => {
    return await fetchWrapper.put<UserProfile>(`/user/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    return await fetchWrapper.del<void>(`/user/${id}`);
  },
};
