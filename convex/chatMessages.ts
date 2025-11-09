/**
 * Chat Message Storage
 *
 * Persist chat history for compliance and user experience.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Save a chat message (internal use from HTTP endpoints)
 */
export const saveMessage = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    conversationId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("chatMessages", {
      organizationId: args.organizationId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      conversationId: args.conversationId,
      metadata: args.metadata,
      timestamp: now,
    });
  },
});

/**
 * Get chat messages for a conversation
 */
export const getConversationMessages = query({
  args: {
    conversationId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const limit = args.limit || 100;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .take(limit);

    return messages;
  },
});

/**
 * Get all conversations for a user
 */
export const getUserConversations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.tokenIdentifier;
    const limit = args.limit || 50;

    // Get all messages for user
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .take(1000); // Reasonable limit

    // Group by conversation
    const conversationsMap = new Map<
      string,
      {
        conversationId: string;
        lastMessage: string;
        timestamp: number;
        messageCount: number;
      }
    >();

    messages.forEach((msg) => {
      const convId = msg.conversationId || "default";
      const existing = conversationsMap.get(convId);

      if (!existing || msg.timestamp > existing.timestamp) {
        conversationsMap.set(convId, {
          conversationId: convId,
          lastMessage: msg.content.substring(0, 100),
          timestamp: msg.timestamp,
          messageCount: (existing?.messageCount || 0) + 1,
        });
      }
    });

    // Convert to array and sort by timestamp
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return conversations;
  },
});

/**
 * Get chat messages for organization (admin view)
 */
export const getOrganizationMessages = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // TODO: Check if user is admin/owner of organization

    const limit = args.limit || 100;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .take(limit);

    return messages;
  },
});

/**
 * Delete a conversation (soft delete)
 */
export const deleteConversation = mutation({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;
    const now = Date.now();

    // Get all messages in conversation
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Soft delete all messages (only if user owns them)
    for (const message of messages) {
      if (message.userId === userId) {
        await ctx.db.patch(message._id, { deletedAt: now });
      }
    }

    return true;
  },
});

/**
 * Export chat history (GDPR compliance)
 */
export const exportChatHistory = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;

    // Get messages
    let messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Filter by organization if specified
    if (args.organizationId) {
      messages = messages.filter(
        (m) => m.organizationId === args.organizationId
      );
    }

    // Filter by time range
    if (args.startTime || args.endTime) {
      messages = messages.filter((m) => {
        if (args.startTime && m.timestamp < args.startTime) return false;
        if (args.endTime && m.timestamp > args.endTime) return false;
        return true;
      });
    }

    return messages.map((m) => ({
      timestamp: new Date(m.timestamp).toISOString(),
      role: m.role,
      content: m.content,
      conversationId: m.conversationId,
    }));
  },
});
