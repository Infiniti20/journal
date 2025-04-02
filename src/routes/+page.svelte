<script>
  import { Calendar, Plus, Quote, Search, MoreHorizontal, BarChart3 } from "lucide-svelte"; // Assuming you use lucide-svelte
  import {Button} from "$lib/components/ui/button"; // Adjust imports to match Svelte components
  import JournalEntry from "$lib/components/JournalEntry.svelte";
  // import JournalInsights from "./components/JournalInsights.svelte";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs/"; // Adjust imports accordingly
  import Stats from "$lib/components/Stats.svelte";

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

<div class="max-w-md mx-auto bg-gradient-to-b from-[#f7f5f5] to-[#f1ecf1] min-h-screen pb-16 bg-fixed">
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
        <!-- Today Section -->
        <h2 class="text-xl font-bold mb-4">Today</h2>
        <JournalEntry
          title="My City Adventure"
          date="Monday, Sep 9"
          content="With my jet lag under control, we decided to hit a few of the city's biggest attractions. To be honest, I didn't initially go because I wanted to. I just wanted to be able to say I saw them when people i"
          mood={todayMood}
          images={todayImages}
          layout="single-with-mood"
        />

        <!-- Yesterday Section -->
        <h2 class="text-xl font-bold mb-4">Yesterday</h2>
        <JournalEntry
          title="Exploring the Neighborhood"
          date="Sunday, Sep 8"
          content="Found this amazing little café around the corner from our apartment. The espresso was incredible and the view from the window was just perfect for people watching."
          images={yesterdayImages}
          layout="grid"
        />
         <h2 class="text-xl font-bold mb-4">Yesterday</h2>
        <JournalEntry
          title="Exploring the Neighborhood"
          date="Sunday, Sep 8"
          content="Found this amazing little café around the corner from our apartment. The espresso was incredible and the view from the window was just perfect for people watching."
          images={yesterdayImages}
          layout="grid"
        />
         <h2 class="text-xl font-bold mb-4">Yesterday</h2>
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

  <!-- Blur transition at the bottom -->
  <div class="blur-transition"></div>

  <!-- Floating Action Button -->
  <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20" id="test">
    <Button class="h-20 w-20 rounded-full bg-white shadow-lg border border-gray-100" variant="ghost">
      <Plus class="!h-8 !w-8 text-indigo-500" strokeWidth={2}/>
    </Button>
  </div>
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
    background-color: rgba(241, 236, 241, 0.01); /* Very subtle background matching page color */
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
