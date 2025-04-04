<script lang="ts">
  import { Plus, Search, MoreHorizontal, BarChart3, AlertTriangle } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import type { JournalEntry } from "$lib/utils";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "$lib/components/ui/tabs/";
  import * as Drawer from "$lib/components/ui/drawer/index";

  import Stats from "$lib/components/Stats.svelte";
  import CreateEntry from "$lib/components/CreateEntry.svelte";
  import JournalInsights from "$lib/components/JournalInsights.svelte";
  import JournalEntryComponent from "$lib/components/JournalEntry.svelte";
  import {
    initJournalStore,
    getAllEntries,
    addJournalEntry,
    deleteEntry,
    getGroupedEntries,
    formatDate,
    getFormattedGroupDate,
    getSortedDates,
    getImagesFromIndexedDB,
  } from "$lib/stores/journalStore.svelte";

  let isOpen = $state(false);
  let tab = $state("entries");
  let entries = $state<JournalEntry[]>([]);
  let groupedEntries = $state<Record<string, JournalEntry[]>>({});
  let sortedDates = $state<string[]>([]);

  // Initialize the journal store
  initJournalStore();
 
  // Load entries and setup automatic refreshing when tab changes
  $effect(() => {
    (async () => {
      if (tab === "entries") {
        // Load all entries with images
        entries = await getAllEntries();

        // Update grouped entries
        groupedEntries = getGroupedEntries();
        sortedDates = getSortedDates(groupedEntries);

        // For each group, load images
        for (const date of sortedDates) {
          for (const entry of groupedEntries[date]) {
            if (entry.imageIds && entry.imageIds.length) {
              entry.images = await getImagesFromIndexedDB(entry.imageIds);
            }
          }
        }
      }
    })();
  });

  // Handle new journal entry submission
  async function handleSubmit(entryData: {
    title: string;
    content: string;
    images: string[];
    mood: number;
    selectedAdjective: string;
  }): Promise<void> {
            try{

    await addJournalEntry(entryData);

    // Refresh entries
    entries = await getAllEntries();

    groupedEntries = getGroupedEntries();
    sortedDates = getSortedDates(groupedEntries);
    }
    catch(error){
     alert(entries)
    }
    // Close the drawer
    isOpen = false;
  }

  // Handle entry deletion
  async function handleDelete(id: string): Promise<void> {
    deleteEntry(id);

    // Refresh entries
    entries = await getAllEntries();
    groupedEntries = getGroupedEntries();
    sortedDates = getSortedDates(groupedEntries);
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
        <!-- Display actual journal entries grouped by day -->
        {#each sortedDates as dateString}
          <h2 class="text-xl font-bold mb-4">
            {getFormattedGroupDate(dateString)}
          </h2>
          {#each groupedEntries[dateString] as entry}
            <JournalEntryComponent
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
              handleDelete={() => handleDelete(entry.id)}
            />
          {/each}
        {/each}
      </TabsContent>

      <TabsContent value="insights" class="mt-0">
        {#if tab == "insights"}
          <JournalInsights />
        {/if}
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
