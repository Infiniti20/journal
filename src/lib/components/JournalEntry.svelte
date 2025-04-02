<script lang="ts">
  import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-svelte";
  import { Card } from "$lib/components/ui/card"; // Adjust import paths for Svelte
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";

  interface Props {
    title?: string;
    date?: string;
    content?: string;
    mood?: any;
    images?: any;
    layout?: string; // Default layout
  }

  let {
    title = "",
    date = "",
    content = "",
    mood = null,
    images = [],
    layout = "single-with-mood",
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
      {#if mood}
        <div
          class="h-[150px] bg-[#e0f0d0] flex flex-col items-center justify-center p-4"
        >
          <div class="relative w-20 h-20">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z"
                fill="none"
                stroke={mood.color}
                stroke-width="2"
                opacity="0.3"
              />
              <path
                d="M50 20 L58 42 L80 50 L58 58 L50 80 L42 58 L20 50 L42 42 Z"
                fill="none"
                stroke={mood.color}
                stroke-width="2"
                opacity="0.5"
              />
              <path
                d="M50 30 L56 44 L70 50 L56 56 L50 70 L44 56 L30 50 L44 44 Z"
                fill="none"
                stroke={mood.color}
                stroke-width="2"
                opacity="0.7"
              />
              <path
                d="M50 40 L54 46 L60 50 L54 54 L50 60 L46 54 L40 50 L46 46 Z"
                fill={mood.color}
                opacity="0.9"
              />
              <circle cx="50" cy="50" r="2" fill="#fff" />
            </svg>
          </div>
          <div class="text-xl font-medium mt-2">{mood.name}</div>
          <div class="text-gray-500">{mood.category}</div>
        </div>
      {/if}
    </div>
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
          class="overflow-hidden transition-all duration-300 ease-in-out"
          style:max-height={isExpanded ? "500px" : "80px"}
        >
          <p class="text-base">{content}</p>
        </div>

        {#if !isExpanded}
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
          {#if isExpanded}
            <ChevronUp class="h-5 w-5 text-gray-400" />
          {:else}
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
