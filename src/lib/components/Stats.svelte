<script lang="ts">
  import { Flame, MessageSquareQuote, Calendar } from "lucide-svelte";
  import { onMount } from "svelte";
  import { getAllEntries } from "$lib/stores/journalStore.svelte";
  import type { JournalEntry } from "$lib/utils";


  let { entries }: { entries: JournalEntry[] } = $props();
  // Calculate total words written
  let wordCount = $derived(
    entries.reduce((total, entry) => {
      return (
        total +
        (entry.content
          ? entry.content.split(/\s+/).filter((word) => word.length > 0).length
          : 0)
      );
    }, 0)
  );

  // Calculate unique days journaled

  let daysJournaled = $derived.by(() => {
    const uniqueDays = new Set();
    entries.forEach((entry) => {
      const dateStr = new Date(entry.date).toISOString().split("T")[0];
      uniqueDays.add(dateStr);
    });
    return uniqueDays.size;
  });

  // Calculate week streak
   let weekStreak = $derived(calculateWeekStreak(entries));

  function calculateWeekStreak(entries: JournalEntry[]) {
    if (!entries.length) return 0;

    const now = new Date();
    const entriesByWeek = new Map();

    // Group entries by week
    entries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      const weekStart = getWeekStart(entryDate);
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!entriesByWeek.has(weekKey)) {
        entriesByWeek.set(weekKey, true);
      }
    });

    // Get all weeks with entries
    const weeksWithEntries = Array.from(entriesByWeek.keys())
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime()); // Sort descending

    if (!weeksWithEntries.length) return 0;

    // Current week
    const currentWeekStart = getWeekStart(now);

    // Check if there's an entry in the current week
    const hasCurrentWeekEntry = weeksWithEntries.some(
      (date) => date.getTime() === currentWeekStart.getTime()
    );

    if (!hasCurrentWeekEntry) {
      // Check if there's an entry in the previous week
      const prevWeekStart = new Date(currentWeekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);

      const hasPrevWeekEntry = weeksWithEntries.some(
        (date) => date.getTime() === prevWeekStart.getTime()
      );

      if (!hasPrevWeekEntry) {
        return 0; // Streak broken
      }
    }

    // Count consecutive weeks
    let streak = hasCurrentWeekEntry ? 1 : 0;
    let checkWeek = hasCurrentWeekEntry
      ? currentWeekStart
      : getWeekStart(weeksWithEntries[0]);

    while (true) {
      checkWeek = new Date(checkWeek);
      checkWeek.setDate(checkWeek.getDate() - 7); // Previous week

      const weekExists = weeksWithEntries.some(
        (date) => date.getTime() === checkWeek.getTime()
      );

      if (weekExists) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  function getWeekStart(date: Date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }
</script>

<div class="flex items-center justify-between rounded-lg">
  <div class="grid grid-cols-[1.5rem_1fr] grid-rows-2 place-items-center">
    <Flame class="w-6 h-6 text-pink-900" />
    <p class="text-lg font-bold justify-self-start ml-2">{weekStreak}</p>
    <p class="text-gray-500 text-xs col-span-2 self-start">Week Streak</p>
  </div>
  <div class="grid grid-cols-[1.5rem_1fr] grid-rows-2 place-items-center">
    <MessageSquareQuote class="w-6 h-6 text-rose-300" />
    <p class="text-lg font-bold justify-self-start ml-2">{wordCount}</p>
    <p class="text-gray-500 text-xs col-span-2 self-start">Words Written</p>
  </div>
  <div class="grid grid-cols-[1.5rem_1fr] grid-rows-2 place-items-center">
    <Calendar class="w-6 h-6 text-violet-800" />
    <p class="text-lg font-bold justify-self-start ml-2">{daysJournaled}</p>
    <p class="text-gray-500 text-xs col-span-2 self-start">Days Journaled</p>
  </div>
</div>
