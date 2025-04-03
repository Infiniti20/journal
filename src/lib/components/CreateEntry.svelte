<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { Camera, ScanText, SquarePen, Upload, X } from "lucide-svelte";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Separator } from "$lib/components/ui/separator";
  import { onMount } from "svelte";

  let title = $state("");
  let content = $state("");
  let showInputs = $state(false);
  let imagePreviewUrls = $state<string[]>([]);

  let { handleSubmit: originalHandleSubmit } = $props();

  // IndexedDB setup
  const DB_NAME = "journalImagesDB";
  const STORE_NAME = "images";
  let db: IDBDatabase;

  onMount(() => {
    initDB();
  });

  function initDB() {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
    };

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      loadImages();
    };
  }

  function loadImages() {
    if (!db) return;

    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const storedImages = getAllRequest.result;
      if (storedImages && storedImages.length > 0) {
        imagePreviewUrls = storedImages.map((img) => img.dataUrl);
      }
    };
  }

  function saveImagesToIndexedDB() {
    if (!db) return;

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      imagePreviewUrls.forEach((dataUrl) => {
        store.add({
          dataUrl,
          timestamp: new Date().getTime(),
        });
      });
    };
  }

  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles = Array.from(input.files);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        imagePreviewUrls = [...imagePreviewUrls, dataUrl];
        saveImagesToIndexedDB();
      };
      reader.readAsDataURL(file);
    });

    // Reset the input to allow selecting the same file again
    input.value = "";
  }

  function removeImage(index: number) {
    imagePreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    saveImagesToIndexedDB();
  }

  // Replace the original handleSubmit with a wrapper
  function handleSubmit(event: Event) {
    event.preventDefault();
    saveImagesToIndexedDB();
    originalHandleSubmit({ title, content, images: imagePreviewUrls });

    // Reset form after submission
    title = "";
    content = "";
    imagePreviewUrls = [];
    showInputs = false;
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
  <Button variant="ghost"
    ><ScanText class="h-4 w-4"></ScanText>Scan Journal</Button
  >
  <h1 class="text-left font-bold text-xl mt-4 mb-2">
    Select an option and write
  </h1>
  <Button
    class="bg-pink-900 text-pink-100 grid p-4 h-auto mb-2"
    onclick={() => {
      showInputs = true;
    }}
  >
    <span class="text-sm text-pink-300 text-left">REFLECTION</span>
    <span class="text-wrap text-left text-lg"
      >What's the last time you did somethin nice for your friends or family.</span
    >
  </Button>
  <Button
    class="bg-violet-800 text-violet-100 grid p-4 h-auto mb-2"
    onclick={() => {
      showInputs = true;
    }}
  >
    <span class="text-sm text-violet-300 text-left">REFLECTION</span>
    <span class="text-wrap text-left text-lg"
      >What's the last time you did somethin nice for your friends or family.</span
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
