import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Make sure this is the default export
export default mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.conversations.migrateIsCancelled);
    return null;
  },
});

export const migrateMessagesToIncludeModel = internalMutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();

    for (const message of messages) {
      if (!message.model) {
        await ctx.db.patch(message._id, { model: "gpt4" });
      }
    }
  },
});
