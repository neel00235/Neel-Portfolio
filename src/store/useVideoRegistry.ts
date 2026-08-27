import { create } from 'zustand';

interface VideoRegistryState {
  activeFullId: string | null;
  activePreviewId: string | null;
  instantiatedIds: string[];
  playFull: (id: string) => void;
  stopFull: (id: string) => void;
  playPreview: (id: string) => void;
  stopPreview: (id: string) => void;
  registerInstance: (id: string) => void;
  unregisterInstance: (id: string) => void;
}

const MAX_INSTANCES = 3;

export const useVideoRegistry = create<VideoRegistryState>((set) => ({
  activeFullId: null,
  activePreviewId: null,
  instantiatedIds: [],

  playFull: (id: string) => set((state) => {
    // If playing full, stop any preview
    const updated = state.instantiatedIds.filter(x => x !== id);
    updated.push(id);
    // Keep max instances
    const pruned = updated.slice(-MAX_INSTANCES);
    return {
      activeFullId: id,
      activePreviewId: null,
      instantiatedIds: pruned,
    };
  }),

  stopFull: (id: string) => set((state) => ({
    activeFullId: state.activeFullId === id ? null : state.activeFullId,
  })),

  playPreview: (id: string) => set((state) => {
    // If full video is actively playing, don't play preview sound or interrupt
    if (state.activeFullId) return state;
    return { activePreviewId: id };
  }),

  stopPreview: (id: string) => set((state) => ({
    activePreviewId: state.activePreviewId === id ? null : state.activePreviewId,
  })),

  registerInstance: (id: string) => set((state) => {
    if (state.instantiatedIds.includes(id)) return state;
    const updated = [...state.instantiatedIds, id];
    return { instantiatedIds: updated.slice(-MAX_INSTANCES) };
  }),

  unregisterInstance: (id: string) => set((state) => ({
    instantiatedIds: state.instantiatedIds.filter(x => x !== id),
    activeFullId: state.activeFullId === id ? null : state.activeFullId,
  })),
}));
