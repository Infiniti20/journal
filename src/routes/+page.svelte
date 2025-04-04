<script lang="ts">
  import {
    Calendar,
    Plus,
    Quote,
    Search,
    MoreHorizontal,
    BarChart3,
  } from "lucide-svelte"; // Assuming you use lucide-svelte
  import { Button } from "$lib/components/ui/button"; // Adjust imports to match Svelte components
  import JournalEntry from "$lib/components/JournalEntry.svelte";
  // import JournalInsights from "./components/JournalInsights.svelte";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "$lib/components/ui/tabs/"; // Adjust imports accordingly
  import * as Drawer from "$lib/components/ui/drawer/index";

  import Stats from "$lib/components/Stats.svelte";
  import CreateEntry from "$lib/components/CreateEntry.svelte";
  import { onMount } from "svelte";
  import JournalInsights from "$lib/components/JournalInsights.svelte";

  // Define types for journal entries
  interface JournalEntry {
    id: number;
    title: string;
    content: string;
    images: string[];
    date: string;
    createdAt: Date;
    mood: number;
    adjective: string;
  }

  // Type for grouped entries
  interface GroupedEntries {
    [dateString: string]: JournalEntry[];
  }

  // State for journal entries
  let journalEntries: JournalEntry[] = $state([]);
  let isOpen = $state(false);
  let tab = $state("entries")

  // Load entries from localStorage on mount
  onMount(() => {
    loadJournalEntries();
    console.log(getGroupedEntries());
  });

  // Load entries from localStorage
  function loadJournalEntries(): void {
    const storedEntries = localStorage.getItem("journalEntries");
    if (storedEntries) {
      journalEntries = JSON.parse(storedEntries);
    }
  }

  // Save entries to localStorage
  function saveJournalEntries(): void {
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }

  // Handle new journal entry submission
  function handleSubmit(entryData: {
    title: string;
    content: string;
    images: string[];
    mood: number;
    selectedAdjective: string;
  }): void {
    const newEntry: JournalEntry = {
      id: Date.now(),
      title: entryData.title,
      content: entryData.content,
      images: entryData.images || [],
      date: new Date().toISOString(),
      mood: entryData.mood,
      adjective: entryData.selectedAdjective,
      createdAt: new Date(),
    };

    // Add the new entry to the beginning of the array
    journalEntries = [newEntry, ...journalEntries];

    // Save to localStorage
    saveJournalEntries();

    // Close the drawer
    isOpen = false;
  }

  // Function to delete a journal entry
  function deleteEntry(entryId: number): void {
    // Filter out the entry with the matching ID
    journalEntries = journalEntries.filter((entry) => entry.id !== entryId);

    // Save the updated entries to localStorage
    saveJournalEntries();
  }

  // Group entries by day using local timezone
  function getGroupedEntries(): GroupedEntries {
    const grouped: GroupedEntries = {};

    journalEntries.forEach((entry) => {
      // Create date string in format "YYYY-MM-DD" using local timezone
      const entryDate = new Date(entry.date);
      const year = entryDate.getFullYear();
      const month = String(entryDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const day = String(entryDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }

      grouped[dateString].push(entry);
    });

    return grouped;
  }

  // Format date for display
  function formatDate(dateString: string): string {
    // For ISO strings from entry.date
    if (dateString.includes("T")) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
    // For YYYY-MM-DD strings from getGroupedEntries
    else {
      const [year, month, day] = dateString.split("-").map((n) => parseInt(n));
      const date = new Date(year, month - 1, day); // Month is 0-indexed
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  }

  // Get formatted date for group headers with timezone support
  function getFormattedGroupDate(dateString: string): string {
    const [year, month, day] = dateString.split("-").map((n) => parseInt(n));
    const date = new Date(year, month - 1, day); // Month is 0-indexed

    // Get today and yesterday dates in local timezone
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    // Format as "Today", "Yesterday", or the date
    if (dateString === todayDateString) {
      return "Today";
    } else if (dateString === yesterdayDateString) {
      return "Yesterday";
    } else {
      return formatDate(dateString);
    }
  }

  // Sort dates in descending order (newest first) with timezone support
  function getSortedDates(grouped: GroupedEntries): string[] {
    return Object.keys(grouped).sort((a, b) => {
      // Convert YYYY-MM-DD strings to Date objects for comparison
      const [yearA, monthA, dayA] = a.split("-").map((n) => parseInt(n));
      const [yearB, monthB, dayB] = b.split("-").map((n) => parseInt(n));

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      return dateB.getTime() - dateA.getTime();
    });
  }
</script>

<div
  class="max-w-md mx-auto bg-gradient-to-b from-[#f7f5f5] to-[#f1ecf1] min-h-dvh bg-fixed"
>
  <div class="p-6 pt-10">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">Journal</h1>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          class="rounded-full bg-gray-200 border-0 h-8 w-8"
        >
          <Search class="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="rounded-full bg-gray-200 border-0 h-8 w-8"
        >
          <MoreHorizontal class="h-5 w-5" />
        </Button>
      </div>
    </div>

    <!-- Stats -->
    <Stats></Stats>

    <!-- Tabs for Entries and Insights -->
    <Tabs bind:value={tab} class="mb-6">
      <TabsList class="grid grid-cols-2 mb-6">
        <TabsTrigger value="entries">Entries</TabsTrigger>
        <TabsTrigger value="insights">
          <span class="flex items-center gap-1">
            <BarChart3 class="h-4 w-4" />
            Insights
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="entries" class="mt-0">
        <!-- Display stored journal entries -->

        <!-- Display actual journal entries grouped by day -->
        {#each getSortedDates(getGroupedEntries()) as dateString}
          <h2 class="text-xl font-bold mb-4">
            {getFormattedGroupDate(dateString)}
          </h2>
          {#each getGroupedEntries()[dateString] as entry}
            <JournalEntry
              title={entry.title}
              date={formatDate(entry.date)}
              content={entry.content}
              images={entry.images.map((url) => ({
                src: url,
                alt: entry.title,
              }))}
              layout={entry.images.length > 1 ? "grid" : "single-with-mood"}
              mood={entry.mood}
              adjective={entry.adjective}
              handleDelete={() => deleteEntry(entry.id)}
            />
          {/each}
        {/each}
      </TabsContent>

      <TabsContent value="insights" class="mt-0">
        <JournalInsights />
      </TabsContent>
    </Tabs>
  </div>

  <!-- Blur transition at the bottom -->

  <!-- Floating Action Button -->
  {#if !isOpen && tab == "entries"}
    <div class="blur-transition"></div>
    <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <Button
        class="h-20 w-20 rounded-full bg-white shadow-lg border border-gray-100"
        variant="ghost"
        onclick={() => {
          isOpen = !isOpen;
        }}
      >
        <Plus class="!h-8 !w-8 text-violet-700" strokeWidth={2} />
      </Button>
    </div>
  {/if}
  <Drawer.Root bind:open={isOpen}>
    <Drawer.Content class="max-h-[80%]">
      <div class="h-full overflow-y-auto pb-8">
        <Drawer.Header>
          <CreateEntry {handleSubmit}></CreateEntry>
        </Drawer.Header>
      </div>
    </Drawer.Content>
  </Drawer.Root>
</div>

<style>
  .blur-transition {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    z-index: 10;
    pointer-events: none;
    background-color: rgba(
      241,
      236,
      241,
      0.01
    ); /* Very subtle background matching page color */
    backdrop-filter: blur(8px);
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 1) 90%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(255, 255, 255, 1) 90%
    );
  }
</style>
