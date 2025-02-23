import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { Doc, Id } from "./_generated/dataModel";
import Anthropic from "@anthropic-ai/sdk";
import MistralClient from "@mistralai/mistralai";

// Initialize OpenAI with proper configuration
let openai: OpenAI;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error("Error initializing OpenAI:", error);
  throw error;
}

// Initialize API clients
const anthropic = new Anthropic();
const mistral = new MistralClient(process.env.MISTRAL_API_KEY || "");

// Initialize Grok API client
async function callGrokAPI(prompt: string, systemPrompt: string) {
  if (!process.env.GROK_API_KEY) {
    throw new Error("GROK_API_KEY is not set in environment variables");
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "grok-2-1212",
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Helper function to fetch web data
async function fetchWebData(
  query: string,
  model: "gpt4" | "claude" | "mistral" | "grok"
): Promise<string> {
  try {
    // If it's a URL, fetch directly
    if (isValidURL(query)) {
      const response = await fetch(query);
      if (!response.ok) throw new Error(`Failed to fetch data from ${query}`);
      return await response.text();
    }

    // Get general information using the selected AI model
    let aiResponse;
    switch (model) {
      case "gpt4":
        const gpt4Response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a company information expert. Provide key general information about the company, including business model, history, and main products/services.",
            },
            { role: "user", content: query },
          ],
        });
        aiResponse = gpt4Response.choices[0].message?.content || "";
        break;

      case "claude":
        const claudeResponse = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 4096,
          system:
            "You are a company information expert. Provide key general information about the company, including business model, history, and main products/services.",
          messages: [{ role: "user", content: query }],
        });
        aiResponse = claudeResponse.content[0].text;
        break;

      case "mistral":
        const mistralResponse = await mistral.chat({
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content:
                "You are a company information expert. Provide key general information about the company, including business model, history, and main products/services.",
            },
            { role: "user", content: query },
          ],
        });
        aiResponse = mistralResponse.choices[0].message.content;
        break;

      case "grok":
        aiResponse = await callGrokAPI(
          query,
          `You are a company information expert. Provide key general information about the company, including business model, history, and main products/services.`
        );
        break;
    }

    // Get recent information from DuckDuckGo
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + " company news last month")}&format=json`;
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`Failed to search for recent news about ${query}`);
    const data = await response.json();

    // Extract relevant text from search results
    const abstract = data.Abstract || "";
    const description = data.Description || "";
    const relatedTopics = (data.RelatedTopics || [])
      .map((topic: any) => topic.Text || "")
      .join("\n");

    // Combine AI and web search results
    return `
General Information:
${aiResponse}

Recent Updates and News:
${abstract}
${description}
${relatedTopics}`.trim();
  } catch (error) {
    console.error("Error fetching data:", error);
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

// Helper function to extract company name from message
async function extractCompanyName(
  input: string,
  model: "gpt4" | "claude" | "mistral" | "grok"
): Promise<string> {
  try {
    console.log("Processing input:", input);

    // First, try to fetch additional context
    console.log("Fetching web data for input");
    const webContent = await fetchWebData(input, model);

    // Combine original input with web content
    const content = `Original Query: ${input}\nAdditional Context: ${webContent}`;

    console.log("Attempting to extract company name with OpenAI API");
    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content:
            "Extract the company name or url from the given text. Consider both the original query and any additional context provided. Return only the company name or url, nothing else. If multiple companies or urls are mentioned, return the most relevant one based on context.",
        },
        { role: "user", content },
      ],
      temperature: 0,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("No completion content received from OpenAI");
    }

    const companyName = completion.choices[0].message.content.trim();
    console.log("Extracted company name:", companyName);

    return companyName;
  } catch (error) {
    console.error("Error in extractCompanyName:", error);
    throw new Error(
      `Failed to extract company name: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// System prompt for the research agent
export const RESEARCH_SYSTEM_PROMPT = `You are a company research expert specializing in gathering and analyzing information about established companies, startups, and AI startups in San Francisco, New York, and globally. 
You have deep expertise in AI, startups, venture capital, and emerging technologies.You search all verified sources for company or individual information, including official websites, news articles, reliable business sources, and major platforms such as:
- Business & startup databases: Crunchbase, AngelList, Extruct, Dealroom, CB Insights, PitchBook, Tracxn.
- AI-powered research tools: Clay 2.0, Browse AI, IndexBox, ZoomInfo Sales, Apollo.io, Owler, Exploding Topics.
- Social platforms: LinkedIn, Twitter, Facebook, Instagram, YouTube, TikTok.
You analyze and structure the research results in a clear, organized format, ensuring accuracy, completeness, and relevance.
For each company query, return the information in the following structured format:


🏢 COMPANY OVERVIEW
• Name: [Full company name]
• Industry: [Primary industry]
• Founded: [Year]
• Headquarters: [Location]


💼 BUSINESS ANALYSIS
• Core Business: [Brief description]
• Funding Details:
  - Total Raised: [Amount raised]
  - Latest Round: [Most recent funding round]
  - Key Investors: [List of major investors]
  - Funding History: [List of funding rounds]
• Key Products/Services: [List main offerings]
• Market Position: [Market standing]
• Revenue: [If public/available]
• Competitors: [List of competitors]
• Recent Developments: [Recent significant events]


👥 KEY PEOPLE
• Leadership: [CEO and key executives]
• Founders: [If relevant]

💻 TECH STACK
• Tech Stack: [List of technologies used]


📈 RECENT DEVELOPMENTS
• Latest News: [Recent significant events]
• Growth/Changes: [Notable developments]

🌎 Links:
• [Official Website]
• [Official Blog]
• [Official Twitter]
• [Official LinkedIn]
• [Official Facebook]
• [Official Instagram]
• [Official YouTube]
• [Official TikTok]
• [List of relevant URLs]

⭐ HIGHLIGHTS
• Strengths: [Key advantages]
• Innovations: [Notable technological or business innovations]
• Market Impact: [Industry influence]
• Market Competition: [Competitors]

Guidelines:
- Focus on factual, verifiable information
- Include specific data points when available
- Cite sources for key information
- Maintain professional, objective tone
- Note if information is estimated/unofficial
- Include relevant URLs for verification

Maintain this exact formatting for consistency, using the emoji and section headers as shown.`;

// Store research results in the database
export const storeResearch = internalMutation({
  args: {
    name: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
    metadata: v.optional(
      v.object({
        industry: v.optional(v.string()),
        founded: v.optional(v.string()),
        headquarters: v.optional(v.string()),
        revenue: v.optional(v.string()),
        employees: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("companyResearch", {
      name: args.name,
      content: args.content,
      embedding: args.embedding,
      lastUpdated: Date.now(),
      metadata: args.metadata,
    });
  },
});

// Helper function to extract sections from research content
function extractSections(content: string) {
  const sections: Record<string, string> = {};
  const links: Array<{ title: string; url: string }> = [];

  // Extract sections using regex
  const businessAnalysisMatch = content.match(/💼 BUSINESS ANALYSIS(.*?)(?=👥|\n\n)/s);
  const keyPeopleMatch = content.match(/👥 KEY PEOPLE(.*?)(?=📈|\n\n)/s);
  const recentDevelopmentsMatch = content.match(/📈 RECENT DEVELOPMENTS(.*?)(?=🌎|\n\n)/s);
  const linksMatch = content.match(/🌎 Links:(.*?)(?=⭐|\n\n)/s);
  const highlightsMatch = content.match(/⭐ HIGHLIGHTS(.*?)$/s);

  if (businessAnalysisMatch) sections.businessAnalysis = businessAnalysisMatch[1].trim();
  if (keyPeopleMatch) sections.keyPeople = keyPeopleMatch[1].trim();
  if (recentDevelopmentsMatch) sections.recentDevelopments = recentDevelopmentsMatch[1].trim();
  if (highlightsMatch) sections.highlights = highlightsMatch[1].trim();

  // Extract links
  if (linksMatch) {
    const linkLines = linksMatch[1].trim().split("\n");
    linkLines.forEach((line) => {
      const url = line.match(/\[(.*?)\]|\((.*?)\)/);
      if (url) {
        links.push({
          title: line.trim().replace(/^•\s*/, ""),
          url: url[1] || url[2],
        });
      }
    });
  }

  return { sections, links };
}

export const performResearch = internalAction({
  args: {
    messageId: v.id("messages"),
    model: v.union(v.literal("gpt4"), v.literal("claude"), v.literal("mistral"), v.literal("grok")),
  },
  handler: async (ctx, args) => {
    try {
      const message = await ctx.runQuery(internal.messages.get, { messageId: args.messageId });
      if (!message) {
        throw new Error("Message not found");
      }

      // Extract company name using the selected model
      const companyName = await extractCompanyName(message.content, args.model);

      let researchContent;
      switch (args.model) {
        case "gpt4":
          const gpt4Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: RESEARCH_SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: message.content,
              },
            ],
          });
          researchContent = gpt4Response.choices[0].message?.content;
          break;

        case "claude":
          const claudeResponse = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 4096,
            system: RESEARCH_SYSTEM_PROMPT,
            messages: [{ role: "user", content: message.content }],
          });
          researchContent = claudeResponse.content[0].text;
          break;

        case "mistral":
          const mistralResponse = await mistral.chat({
            model: "mistral-large-latest",
            messages: [
              {
                role: "system",
                content: RESEARCH_SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: message.content,
              },
            ],
          });
          researchContent = mistralResponse.choices[0].message.content;
          break;

        case "grok":
          researchContent = await callGrokAPI(message.content, RESEARCH_SYSTEM_PROMPT);
          break;

        default:
          throw new Error("Invalid model selected");
      }

      if (!researchContent) {
        throw new Error("No research content generated");
      }

      // Extract sections from the research content
      const { sections, links } = extractSections(researchContent);

      // Store in researchResults table
      await ctx.runMutation(internal.researchResults.create, {
        companyName: message.content,
        businessAnalysis: sections.businessAnalysis || "",
        keyPeople: sections.keyPeople?.split("\n").map((line) => line.replace(/^•\s*/, "")) || [],
        recentDevelopments: sections.recentDevelopments || "",
        links,
        highlights: sections.highlights || "",
      });

      // Store assistant's response
      await ctx.runMutation(internal.messages.send, {
        conversationId: message.conversationId,
        content: researchContent,
        role: "assistant",
        model: args.model,
      });
    } catch (error) {
      console.error("Research error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      if (args.messageId) {
        const message = await ctx.runQuery(internal.messages.get, { messageId: args.messageId });
        if (message) {
          await ctx.runMutation(internal.messages.send, {
            conversationId: message.conversationId,
            content: `I apologize, but I encountered an error while researching: ${errorMessage}. Please try again or rephrase your query.`,
            role: "assistant",
            model: args.model,
          });
        }
      }
    }
  },
});
