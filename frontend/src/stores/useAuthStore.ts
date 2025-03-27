import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface AuthStore {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  checkAdminStatus: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAdmin: false,
  isLoading: false,
  error: null,

  checkAdminStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/admin/check");
      console.log("Admin Check Response:", response.data); // Debugging
      set({ isAdmin: response.data?.admin || false });
    } catch (error: any) {
      console.error(
        "Admin Check Error:",
        error.response?.data || error.message
      ); // Debugging
      set({
        isAdmin: false,
        error: error.response?.data?.message || "Unknown error",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({ isAdmin: false, isLoading: false, error: null });
  },
}));
