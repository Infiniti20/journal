<script>
  import Button from "$lib/components/ui/button/button.svelte";
  import { ScanText, SquarePen } from "lucide-svelte";
</script>

<Button class="bg-violet-200 text-violet-700 font-medium"
  ><SquarePen class="h-4 w-4"></SquarePen>New Entry</Button
>
<Button variant="ghost"
  ><ScanText class="h-4 w-4"></ScanText>Scan Journal</Button
>
<h1 class="text-left font-bold text-xl mt-4 mb-2">
  Select an option and write
</h1>
<Button class="bg-pink-900 text-pink-100 grid p-4 h-auto mb-2">
  <span class="text-sm text-pink-300 text-left">REFLECTION</span>
  <span class="text-wrap text-left text-lg"
    >What's the last time you did somethin nice for your friends or family.</span
  >
</Button>
<Button class="bg-violet-800 text-violet-100 grid p-4 h-auto mb-2">
  <span class="text-sm text-violet-300 text-left">REFLECTION</span>
  <span class="text-wrap text-left text-lg"
    >What's the last time you did somethin nice for your friends or family.</span
  >
</Button>

