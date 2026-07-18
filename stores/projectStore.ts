import { create } from "zustand";
import type { Project } from "@/types/project";

interface ProjectState {
  project: Project | null;
  setProject: (project: Project | null) => void;
  updateProject: (updates: Partial<Project>) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  setProject: (project) => set({ project }),
  updateProject: (updates) =>
    set((state) => ({
      project: state.project ? { ...state.project, ...updates } : null,
    })),
}));
