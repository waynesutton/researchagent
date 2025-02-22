import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Make sure this is the default export
export default mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.conversations.migrateIsCancelled);
    return null;
  },
});
