import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const get = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.object({
    _id: v.id("conversations"),
    _creationTime: v.number(),
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
    isCancelled: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("completed")),
  },
  returns: v.object({
    conversationId: v.id("conversations"),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      title: args.title,
      status: args.status,
      createdAt: now,
      updatedAt: now,
      isCancelled: false,
    });
    return { conversationId };
  },
});

export const cancel = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      isCancelled: true,
    });
    return null;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    return conversations.map((conv) => ({
      ...conv,
      isCancelled: conv.isCancelled ?? false,
    }));
  },
});

export const migrateIsCancelled = internalMutation({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db.query("conversations").collect();
    for (const conversation of conversations) {
      if (conversation.isCancelled === undefined) {
        await ctx.db.patch(conversation._id, {
          isCancelled: false,
        });
      }
    }
  },
});

export const runMigration = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    try {
      let migratedCount = 0;

      // Get all conversations that need migration
      const conversations = await ctx.db
        .query("conversations")
        .filter((q) =>
          q.or(q.eq(q.field("isCancelled"), undefined), q.eq(q.field("updatedAt"), undefined))
        )
        .collect();

      if (conversations.length === 0) {
        return {
          success: true,
          message: "No conversations needed migration",
        };
      }

      // Update each conversation
      for (const conversation of conversations) {
        await ctx.db.patch(conversation._id, {
          isCancelled: conversation.isCancelled ?? false,
          updatedAt: conversation.updatedAt ?? conversation.createdAt,
        });
        migratedCount++;
      }

      // Clean up messages with relevance field in sources
      const messages = await ctx.db
        .query("messages")
        .filter((q) => q.neq(q.field("metadata"), undefined))
        .collect();

      let cleanedMessages = 0;
      for (const message of messages) {
        if (message.metadata?.sources) {
          const cleanSources = message.metadata.sources.map((source: any) => ({
            title: source.title,
            url: source.url,
          }));

          await ctx.db.patch(message._id, {
            metadata: {
              sources: cleanSources,
            },
          });
          cleanedMessages++;
        }
      }

      return {
        success: true,
        message: `Successfully migrated ${migratedCount} conversation(s) and cleaned up ${cleanedMessages} message(s)`,
      };
    } catch (error) {
      console.error("Migration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
});
