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

  // Define types for journal entries
  interface JournalEntry {
    id: number;
    title: string;
    content: string;
    images: string[];
    date: string;
    createdAt: Date;
  }

  // Type for grouped entries
  interface GroupedEntries {
    [dateString: string]: JournalEntry[];
  }

  // State for journal entries
  let journalEntries: JournalEntry[] = $state([]);
  let isOpen = $state(false);

  // Load entries from localStorage on mount
  onMount(() => {
    loadJournalEntries();
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
  }): void {
    const newEntry: JournalEntry = {
      id: Date.now(),
      title: entryData.title,
      content: entryData.content,
      images: entryData.images || [],
      date: new Date().toISOString(),
      createdAt: new Date(),
    };

    // Add the new entry to the beginning of the array
    journalEntries = [newEntry, ...journalEntries];

    // Save to localStorage
    saveJournalEntries();

    // Close the drawer
    isOpen = false;
  }

  // Group entries by day
  function getGroupedEntries(): GroupedEntries {
    const grouped: GroupedEntries = {};

    journalEntries.forEach((entry) => {
      // Create date string in format "YYYY-MM-DD" for grouping
      const entryDate = new Date(entry.date);
      const dateString = entryDate.toISOString().split("T")[0];

      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }

      grouped[dateString].push(entry);
    });

    return grouped;
  }

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  // Get formatted date for group headers
  function getFormattedGroupDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format as "Today", "Yesterday", or the date
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return formatDate(dateString);
    }
  }

  // Sort dates in descending order (newest first)
  function getSortedDates(grouped: GroupedEntries): string[] {
    return Object.keys(grouped).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }

  // Sample data is kept for fallback display
  const todayImages = [
    {
      src: "https://picsum.photos/300/300",
      alt: "People walking by yellow building",
    },
  ];

  const todayMood = {
    name: "Amazed",
    category: "Travel",
    color: "#8BC34A",
  };

  const yesterdayImages = [
    {
      src: "https://picsum.photos/400/300",
      alt: "People looking out a window",
    },
    {
      src: "https://picsum.photos/200/300",
      alt: "Coffee cup",
    },
    {
      src: "https://picsum.photos/200/300",
      alt: "Green door",
    },
  ];
</script>

<div
  class="max-w-md mx-auto bg-gradient-to-b from-[#f7f5f5] to-[#f1ecf1] min-h-screen pb-16 bg-fixed"
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
    <Tabs value="entries" class="mb-6">
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
                mood={todayMood}
              />
            {/each}
          {/each}
      </TabsContent>

      <TabsContent value="insights" class="mt-0">
        <!-- <JournalInsights /> -->
      </TabsContent>
    </Tabs>
  </div>

  <!-- Blur transition at the bottom -->
  <div class="blur-transition"></div>

  <!-- Floating Action Button -->
  <div
    class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20"
    id="test"
  >
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
