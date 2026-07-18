import { create } from "zustand";
import type { TimelineEvent } from "@/types/timeline";
import { TimelineService } from "@/services/timelineService";

interface TimelineState {
  events: TimelineEvent[];
  addEvent: (event: Omit<TimelineEvent, "id">) => TimelineEvent;
  setEvents: (events: TimelineEvent[]) => void;
  resetEvents: () => void;
}

const timelineService = new TimelineService();

export const useTimelineStore = create<TimelineState>((set) => ({
  events: [],
  addEvent: (event) => {
    const createdEvent = timelineService.addEvent(event);
    set((state) => ({ events: [createdEvent, ...state.events] }));
    return createdEvent;
  },
  setEvents: (events) => set({ events }),
  resetEvents: () => {
    timelineService.reset();
    set({ events: [] });
  },
}));
