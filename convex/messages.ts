import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const modelValidator = v.union(
  v.literal("gpt4"),
  v.literal("claude"),
  v.literal("mistral"),
  v.literal("grok")
);

type ValidModel = "gpt4" | "claude" | "mistral" | "grok";

const messageValidator = v.object({
  _id: v.id("messages"),
  _creationTime: v.number(),
  conversationId: v.id("conversations"),
  content: v.string(),
  role: v.union(v.literal("user"), v.literal("assistant")),
  createdAt: v.number(),
  model: v.optional(modelValidator),
  metadata: v.optional(
    v.object({
      sources: v.array(
        v.object({
          title: v.string(),
          url: v.string(),
        })
      ),
    })
  ),
});

function validateModel(model: string | undefined): ValidModel {
  if (!model || !["gpt4", "claude", "mistral", "grok"].includes(model)) {
    return "gpt4";
  }
  return model as ValidModel;
}

// Migration function to update all messages with missing model field
export const migrateModels = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("model"), undefined))
      .collect();

    let count = 0;
    for (const message of messages) {
      await ctx.db.patch(message._id, { model: "gpt4" });
      count++;
    }
    return count;
  },
});

export const updateMessageModel = internalMutation({
  args: {
    messageId: v.id("messages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { model: "gpt4" });
    return null;
  },
});

// Query for reading message data
export const get = internalQuery({
  args: {
    messageId: v.id("messages"),
  },
  returns: messageValidator,
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    return message;
  },
});

// Mutation for ensuring model exists
export const ensureMessageModel = internalMutation({
  args: {
    messageId: v.id("messages"),
  },
  returns: messageValidator,
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (!message.model) {
      const validModel = validateModel(undefined);
      await ctx.db.patch(args.messageId, { model: validModel });
      return { ...message, model: validModel };
    }

    return message;
  },
});

export const list = query({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.array(messageValidator),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return messages;
  },
});

export const updateMissingModels = internalMutation({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("model"), undefined))
      .collect();

    for (const message of messages) {
      await ctx.db.patch(message._id, { model: validateModel(undefined) });
    }

    return null;
  },
});

export const send = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    model: modelValidator,
    metadata: v.optional(
      v.object({
        sources: v.array(
          v.object({
            title: v.string(),
            url: v.string(),
          })
        ),
      })
    ),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: args.role,
      createdAt: Date.now(),
      model: args.model,
      metadata: args.metadata,
    });

    return messageId;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    model: v.union(v.literal("gpt4"), v.literal("claude"), v.literal("mistral"), v.literal("grok")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Save the user message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "user",
      createdAt: Date.now(),
      model: args.model,
    });

    // Schedule research
    await ctx.scheduler.runAfter(0, internal.research.performResearch, {
      messageId,
      model: args.model,
    });

    return null;
  },
});

export const generateResponse = mutation({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    model: v.union(v.literal("gpt4"), v.literal("claude"), v.literal("mistral"), v.literal("grok")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: `You asked: "${args.userMessage}"\n\nI am researching this company...`,
      role: "assistant",
      createdAt: Date.now(),
      model: args.model,
      metadata: {
        sources: [
          {
            title: "Example Source",
            url: "https://example.com",
          },
        ],
      },
    });
    return null;
  },
});
