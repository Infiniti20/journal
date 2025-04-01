<script>
  import { Calendar, Plus, Quote, Search, MoreHorizontal, BarChart3 } from "lucide-svelte"; // Assuming you use lucide-svelte
  import {Button} from "$lib/components/ui/button"; // Adjust imports to match Svelte components
  import JournalEntry from "$lib/components/JournalEntry.svelte";
  // import JournalInsights from "./components/JournalInsights.svelte";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs/"; // Adjust imports accordingly

  // Sample data
  const todayImages = [
    {
      src: "https://picsum.photos/300/300",
      alt: "People walking by yellow building"
    }
  ];

  const todayMood = {
    name: "Amazed",
    category: "Travel",
    color: "#8BC34A"
  };

  const yesterdayImages = [
    {
      src: "https://picsum.photos/400/300",
      alt: "People looking out a window"
    },
    {
      src: "https://picsum.photos/200/300",
      alt: "Coffee cup"
    },
    {
      src: "https://picsum.photos/200/300",
      alt: "Green door"
    }
  ];
</script>

<div class="max-w-md mx-auto bg-[#f8f6f9] min-h-screen pb-16">
  <div class="p-6 pt-10">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">Journal</h1>
      <div class="flex gap-2">
        <Button variant="outline" size="icon" class="rounded-full bg-gray-200 border-0 h-8 w-8">
          <Search class="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" class="rounded-full bg-gray-200 border-0 h-8 w-8">
          <MoreHorizontal class="h-5 w-5" />
        </Button>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex justify-between mb-8">
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
              fill="#9c27b0"
              opacity="0.3"
            />
            <path
              d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z"
              fill="#9c27b0"
            />
          </svg>
          <span class="text-xl font-bold">13</span>
        </div>
        <span class="text-gray-500">Week Streak</span>
      </div>
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-1">
          <Quote class="h-5 w-5 text-pink-300" />
          <span class="text-2=xl font-bold">3,658</span>
        </div>
        <span class="text-gray-500">Words Written</span>
      </div>
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-1">
          <Calendar class="h-5 w-5 text-indigo-500" />
          <span class="text-xl font-bold">78</span>
        </div>
        <span class="text-gray-500">Days Journaled</span>
      </div>
    </div>

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
        <!-- Today Section -->
        <h2 class="text-3xl font-bold mb-4">Today</h2>
        <JournalEntry
          title="My City Adventure"
          date="Monday, Sep 9"
          content="With my jet lag under control, we decided to hit a few of the city's biggest attractions. To be honest, I didn't initially go because I wanted to. I just wanted to be able to say I saw them when people i"
          mood={todayMood}
          images={todayImages}
          layout="single-with-mood"
        />

        <!-- Yesterday Section -->
        <h2 class="text-3xl font-bold mb-4">Yesterday</h2>
        <JournalEntry
          title="Exploring the Neighborhood"
          date="Sunday, Sep 8"
          content="Found this amazing little café around the corner from our apartment. The espresso was incredible and the view from the window was just perfect for people watching."
          images={yesterdayImages}
          layout="grid"
        />
      </TabsContent>

      <TabsContent value="insights" class="mt-0">
        <!-- <JournalInsights /> -->
      </TabsContent>
    </Tabs>
  </div>

  <!-- Floating Action Button -->
  <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2">
    <Button class="h-14 w-14 rounded-full bg-white shadow-lg border border-gray-100">
      <Plus class="h-6 w-6 text-indigo-500" />
    </Button>
  </div>
</div>
