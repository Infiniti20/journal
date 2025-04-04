import { v4 as uuidv4 } from "uuid";
import type { JournalEntry } from "$lib/utils";

// Constants
const STORAGE_KEY = "journalEntries";
const DB_NAME = "journalImagesDB";
const STORE_NAME = "images";

// In-memory cache of journal entries
let journalEntries: JournalEntry[] = [];
let db: IDBDatabase | null = null;

// Initialize the IndexedDB for images
export function initJournalStore(): void {
  loadJournalEntries();
  initImageDB();
}

function initImageDB() {
  const request = indexedDB.open(DB_NAME, 1);

  request.onerror = (event) => {
    console.error("IndexedDB error:", event);
  };

  request.onupgradeneeded = (event) => {
    db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  };

  request.onsuccess = (event) => {
    db = (event.target as IDBOpenDBRequest).result;
  };
}

// Load entries from localStorage
export function loadJournalEntries(): JournalEntry[] {
  const storedEntries = localStorage.getItem(STORAGE_KEY);
  journalEntries = storedEntries ? JSON.parse(storedEntries) : [];
  return journalEntries;
}

// Save entries to localStorage
function saveJournalEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Error saving journal entries:", error);
  }
}

// Save images to IndexedDB and return their IDs
export async function saveImagesToIndexedDB(
  dataUrls: string[]
): Promise<string[]> {
  if (!db) {
    console.error("IndexedDB not initialized");
    return [];
  }

  return new Promise((resolve) => {
    const transaction = db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const imageIds: string[] = [];

    dataUrls.forEach((dataUrl, index) => {
      const imageId = uuidv4();
      const request = store.add({
        id: imageId,
        dataUrl,
        timestamp: new Date().getTime(),
      });

      request.onsuccess = () => {
        imageIds.push(imageId);
        if (index === dataUrls.length - 1) {
          resolve(imageIds);
        }
      };
    });

    // Handle case of empty array
    if (dataUrls.length === 0) {
      resolve([]);
    }
  });
}

// Get image data URLs from IndexedDB by IDs
export async function getImagesFromIndexedDB(
  imageIds: string[]
): Promise<string[]> {
  if (!db || !imageIds.length) {
    return [];
  }

  return new Promise((resolve) => {
    const transaction = db!.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const dataUrls: string[] = [];

    imageIds.forEach((id, index) => {
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          dataUrls.push(request.result.dataUrl);
        }

        if (index === imageIds.length - 1) {
          resolve(dataUrls);
        }
      };
    });

    // Handle case of empty array
    if (imageIds.length === 0) {
      resolve([]);
    }
  });
}

// Add a new journal entry
export async function addJournalEntry(entryData: {
  title: string;
  content: string;
  images: string[];
  mood: number;
  selectedAdjective: string;
}): Promise<void> {
  // Save images to IndexedDB and get their IDs
  const imageIds = await saveImagesToIndexedDB(entryData.images);
  let d = new Date();
  alert(d)
  const newEntry: JournalEntry = {
    id: uuidv4(),
    title: entryData.title,
    content: entryData.content,
    date: d,
    mood: entryData.mood,
    adjective: entryData.selectedAdjective,
    imageIds: imageIds, // Store image IDs instead of full data URLs
    images: [], // This will be populated when needed
  };
  alert(JSON.stringify(newEntry))
  journalEntries = [newEntry, ...journalEntries];
  saveJournalEntries(journalEntries);
}

// Delete a journal entry
export function deleteEntry(id: string): void {
  // Find the entry to get its imageIds
  const entry = journalEntries.find((e) => e.id === id);

  if (entry && entry.imageIds && entry.imageIds.length > 0 && db) {
    // Delete associated images from IndexedDB
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    entry.imageIds.forEach((imageId) => {
      store.delete(imageId);
    });
  }

  journalEntries = journalEntries.filter((entry) => entry.id !== id);
  saveJournalEntries(journalEntries);
}

// Get all journal entries with their images loaded
export async function getAllEntries(): Promise<JournalEntry[]> {
  const entries = [...journalEntries];

  // Load images for all entries
  for (const entry of entries) {
    if (entry.imageIds && entry.imageIds.length > 0) {
      entry.images = await getImagesFromIndexedDB(entry.imageIds);
    }
  }

  return entries;
}

// Group journal entries by date (YYYY-MM-DD)
export function getGroupedEntries(): Record<string, JournalEntry[]> {
  const grouped: Record<string, JournalEntry[]> = {};

  journalEntries.forEach((entry) => {
    const dateStr = new Date(entry.date).toISOString().split("T")[0];
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push({ ...entry });
  });

  return grouped;
}

// Format a date object to a readable string
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Get a formatted date string for grouping
export function getFormattedGroupDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dateString === today.toISOString().split("T")[0]) {
    return "Today";
  } else if (dateString === yesterday.toISOString().split("T")[0]) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
}

// Get sorted dates for display
export function getSortedDates(
  groupedEntries: Record<string, JournalEntry[]>
): string[] {
  return Object.keys(groupedEntries).sort().reverse();
}
