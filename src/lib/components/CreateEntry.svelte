<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import {
    Camera,
    ChevronDown,
    ChevronUp,
    ScanText,
    SquarePen,
    Upload,
    X,
  } from "lucide-svelte";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Separator } from "$lib/components/ui/separator";
  import { onMount } from "svelte";
  import { Slider } from "$lib/components/ui/slider";
  import MoodBlob from "./MoodBlob.svelte";
  import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
  import { getName } from "$lib/utils";
  import { Mistral } from '@mistralai/mistralai';

  let title = $state("");
  let content = $state("");
  let showInputs = $state(false);
  let showMoodSection = $state(false);
  let imagePreviewUrls = $state<string[]>([]);
  let mood = $state(-1);
  let isScanning = $state(false);

  // Add reflection prompts
  const reflectionPrompts = [
    "What's the last time you did something nice for your friends or family?",
    "What are you grateful for today?",
    "What's a challenge you recently overcame?",
    "What made you smile today?",
    "What's a goal you're working towards right now?",
    "Describe a moment that brought you joy recently.",
    "What's something new you learned this week?",
    "What would you tell your past self from a year ago?",
    "What's a small win you had recently?",
    "What's something you're looking forward to?",
  ];

  // State for current prompts
  let currentPrompts = $state<string[]>([]);

  // Function to randomly select two unique prompts
  function selectRandomPrompts() {
    const shuffled = [...reflectionPrompts].sort(() => 0.5 - Math.random());
    currentPrompts = shuffled.slice(0, 2);
  }

  onMount(() => {
    selectRandomPrompts(); // Select random prompts when component mounts
  });

  let moodName = $derived(getName(mood));
  let selectedAdjective = $state("");

  // Define adjectives for each mood category
  const moodAdjectives = {
    "Very Unpleasant": ["Distressed", "Sad", "Angry", "Anxious", "Overwhelmed"],
    Unpleasant: ["Frustrated", "Disappointed", "Worried", "Tired", "Bored"],
    Neutral: ["Calm", "Okay", "Indifferent", "Focused", "Contemplative"],
    Pleasant: ["Content", "Relaxed", "Hopeful", "Motivated", "Satisfied"],
    "Very Pleasant": ["Happy", "Excited", "Grateful", "Inspired", "Joyful"],
  };

  // Reactive value to get current adjectives based on mood
  let currentAdjectives: string[] = $derived(
    moodAdjectives[
      moodName as
        | "Very Unpleasant"
        | "Unpleasant"
        | "Neutral"
        | "Pleasant"
        | "Very Pleasant"
    ]
  );

  // Reset selected adjective when mood category changes
  $effect(() => {
    moodName;
    selectedAdjective = "";
  });

  let { handleSubmit: originalHandleSubmit } = $props();

  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles = Array.from(input.files);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        imagePreviewUrls = [...imagePreviewUrls, dataUrl];
      };
      reader.readAsDataURL(file);
    });

    // Reset the input to allow selecting the same file again
    input.value = "";
  }

  function removeImage(index: number) {
    imagePreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
  }

  // Replace the original handleSubmit with a wrapper
  function handleSubmit(event: Event) {
    event.preventDefault();
    originalHandleSubmit({
      title,
      content,
      images: imagePreviewUrls,
      mood,
      moodName,
      selectedAdjective,
    });

    // Reset form after submission
    // title = "";
    // content = "";
    // imagePreviewUrls = [];
    // showInputs = false;
    // showMoodSection = false;
    // mood = 50;
    // selectedAdjective = "";
    // selectRandomPrompts(); // Select new prompts for next time
  }

  async function handleScanJournal() {
    isScanning = true;
    
    // Create a file input for capturing image
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        isScanning = false;
        return;
      }
      
      try {
        // Process the image with Mistral OCR
        const result = await processImageWithMistralOCR(file);
        
        // Extract the first sentence as title and the rest as content
        const text = result.trim();
        
        // Find the first sentence end (period, question mark, or exclamation mark followed by space)
        const firstSentenceMatch = text.match(/[.!?]\s/);
        
        if (firstSentenceMatch && firstSentenceMatch.index !== undefined) {
          const splitIndex = firstSentenceMatch.index + 2; // +2 to include the punctuation and space
          title = text.substring(0, splitIndex).trim();
          content = text.substring(splitIndex).trim();
        } else {
          // If no sentence break is found, use first 50 chars as title
          title = text.substring(0, 50) + (text.length > 50 ? "..." : "");
          content = text;
        }
        
        // Show the input fields
        showInputs = true;
        
        // Add the scanned image to the previews
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          imagePreviewUrls = [...imagePreviewUrls, dataUrl];
        };
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error("OCR processing failed:", error);
        alert("Failed to process the image. Please try again.");
      } finally {
        isScanning = false;
      }
    };
    
    // Trigger the file input click
    input.click();
  }

  async function processImageWithMistralOCR(file: File): Promise<string> {
    // Create a Mistral client
    const client = new Mistral({
      apiKey: import.meta.env.VITE_MISTRAL_API_KEY // Ensure you have this env variable
    });
    
    // First, we need to upload the file
    const fileReader = new FileReader();
    const filePromise = new Promise<ArrayBuffer>((resolve, reject) => {
      fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
      fileReader.onerror = reject;
    });
    fileReader.readAsArrayBuffer(file);
    
    const buffer = await filePromise;
    
    // Upload the file
    const uploadedFile = await client.files.upload({
      file: {
        fileName: file.name,
        content: new Uint8Array(buffer),
      },
      purpose: "ocr"
    });
    
    // Get a signed URL
    const signedUrl = await client.files.getSignedUrl({
      fileId: uploadedFile.id,
    });
    
    // Process with OCR
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "image_url",
        imageUrl: signedUrl.url,
      }
    });
    
    // Return the extracted text
    return ocrResponse.pages[0].markdown|| '';
  }
</script>

{#if !showInputs}
  <Button
    class="bg-violet-200 text-violet-700 font-medium"
    variant="ghost"
    onclick={() => {
      showInputs = true;
    }}><SquarePen class="h-4 w-4"></SquarePen>New Entry</Button
  >
  <Button 
    variant="ghost"
    onclick={handleScanJournal}
    disabled={isScanning}
  >
    <ScanText class="h-4 w-4"></ScanText>
    {#if isScanning}Scanning...{:else}Scan Journal{/if}
  </Button>
  <h1 class="text-left font-bold text-xl mt-4 mb-2">
    Select an option and write
  </h1>
  <Button
    class="bg-pink-900 text-pink-100 grid p-4 h-auto mb-2 justify-start"
    onclick={() => {
      title = currentPrompts[0];
      showInputs = true;
    }}
  >
    <span class="text-sm text-pink-300 text-left">REFLECTION</span>
    <span class="text-wrap text-left text-lg"
      >{currentPrompts[0] || "What's on your mind?"}</span
    >
  </Button>
  <Button
    class="bg-violet-800 text-violet-100 grid p-4 h-auto mb-2 justify-start"
    onclick={() => {
      title = currentPrompts[1];
      showInputs = true;
    }}
  >
    <span class="text-sm text-violet-300 text-left">REFLECTION</span>
    <span class="text-wrap text-left text-lg"
      >{currentPrompts[1] || "What's on your mind?"}</span
    >
  </Button>
{:else}
  <h2 class="text-xl font-bold">New Journal Entry</h2>
  <form onsubmit={handleSubmit}>
    <div class="space-y-6">
      <div class="space-y-2">
        <Label for="title">Title</Label>
        <Input
          id="title"
          placeholder="Give your entry a title"
          value={title}
          onchange={(e: Event) =>
            (title = (e.target as HTMLInputElement).value)}
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="content">What's on your mind?</Label>
        <Textarea
          id="content"
          placeholder="Write your thoughts here..."
          class="min-h-[150px]"
          value={content}
          onchange={(e: Event) =>
            (content = (e.target as HTMLInputElement).value)}
          required
        />
      </div>

      <!-- Mood toggle button -->
      <Button
        type="button"
        variant="ghost"
        class="w-full flex items-center justify-between px-0"
        onclick={() => {
          showMoodSection = !showMoodSection;
          mood = showMoodSection ? 50 : 0;
        }}
      >
        <span>How are you feeling?</span>
        <span class="text-xs"
          >{#if showMoodSection}<ChevronUp></ChevronUp>{:else}<ChevronDown
            ></ChevronDown>{/if}</span
        >
      </Button>

      {#if showMoodSection}
        <div class="space-y-2 pt-2">
          <div class="text-center">
            <MoodBlob {mood} size={24} isStatic={false} />
            <br />
            <span class="text-muted-foreground">{moodName}</span>
            <div
              class="flex justify-between text-xs text-muted-foreground mb-2 px-4"
            >
              <span>Very Unpleasant</span>
              <span>Very Pleasant</span>
            </div>
            <Slider
              value={50}
              max={100}
              step={1}
              type="single"
              onValueChange={(value) => (mood = value)}
              class="cursor-pointer px-4"
            />
          </div>

          <!-- Add the mood adjectives radio group -->
          <div class="space-y-1 pt-2">
            <Label>What best describes this feeling?</Label>
            <RadioGroup
              value={selectedAdjective}
              onValueChange={(value: any) => (selectedAdjective = value)}
            >
              <div class="flex flex-wrap gap-2">
                {#each currentAdjectives as adjective}
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem
                      value={adjective}
                      id={adjective}
                      class="sr-only"
                    />
                    <Label
                      for={adjective}
                      class="cursor-pointer p-3 rounded-xl cursor-pointer transition-all {selectedAdjective ===
                      adjective
                        ? 'ring-2 ring-offset-2 ring-gray-200 bg-gray-50'
                        : 'hover:bg-gray-50'}">{adjective}</Label
                    >
                  </div>
                {/each}
              </div>
            </RadioGroup>
          </div>
        </div>
      {/if}

      <Separator />

      <div class="space-y-3">
        <Label>Add Images</Label>
        <div class="flex flex-wrap gap-3">
          {#each imagePreviewUrls as url, index (index)}
            <div class="relative w-20 h-20">
              <img
                src={url || "/placeholder.svg"}
                alt={`Preview ${index}`}
                class="object-cover rounded-lg w-20 h-20"
              />
              <Button
                variant="destructive"
                size="icon"
                class="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onclick={() => removeImage(index)}
                type="button"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
          {/each}

          <div class="flex gap-2">
            <Label
              for="image-upload"
              class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Upload class="h-6 w-6 text-gray-400 mb-1" />
              <span class="text-xs text-gray-500">Upload</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                class="sr-only"
                onchange={handleImageChange}
                multiple
              />
            </Label>

            <Label
              for="camera-upload"
              class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Camera class="h-6 w-6 text-gray-400 mb-1" />
              <span class="text-xs text-gray-500">Camera</span>
              <input
                id="camera-upload"
                type="file"
                accept="image/*"
                capture="environment"
                class="sr-only"
                onchange={handleImageChange}
              />
            </Label>
          </div>
        </div>
      </div>

      <div class="pt-4">
        <Button type="submit" class="w-full">Save Entry</Button>
      </div>
    </div>
  </form>
{/if}
