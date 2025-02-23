import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { Id } from "./_generated/dataModel";
import { RESEARCH_SYSTEM_PROMPT } from "./research";

// Helper function to fetch web data
async function fetchWebData(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
    return await response.text(); // Extract the page content as text
  } catch (error) {
    console.error("Error fetching web data:", error);
    return ""; // Return empty string if fetch fails
  }
}

// Helper function to validate URLs
function isValidURL(str: string): boolean {
  try {
    new URL(str); // Check if it's a valid URL
    return true;
  } catch {
    return false;
  }
}

const http = httpRouter();

http.route({
  path: "/research",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let { readable, writable } = new TransformStream();
    let writer = writable.getWriter();
    const textEncoder = new TextEncoder();

    const body = await request.json();
    const { messageId, content } = body as { messageId: Id<"messages">; content: string };

    const message = await ctx.runQuery(internal.messages.get, { messageId });
    if (!message) {
      throw new Error("Message not found");
    }
    const conversationId = message.conversationId;

    const streamData = async () => {
      let researchContent = "";
      const openai = new OpenAI();

      // Process input content
      let processedContent = content;
      if (isValidURL(content)) {
        console.log(`Fetching web data from: ${content}`);
        const webContent = await fetchWebData(content);
        if (webContent) {
          processedContent = webContent;
        }
      }

      // Extract company name first
      const nameCompletion = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          {
            role: "system",
            content:
              "Extract the company name from the given text. Return only the company name, nothing else.",
          },
          { role: "user", content: processedContent },
        ],
        temperature: 0,
      });
      const companyName = nameCompletion.choices[0].message?.content || "";

      // Stream research using direct fetch
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-0125-preview",
          messages: [
            {
              role: "system",
              content: RESEARCH_SYSTEM_PROMPT,
            },
            { role: "user", content: processedContent },
          ],
          stream: true,
        }),
      });

      if (!response.ok) throw new Error("OpenAI API request failed: " + response.statusText);
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content;
              if (content) {
                researchContent += content;
                // Write to response stream
                await writer.write(textEncoder.encode(content));

                // Update database on section breaks
                if (content.includes("\n\n")) {
                  await ctx.runMutation(internal.messages.send, {
                    conversationId,
                    content: researchContent,
                    role: "assistant",
                    model: "gpt4",
                    metadata: {
                      sources: [],
                    },
                  });
                }
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }

      // Generate sources after completion
      const sourcesCompletion = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          {
            role: "system",
            content:
              'You are a source validator. Based on the research provided, generate a list of relevant sources that would verify this information. Include official company websites, news articles, and reliable business sources. Format your response as a valid JSON string with this exact structure: {"sources": [{"title": "Source Title", "url": "https://example.com"}]}',
          },
          { role: "user", content: researchContent },
        ],
        temperature: 0.5,
      });

      let sources = [];
      try {
        const sourcesText = sourcesCompletion.choices[0].message?.content || "{}";
        const sourcesJson = JSON.parse(sourcesText);
        sources = sourcesJson.sources || [];
      } catch (error) {
        console.error("Error parsing sources:", error);
        sources = [];
      }

      // Store final research results
      await ctx.runMutation(internal.messages.send, {
        conversationId,
        content: researchContent,
        role: "assistant",
        model: "gpt4",
        metadata: {
          sources: sources.map((source: any) => ({
            title: source.title,
            url: source.url,
          })),
        },
      });

      await writer.close();
    };

    // Start streaming without waiting
    void streamData();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }),
});

export default http;
