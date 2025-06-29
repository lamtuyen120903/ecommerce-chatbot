import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, RegisterData, LoginData } from "../types/auth";
import { AuthService } from "../services/auth-service";
import { migrateUserData } from "../utils/user-data-migration";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  // Auth operations
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; errors?: any[]; message?: string }>;
  login: (
    data: LoginData
  ) => Promise<{ success: boolean; errors?: any[]; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; errors?: any[]; message?: string }>;

  // Initialize auth state
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true });
          const response = await AuthService.register(data);

          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });

            // Migrate any existing chat data to user-specific storage
            migrateUserData(response.user.email);
          } else {
            set({ isLoading: false });
          }

          return {
            success: response.success,
            errors: response.errors,
            message: response.message,
          };
        } catch (error) {
          console.error("Registration error:", error);
          set({ isLoading: false });
          return {
            success: false,
            errors: [
              { message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại." },
            ],
          };
        }
      },

      login: async (data: LoginData) => {
        try {
          set({ isLoading: true });
          const response = await AuthService.login(data);

          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });

            // Migrate any existing chat data to user-specific storage
            migrateUserData(response.user.email);
          } else {
            set({ isLoading: false });
          }

          return {
            success: response.success,
            errors: response.errors,
            message: response.message,
          };
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          return {
            success: false,
            errors: [
              { message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại." },
            ],
          };
        }
      },

      logout: async () => {
        try {
          await AuthService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const { user } = get();
          if (!user) {
            return {
              success: false,
              errors: [{ message: "Không có người dùng đăng nhập" }],
            };
          }

          const response = await AuthService.updateProfile(user.id, updates);

          if (response.success && response.user) {
            set({ user: response.user });
          }

          return {
            success: response.success,
            errors: response.errors,
            message: response.message,
          };
        } catch (error) {
          console.error("Profile update error:", error);
          return {
            success: false,
            errors: [
              { message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại." },
            ],
          };
        }
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });

          // First try to get user from localStorage
          const currentUser = AuthService.getCurrentUser();

          if (currentUser) {
            // Verify the user still exists in our database
            const verifiedUser = await AuthService.checkAuth();

            if (verifiedUser) {
              set({
                user: verifiedUser,
                isAuthenticated: true,
                isLoading: false,
              });

              // Migrate any existing chat data to user-specific storage
              migrateUserData(verifiedUser.email);
              return;
            }
          }

          // If no valid user found, clear state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error checking auth:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      storage: createJSONStorage(() => {
        // Only use localStorage on the client side
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // only persist user and isAuthenticated
      onRehydrateStorage: () => (state) => {
        // This runs after the store is rehydrated from localStorage
        if (state && typeof window !== "undefined") {
          // Set loading to true so we can properly initialize
          state.setLoading(true);
          // Initialize auth state after rehydration
          state.initializeAuth();
        }
      },
    }
  )
);
