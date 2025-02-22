import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import OpenAI from "openai";
import { Doc, Id } from "./_generated/dataModel";

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

// Helper function to fetch web data
async function fetchWebData(query: string): Promise<string> {
  try {
    // If it's a URL, fetch directly
    if (isValidURL(query)) {
      const response = await fetch(query);
      if (!response.ok) throw new Error(`Failed to fetch data from ${query}`);
      return await response.text();
    }

    // If it's a company name, search using DuckDuckGo
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + " company")}&format=json`;
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`Failed to search for ${query}`);
    const data = await response.json();

    // Extract relevant text from search results
    const abstract = data.Abstract || "";
    const description = data.Description || "";
    const relatedTopics = (data.RelatedTopics || [])
      .map((topic: any) => topic.Text || "")
      .join("\n");

    return `${abstract}\n${description}\n${relatedTopics}`;
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

// Helper function to extract company name from message
async function extractCompanyName(input: string): Promise<string> {
  try {
    console.log("Processing input:", input);

    // First, try to fetch additional context
    console.log("Fetching web data for input");
    const webContent = await fetchWebData(input);

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
You have deep expertise in AI, startups, venture capital, and emerging technologies.

You search all verified sources for company or individual information, including official websites, news articles, reliable business sources, and major platforms such as:
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
  },
  handler: async (ctx, args) => {
    try {
      // Get message
      const message = await ctx.runQuery(internal.messages.get, { messageId: args.messageId });
      if (!message) {
        console.error("Message not found:", args.messageId);
        throw new Error("Message not found");
      }

      // Check if research was cancelled
      const conversation = await ctx.runQuery(internal.conversations.get, {
        conversationId: message.conversationId,
      });
      if (!conversation) {
        console.error("Conversation not found:", message.conversationId);
        throw new Error("Conversation not found");
      }
      if (conversation.isCancelled) {
        console.log("Research cancelled for conversation:", message.conversationId);
        await ctx.runMutation(internal.messages.send, {
          conversationId: message.conversationId,
          content: "Research was cancelled.",
          role: "assistant",
        });
        return;
      }

      // Extract company name
      console.log("Extracting company name from:", message.content);
      const companyName = await extractCompanyName(message.content);
      if (!companyName) {
        throw new Error("Could not extract company name from message");
      }
      console.log("Extracted company name:", companyName);

      // Check cancellation again before heavy processing
      const isStillActive = await ctx.runQuery(internal.conversations.get, {
        conversationId: message.conversationId,
      });
      if (!isStillActive || isStillActive.isCancelled) {
        console.log("Research cancelled before analysis");
        return;
      }

      // Use OpenAI to analyze the message and generate research
      console.log("Starting OpenAI analysis for:", companyName);
      const analysisCompletion = await openai.chat.completions.create({
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
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Check cancellation before continuing
      const stillActive = await ctx.runQuery(internal.conversations.get, {
        conversationId: message.conversationId,
      });
      if (!stillActive || stillActive.isCancelled) {
        console.log("Research cancelled after analysis");
        return;
      }

      const researchContent = analysisCompletion.choices[0].message?.content;
      if (!researchContent) {
        throw new Error("No research content generated");
      }
      console.log("Generated research content length:", researchContent.length);

      // Extract sections and format data for storage
      const { sections, links } = extractSections(researchContent);
      console.log("Extracted sections:", Object.keys(sections));
      console.log("Found links:", links.length);

      // Store in researchResults table
      await ctx.runMutation(internal.researchResults.create, {
        companyName,
        businessAnalysis: sections.businessAnalysis || "",
        keyPeople: sections.keyPeople?.split("\n").map((line) => line.replace(/^•\s*/, "")) || [],
        recentDevelopments: sections.recentDevelopments || "",
        links,
        highlights: sections.highlights || "",
      });

      // Final cancellation check before storing
      const finalCheck = await ctx.runQuery(internal.conversations.get, {
        conversationId: message.conversationId,
      });
      if (!finalCheck || finalCheck.isCancelled) {
        console.log("Research cancelled before embedding");
        return;
      }

      // Generate embedding for storage
      console.log("Generating embedding for:", companyName);
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: researchContent,
      });

      // Store the research results
      await ctx.runMutation(internal.research.storeResearch, {
        name: companyName,
        content: researchContent,
        embedding: embeddingResponse.data[0].embedding,
      });

      // Generate sources
      console.log("Generating sources for:", companyName);
      const sourcesCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              'You are a source validator. Based on the research provided, generate a list of relevant sources that would verify this information. Include official company websites, news articles, and reliable business sources. Format your response as a valid JSON string with this exact structure: {"sources": [{"title": "Source Title", "url": "https://example.com"}]}. Do not include any additional fields.',
          },
          { role: "user", content: researchContent },
        ],
        temperature: 0.5,
      });

      let sources = [];
      try {
        const sourcesText = sourcesCompletion.choices[0].message?.content || "{}";
        console.log("Raw sources response:", sourcesText);
        const sourcesJson = JSON.parse(sourcesText);
        sources = sourcesJson.sources || [];
        console.log("Parsed sources:", sources.length);
      } catch (error) {
        console.error("Error parsing sources:", error);
        sources = [];
      }

      // Final check before sending response
      const lastCheck = await ctx.runQuery(internal.conversations.get, {
        conversationId: message.conversationId,
      });
      if (!lastCheck || lastCheck.isCancelled) {
        console.log("Research cancelled before sending response");
        return;
      }

      // Store assistant's response
      await ctx.runMutation(internal.messages.send, {
        conversationId: message.conversationId,
        content: researchContent,
        role: "assistant",
        metadata: {
          sources: sources.map((source: any) => ({
            title: source.title,
            url: source.url,
          })),
        },
      });
    } catch (error) {
      console.error("Research error:", error);

      // Send error message back to the conversation
      if (args.messageId) {
        const errorMessage = await ctx.runQuery(internal.messages.get, {
          messageId: args.messageId,
        });
        if (errorMessage) {
          const errorDetail = error instanceof Error ? error.message : "Unknown error";
          await ctx.runMutation(internal.messages.send, {
            conversationId: errorMessage.conversationId,
            content: `I apologize, but I encountered an error while researching: ${errorDetail}. Please try again or rephrase your query.`,
            role: "assistant",
          });
        }
      }
    }
  },
});
