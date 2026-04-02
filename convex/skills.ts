import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    skillType: v.optional(v.union(v.literal("claude"), v.literal("grok"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.skillType) {
      return await ctx.db
        .query("skills")
        .withIndex("by_user_and_type", (q) =>
          q.eq("userId", userId).eq("skillType", args.skillType!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const skill = await ctx.db.get(args.id);
    if (!skill || skill.userId !== userId) return null;

    return skill;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    skillType: v.union(v.literal("claude"), v.literal("grok")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("skills", {
      userId,
      title: args.title,
      description: args.description,
      skillType: args.skillType,
      content: args.content,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("skills"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const skill = await ctx.db.get(args.id);
    if (!skill || skill.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content !== undefined) updates.content = args.content;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const skill = await ctx.db.get(args.id);
    if (!skill || skill.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
