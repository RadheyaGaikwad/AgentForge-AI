import type { TimelineEvent } from "@/types/timeline";

export class TimelineService {
  private events: TimelineEvent[] = [];

  constructor(initialEvents: TimelineEvent[] = []) {
    this.events = [...initialEvents];
  }

  getEvents(): TimelineEvent[] {
    return [...this.events].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
  }

  addEvent(event: Omit<TimelineEvent, "id">): TimelineEvent {
    const createdEvent: TimelineEvent = {
      ...event,
      id: this.createId(),
    };

    this.events = [createdEvent, ...this.events];
    return { ...createdEvent };
  }

  reset(): void {
    this.events = [];
  }

  private createId(): string {
    return `event-${Math.random().toString(36).slice(2, 10)}`;
  }
}
