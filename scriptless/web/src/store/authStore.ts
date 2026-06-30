import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('scriptless_token', token);
        localStorage.setItem('scriptless_user', JSON.stringify(user));
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('scriptless_token');
        localStorage.removeItem('scriptless_user');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'scriptless-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// Hydrate from localStorage on load
const storedToken = localStorage.getItem('scriptless_token');
const storedUser = localStorage.getItem('scriptless_user');
if (storedToken && storedUser) {
  try {
    const user = JSON.parse(storedUser) as User;
    useAuthStore.setState({ user, token: storedToken });
  } catch {
    localStorage.removeItem('scriptless_token');
    localStorage.removeItem('scriptless_user');
  }
}