<script lang="ts">
  import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-svelte";
  import { Card } from "$lib/components/ui/card"; // Adjust import paths for Svelte
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import MoodBlob from "./MoodBlob.svelte";
  import { getHue, getName } from "$lib/utils";

  interface Props {
    title?: string;
    date: string;
    content: string;
    mood?: number;
    images?: { src: string; alt: string }[];
    layout?: string; // Default layout
    adjective: string;
  }

  let {
    title = "",
    date = "",
    content = "",
    mood = 50,
    images = [],
    layout = "single-with-mood",
    adjective = "",
  }: Props = $props();

  let isExpanded = $state(false);
</script>

<Card class="mb-8 rounded-xl overflow-hidden shadow-sm">
  {#if layout === "single-with-mood" && images.length > 0}
    <div class="grid grid-cols-2 gap-1">
      <div class="h-[150px] relative">
        <img
          src={images[0].src || "/placeholder.svg"}
          alt={images[0].alt}
          class="object-cover"
        />
      </div>
      {#if mood>0}
        <div
          class="h-[150px] flex flex-col items-center justify-center p-4"
          style="background-color: hsl({getHue(mood)}, 100%, 90%)"
        >
          <div class="text-sm font-medium mt-2">{getName(mood)}</div>
          <MoodBlob size={24} {mood} isStatic={true}></MoodBlob>
          <div class="text-gray-500 text-sm">{adjective}</div>
        </div>
      {/if}
    </div>
  {/if}
  {#if layout === "single-with-mood" && images.length < 1}
    {#if mood > 0}
      <div
        class="h-[150px] grid items-center grid-cols-[6rem_1fr] justify-center p-4"
        style="background: linear-gradient(to bottom, hsl({getHue(mood)}, 100%, 90%), hsl({getHue(mood)}, 100%, 85%))"
      >
        <MoodBlob size={24} {mood} isStatic={true}></MoodBlob>
        <div class="ml-4">
          <div class="text-sm font-medium mt-2">{getName(mood)}</div>
          <div class="text-gray-500 text-sm">{adjective}</div>
        </div>
      </div>
    {/if}
  {/if}
  {#if layout === "grid" && images.length > 0}
    <div class="grid grid-cols-2 gap-1">
      {#if images.length === 1}
        <div class="col-span-2 h-[200px] relative">
          <img
            src={images[0].src || "/placeholder.svg"}
            alt={images[0].alt}
            class="object-cover"
          />
        </div>
      {/if}

      {#if images.length >= 3}
        <div class="h-[calc(200px + 0.25rem)] relative">
          <img
            src={images[0].src || "/placeholder.svg"}
            alt={images[0].alt}
            class="object-cover"
          />
        </div>
        <div class="grid grid-rows-2 gap-1">
          <div class="h-[100px] relative">
            <img
              src={images[1].src || "/placeholder.svg"}
              alt={images[1].alt}
              class="object-cover"
            />
          </div>
          <div class="h-[100px] relative">
            <img
              src={images[2].src || "/placeholder.svg"}
              alt={images[2].alt}
              class="object-cover"
            />
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div>
    <div class="p-4 pb-0">
      {#if title}
        <h3 class="text-lg font-bold mb-2">{title}</h3>
      {/if}

      <div class="relative">
        <div
          class="overflow-hidden transition-all duration-300 ease-in-out h-auto"
          style:max-height={isExpanded ? "500px" : "120px"}
        >
          <p class="text-base">{content}</p>
        </div>

        {#if !isExpanded && content.length > 500}
          <div
            class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"
            aria-hidden="true"
          ></div>
        {/if}
      </div>
    </div>

    <Separator class="mt-4" />

    <div class="flex justify-between items-center px-4 pt-0">
      <span class="text-gray-500 text-sm">{date}</span>
      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onclick={() => (isExpanded = !isExpanded)}
          class="transition-transform duration-200"
        >
          {#if isExpanded && content.length > 500}
            <ChevronUp class="h-5 w-5 text-gray-400" />
          {:else if isExpanded && content.length > 500}
            <ChevronDown class="h-5 w-5 text-gray-400" />
          {/if}
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal class="h-5 w-5 text-gray-400" />
        </Button>
      </div>
    </div>
  </div></Card
>

<style>
  img {
    position: absolute;
    height: 100%;
    width: 100%;
    inset: 0px;
    color: transparent;
  }
</style>
