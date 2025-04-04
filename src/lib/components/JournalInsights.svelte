<script lang="ts">
  import { onMount } from "svelte";
  import { Send } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import {
  type Content,
} from "@google/generative-ai";

import type {JournalEntry} from "$lib/utils.ts"
  import {
    getAllEntries,
  } from "$lib/stores/journalStore.svelte";

  interface Message {
    id: string;
    content: string;
    sender: "user" | "system";
    timestamp: Date;
  }

  let messages: Message[] = $state([
    {
      id: "1",
      content:
        "Can you give me some insights you have learned from my journal?",
      sender: "user",
      timestamp: new Date(),
    },
  ]);

  let inputValue = $state("");
  let messagesEndRef: HTMLDivElement;
  let inputRef: any;
  let isTyping = $state(false);
  let history:Content[] = $state([])

  onMount(async () => {
    if (inputRef && typeof inputRef.focus === "function") {
      inputRef.focus();
    }

     isTyping = true;

    // Simulate generating a response with a slight delay
    const response = await generateResponse(processJournals(await getAllEntries()));
    const systemMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      sender: "system",
      timestamp: new Date(),
    };
    messages = [...messages, systemMessage];
    isTyping = false;
  });

  $effect(() => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  });
  function processJournals(entries: JournalEntry[]){
    let res = ""
    for(let i=0;i<entries.length;i++){
      let entry = entries[i]
      res += `${entry.title} - ${entry.date}
      Mood on a scale from 0-100 (where 0 is very unpleasant, and 100 is very pleasant): ${entry.mood > 0 ? entry.mood:"[No mood provided]"}
      Adjective that describes mood is ${entry.adjective || "[No adjective provided]"} 
      ${entry.content}`
    }
    return `
    **Input:**
    ${res}
    **Let's begin.** Analyze the text above and provide the actionable insights. Then, wait for my questions.
    `
  }
  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    messages = [...messages, userMessage];

    // Save the current input before clearing it
    const currentInput = inputValue;
    inputValue = "";

    // Show typing indicator
    isTyping = true;

    // Simulate generating a response with a slight delay
    const response:any = await generateResponse(currentInput);
    const systemMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      sender: "system",
      timestamp: new Date(),
    };
    messages = [...messages, systemMessage];
    isTyping = false;
  }

  async function generateResponse(question: string): Promise<string> {
    history.push({role:"user",parts:[{text:question}]})

    const response:any = await (await fetch(`/api`, {
				method: 'POST',
				body: JSON.stringify({history:history})
			})).json();
      history.push({role:"model",parts:[{text:response.text}]})
      return cleanUpText(response.text)

  }

  function cleanUpText(t:string){
    return t.replaceAll("\n","<br/>").replaceAll(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  }
</script>

<div class="flex flex-col h-[65dvh]">
  <ScrollArea class="flex-1 p-4">
    <div class="space-y-4">
      {#each messages as message (message.id)}
        <div
          class="flex {message.sender === 'user'
            ? 'justify-end'
            : 'justify-start'}"
        >
          <div class="flex items-end gap-2 max-w-[80%]">
            {#if message.sender === "system"}
              <Avatar class="h-8 w-8 bg-indigo-100">
                <AvatarFallback class="text-indigo-500 text-xs font-medium"
                  >AI</AvatarFallback
                >
              </Avatar>
            {/if}

            <div
              class="p-3 rounded-2xl {message.sender === 'user'
                ? 'bg-indigo-500 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'}"
            >
              <p class="text-sm">{@html message.content}</p>
              <div
                class="text-xs mt-1 {message.sender === 'user'
                  ? 'text-indigo-100'
                  : 'text-gray-500'}"
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {#if message.sender === "user"}
              <Avatar class="h-8 w-8 bg-indigo-500">
                <AvatarFallback class="text-white text-xs font-medium"
                  >You</AvatarFallback
                >
              </Avatar>
            {/if}
          </div>
        </div>
      {/each}

      {#if isTyping}
        <div class="flex justify-start">
          <div class="flex items-end gap-2 max-w-[80%]">
            <Avatar class="h-8 w-8 bg-indigo-100">
              <AvatarFallback class="text-indigo-500 text-xs font-medium"
                >AI</AvatarFallback
              >
            </Avatar>

            <div
              class="p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none"
            >
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <div bind:this={messagesEndRef}></div>
    </div>
  </ScrollArea>

  <div class="py-4 border-t">
    <form onsubmit={handleSubmit} class="flex gap-2">
      <Input
        bind:this={inputRef}
        bind:value={inputValue}
        placeholder="Ask about your journaling habits..."
        class="flex-1 p-4"
      />
      <Button type="submit" size="icon" disabled={!inputValue.trim()}>
        <Send class="h-4 w-4" />
      </Button>
    </form>
  </div>
</div>

<style>
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 16px;
  }

  .typing-indicator span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #9ca3af;
    border-radius: 50%;
    animation: typing 1.4s infinite both;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0);
    }
  }
</style>
