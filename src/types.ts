import { RoadmapStep } from "./lib/gemini";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CivicState {
  location: string;
  age: number;
  roadmap: RoadmapStep[] | null;
  currentStepIndex: number;
  messages: Message[];
  isLoading: boolean;
}
