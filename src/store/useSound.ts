import { create } from 'zustand';

interface SoundState {
  soundEnabled: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSound = create<SoundState>((set) => ({
  soundEnabled: false,
  toggleSound: () => set((state) => {
    const next = !state.soundEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('neel_sound_enabled', next ? 'true' : 'false');
    }
    return { soundEnabled: next };
  }),
  setSoundEnabled: (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('neel_sound_enabled', enabled ? 'true' : 'false');
    }
    set({ soundEnabled: enabled });
  },
}));
