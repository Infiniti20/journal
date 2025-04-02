<script>
  import { Flame, MessageSquareQuote, Calendar } from 'lucide-svelte';
</script>

<div class="flex items-center justify-between rounded-lg">
  <div class="grid grid-cols-[1.5rem_1fr] grid-rows-2 place-items-center">
    <Flame class="w-6 h-6 text-pink-900" />
      <p class="text-lg font-bold justify-self-start ml-2">13</p>
      <p class="text-gray-500 text-xs col-span-2 self-start">Week Streak</p>
  </div>
 <div class="grid grid-cols-[1.5rem_1fr] grid-rows-2 place-items-center">
    <MessageSquareQuote class="w-6 h-6 text-rose-300" />
      <p class="text-lg font-bold justify-self-start ml-2">3658</p>
      <p class="text-gray-500 text-xs col-span-2 self-start">Words Written</p>
  </div>
 <div class="grid grid-cols-[1.5rem_1fr] grid-rows-2 place-items-center">
    <Calendar class="w-6 h-6 text-violet-800" />
      <p class="text-lg font-bold justify-self-start ml-2">78</p>
      <p class="text-gray-500 text-xs col-span-2 self-start">Days Journaled</p>
  </div>
</div>