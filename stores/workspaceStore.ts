import { create } from "zustand";

interface WorkspaceState {
  tick: number;
  setTick: (tick: number) => void;
  advanceTick: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  tick: 0,
  setTick: (tick) => set({ tick }),
  advanceTick: () => set((state) => ({ tick: state.tick + 1 })),
}));
