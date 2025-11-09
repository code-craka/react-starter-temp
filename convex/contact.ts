/**
 * Contact Form Handler with Rate Limiting
 *
 * Handles contact form submissions from the Taskcoda website
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Submit contact form
 * Rate limit: 5 submissions per hour per email
 */
export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000; // 1 hour ago

    // Check rate limit
    const recentSubmissions = await ctx.db
      .query("contactSubmissions")
      .filter((q) => q.and(
        q.eq(q.field("email"), args.email),
        q.gt(q.field("submittedAt"), oneHourAgo)
      ))
      .collect();

    if (recentSubmissions.length >= 5) {
      throw new Error("Rate limit exceeded. Please try again in an hour.");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate fields
    if (args.name.length < 2 || args.name.length > 100) {
      throw new Error("Name must be between 2 and 100 characters");
    }

    if (args.subject.length < 3 || args.subject.length > 200) {
      throw new Error("Subject must be between 3 and 200 characters");
    }

    if (args.message.length < 10 || args.message.length > 2000) {
      throw new Error("Message must be between 10 and 2000 characters");
    }

    // Create submission
    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      submittedAt: now,
      status: "pending",
      ipAddress: undefined, // Can be added from request headers if needed
    });

    return {
      success: true,
      submissionId,
      message: "Thank you for contacting us! We'll respond within 24-48 hours.",
    };
  },
});

/**
 * Get all contact submissions (admin only - would need auth check in production)
 */
export const getAllSubmissions = query({
  handler: async (ctx) => {
    const submissions = await ctx.db
      .query("contactSubmissions")
      .order("desc")
      .take(100);

    return submissions;
  },
});

/**
 * Update submission status (admin only - would need auth check in production)
 */
export const updateSubmissionStatus = mutation({
  args: {
    submissionId: v.id("contactSubmissions"),
    status: v.union(v.literal("pending"), v.literal("responded"), v.literal("spam")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      status: args.status,
    });

    return { success: true };
  },
});
