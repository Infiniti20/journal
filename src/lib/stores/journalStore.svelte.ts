import { v4 as uuidv4 } from "uuid";
import type { JournalEntry } from "$lib/utils";

// Constants
const STORAGE_KEY = "journalEntries";
const DB_NAME = "journalImagesDB";
const STORE_NAME = "images";
const ENTRIES_STORE = "entries";
// Maximum localStorage size in bytes (approximately 5MB to be safe)
const MAX_LOCAL_STORAGE_SIZE = 4 * 1024 * 1024;

// In-memory cache of journal entries
let journalEntries: JournalEntry[] = [];
let db: IDBDatabase | null = null;
let dbInitialized = false;

// Initialize the IndexedDB for images
export async function initJournalStore(): Promise<void> {
  await initIndexedDB();
  loadJournalEntries();
}

function initIndexedDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2); // Version increased to handle schema update

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;

      // Create or ensure images store exists
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      // Create entries store for journal entries
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        db.createObjectStore(ENTRIES_STORE, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      dbInitialized = true;
      console.log("IndexedDB initialized successfully");
      resolve();
    };
  });
}

// Check if localStorage is approaching quota limits
function isLocalStorageAlmostFull(): boolean {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      const value = localStorage.getItem(key) || "";
      totalSize += key.length + value.length;
    }

    // Return true if we're using more than 80% of our estimated safe limit
    return totalSize > MAX_LOCAL_STORAGE_SIZE * 0.8;
  } catch (e) {
    console.error("Error checking localStorage size:", e);
    return true; // Assume it's full if we can't check
  }
}

// Load entries from localStorage or IndexedDB
export function loadJournalEntries(): JournalEntry[] {
  try {
    const storedEntries = localStorage.getItem(STORAGE_KEY);
    if (storedEntries) {
      journalEntries = JSON.parse(storedEntries);
      return journalEntries;
    }
  } catch (error) {
    console.warn("Error loading from localStorage, trying IndexedDB:", error);
  }

  // If localStorage failed or was empty, try loading from IndexedDB
  if (db && dbInitialized) {
    loadEntriesFromIndexedDB().then((entries) => {
      if (entries.length > 0) {
        journalEntries = entries;
      }
    });
  }

  return journalEntries;
}

// Load entries from IndexedDB
async function loadEntriesFromIndexedDB(): Promise<JournalEntry[]> {
  if (!db || !dbInitialized) {
    return [];
  }

  return new Promise((resolve) => {
    const transaction = db!.transaction([ENTRIES_STORE], "readonly");
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error("Failed to load entries from IndexedDB");
      resolve([]);
    };
  });
}

// Save entries to storage (tries localStorage first, falls back to IndexedDB)
function saveJournalEntries(entries: JournalEntry[]): void {
  // Make a copy of entries without the images array to save space
  const entriesForStorage = entries.map((entry) => {
    const { images, ...entryWithoutImages } = entry;
    return { ...entryWithoutImages, images: [] };
  });

  try {
    // Check if localStorage is getting full
    if (isLocalStorageAlmostFull()) {
      throw new Error("localStorage is approaching quota limits");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entriesForStorage));
  } catch (error) {
    console.warn(`Falling back to IndexedDB for entries: ${error}`);
    saveEntriesToIndexedDB(entriesForStorage);
  }
}

// Save entries to IndexedDB as fallback
async function saveEntriesToIndexedDB(entries: JournalEntry[]): Promise<void> {
  if (!db || !dbInitialized) {
    console.error("IndexedDB not initialized for entries");
    return;
  }

  const transaction = db.transaction([ENTRIES_STORE], "readwrite");
  const store = transaction.objectStore(ENTRIES_STORE);

  // Clear existing entries
  store.clear();

  // Add all entries
  entries.forEach((entry) => {
    store.add(entry);
  });
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
  if (!imageIds.length) {
    return [];
  }

  if (!db || !dbInitialized) {
    console.warn("IndexedDB not initialized yet, trying to initialize");
    try {
      await initIndexedDB();
    } catch (error) {
      console.error("Failed to initialize IndexedDB:", error);
      return [];
    }
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
  try {
    // Save images to IndexedDB and get their IDs
    const imageIds = await saveImagesToIndexedDB(entryData.images);

    const newEntry: JournalEntry = {
      id: uuidv4(),
      title: entryData.title,
      content: entryData.content,
      date: new Date(), // Use current date instead of hardcoded future date
      mood: entryData.mood,
      adjective: entryData.selectedAdjective,
      imageIds: imageIds, // Store image IDs instead of full data URLs
      images: [], // This will be populated when needed
    };

    journalEntries = [newEntry, ...journalEntries];
    saveJournalEntries(journalEntries);
  } catch (error) {
    console.error("Error adding journal entry:", error);
    alert(
      `Failed to save journal entry: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
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
