import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getName = (value: number) => {
  if (value < 20) return "Very Unpleasant";
  if (value < 40) return "Unpleasant";
  if (value < 60) return "Neutral";
  if (value < 80) return "Pleasant";
  return "Very Pleasant";
};

const getHue = (value: number) => {
  if (value < 20) return 0;
  if (value < 40) return 17;
  if (value < 60) return 34;
  if (value < 80) return 90;
  return 90;
};

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  mood: number;
  adjective: string;
  imageIds: string[]; // Store image IDs instead of full data URLs
  images: string[]; // This will be populated when needed
}

export { getName, getHue };
