export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  status: "Informational" | "Progress" | "Completed" | "Warning";
}
