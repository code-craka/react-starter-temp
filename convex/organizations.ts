/**
 * Organization & Team Management
 *
 * Multi-tenancy system with organizations and team members.
 * Supports role-based access control (RBAC).
 */

import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { AUDIT_ACTIONS } from "./auditLogs";
import { internal } from "./_generated/api";

/**
 * Create a new organization
 */
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    plan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;

    // Check if slug is already taken
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Organization slug already exists");
    }

    const now = Date.now();

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      ownerId: userId,
      plan: args.plan || "free",
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as owner in team members
    await ctx.db.insert("teamMembers", {
      organizationId: orgId,
      userId,
      role: "owner",
      status: "active",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Update user's organizationId
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        organizationId: orgId,
        updatedAt: now,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: orgId,
      action: AUDIT_ACTIONS.ORG_CREATED,
      resource: `organization/${orgId}`,
      resourceId: orgId,
      status: "success",
      metadata: { name: args.name, slug: args.slug },
      timestamp: now,
    });

    // Send organization created email
    if (identity.email) {
      await ctx.scheduler.runAfter(0, internal.emails.sendOrganizationCreatedEmail, {
        to: identity.email,
        organizationName: args.name,
        plan: args.plan || "free",
        dashboardLink: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`,
      });
    }

    return orgId;
  },
});

/**
 * Get organization by ID
 */
export const getOrganization = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

/**
 * Internal query to get organization by ID (used by HTTP endpoints)
 */
export const getOrganizationInternal = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

/**
 * Get organization by slug
 */
export const getOrganizationBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Get user's organizations
 */
export const getUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.tokenIdentifier;

    // Get all team memberships
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get organization details
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return {
          ...org,
          role: membership.role,
          membershipId: membership._id,
        };
      })
    );

    return organizations.filter((org) => org !== null);
  },
});

/**
 * Update organization
 */
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    settings: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;

    // Check if user is owner or admin
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Forbidden: Must be owner or admin to update organization");
    }

    const now = Date.now();

    // Update organization
    await ctx.db.patch(args.organizationId, {
      ...(args.name && { name: args.name }),
      ...(args.settings && { settings: args.settings }),
      ...(args.metadata && { metadata: args.metadata }),
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: args.organizationId,
      action: AUDIT_ACTIONS.ORG_UPDATED,
      resource: `organization/${args.organizationId}`,
      resourceId: args.organizationId,
      status: "success",
      metadata: { name: args.name, settings: args.settings },
      timestamp: now,
    });

    return args.organizationId;
  },
});

/**
 * Delete organization (soft delete)
 */
export const deleteOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;

    // Check if user is owner
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.ownerId !== userId) {
      throw new Error("Forbidden: Must be owner to delete organization");
    }

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(args.organizationId, {
      deletedAt: now,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: args.organizationId,
      action: AUDIT_ACTIONS.ORG_DELETED,
      resource: `organization/${args.organizationId}`,
      resourceId: args.organizationId,
      status: "success",
      timestamp: now,
    });

    return true;
  },
});

/**
 * Get team members for organization
 */
export const getTeamMembers = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    // Enrich with user details
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", member.userId))
          .first();

        return {
          ...member,
          user: user
            ? {
                name: user.name,
                email: user.email,
                image: user.image,
              }
            : null,
        };
      })
    );

    return enrichedMembers;
  },
});

/**
 * Invite team member
 */
export const inviteTeamMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    userEmail: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;

    // Check if inviter is owner or admin
    const inviterMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (
      !inviterMembership ||
      (inviterMembership.role !== "owner" && inviterMembership.role !== "admin")
    ) {
      throw new Error("Forbidden: Must be owner or admin to invite members");
    }

    // Find user by email
    const invitedUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!invitedUser) {
      throw new Error("User not found with this email");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("userId", invitedUser.tokenIdentifier)
      )
      .first();

    if (existingMembership) {
      throw new Error("User is already a member of this organization");
    }

    const now = Date.now();

    // Create pending membership
    const membershipId = await ctx.db.insert("teamMembers", {
      organizationId: args.organizationId,
      userId: invitedUser.tokenIdentifier,
      role: args.role,
      invitedBy: userId,
      invitedAt: now,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: args.organizationId,
      action: AUDIT_ACTIONS.TEAM_MEMBER_INVITED,
      resource: `team_member/${membershipId}`,
      resourceId: membershipId,
      status: "success",
      metadata: { invitedEmail: args.userEmail, role: args.role },
      timestamp: now,
    });

    // Send invitation email
    const org = await ctx.db.get(args.organizationId);
    if (org && args.userEmail) {
      const inviterUser = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
        .first();

      await ctx.scheduler.runAfter(0, internal.emails.sendTeamInvitationEmail, {
        to: args.userEmail,
        organizationName: org.name,
        inviterName: inviterUser?.name || "A team member",
        role: args.role,
        invitationLink: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard/team`,
      });
    }

    return membershipId;
  },
});

/**
 * Accept team invitation
 */
export const acceptTeamInvitation = mutation({
  args: {
    membershipId: v.id("teamMembers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;
    const now = Date.now();

    const membership = await ctx.db.get(args.membershipId);

    if (!membership || membership.userId !== userId) {
      throw new Error("Invalid invitation");
    }

    if (membership.status !== "pending") {
      throw new Error("Invitation already processed");
    }

    // Update membership status
    await ctx.db.patch(args.membershipId, {
      status: "active",
      joinedAt: now,
      updatedAt: now,
    });

    // Update user's organizationId if they don't have one
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .first();

    if (user && !user.organizationId) {
      await ctx.db.patch(user._id, {
        organizationId: membership.organizationId,
        updatedAt: now,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: membership.organizationId,
      action: AUDIT_ACTIONS.TEAM_MEMBER_JOINED,
      resource: `team_member/${args.membershipId}`,
      resourceId: args.membershipId,
      status: "success",
      timestamp: now,
    });

    return membership.organizationId;
  },
});

/**
 * Remove team member
 */
export const removeTeamMember = mutation({
  args: {
    membershipId: v.id("teamMembers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;
    const membership = await ctx.db.get(args.membershipId);

    if (!membership) {
      throw new Error("Membership not found");
    }

    // Check if user is owner/admin or removing themselves
    const requesterMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", membership.organizationId).eq("userId", userId)
      )
      .first();

    const isOwnerOrAdmin =
      requesterMembership &&
      (requesterMembership.role === "owner" ||
        requesterMembership.role === "admin");
    const isRemovingSelf = membership.userId === userId;

    if (!isOwnerOrAdmin && !isRemovingSelf) {
      throw new Error("Forbidden: Cannot remove this team member");
    }

    // Cannot remove owner
    if (membership.role === "owner") {
      throw new Error("Cannot remove organization owner");
    }

    const now = Date.now();

    // Delete membership
    await ctx.db.delete(args.membershipId);

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: membership.organizationId,
      action: AUDIT_ACTIONS.TEAM_MEMBER_REMOVED,
      resource: `team_member/${args.membershipId}`,
      resourceId: args.membershipId,
      status: "success",
      metadata: { removedUserId: membership.userId },
      timestamp: now,
    });

    return true;
  },
});

/**
 * Update team member role
 */
export const updateTeamMemberRole = mutation({
  args: {
    membershipId: v.id("teamMembers"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;
    const membership = await ctx.db.get(args.membershipId);

    if (!membership) {
      throw new Error("Membership not found");
    }

    // Check if user is owner or admin
    const requesterMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", membership.organizationId).eq("userId", userId)
      )
      .first();

    if (
      !requesterMembership ||
      (requesterMembership.role !== "owner" &&
        requesterMembership.role !== "admin")
    ) {
      throw new Error("Forbidden: Must be owner or admin to change roles");
    }

    // Cannot change owner role
    if (membership.role === "owner") {
      throw new Error("Cannot change owner role");
    }

    const now = Date.now();

    // Update role
    await ctx.db.patch(args.membershipId, {
      role: args.role,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: membership.organizationId,
      action: AUDIT_ACTIONS.TEAM_MEMBER_ROLE_CHANGED,
      resource: `team_member/${args.membershipId}`,
      resourceId: args.membershipId,
      status: "success",
      metadata: { newRole: args.role, previousRole: membership.role },
      timestamp: now,
    });

    return true;
  },
});

/**
 * Check if user has permission in organization
 */
export const checkPermission = query({
  args: {
    organizationId: v.id("organizations"),
    requiredRole: v.optional(
      v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasPermission: false, role: null };
    }

    const userId = identity.tokenIdentifier;

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (!membership || membership.status !== "active") {
      return { hasPermission: false, role: null };
    }

    // If no specific role required, just check membership
    if (!args.requiredRole) {
      return { hasPermission: true, role: membership.role };
    }

    // Check role hierarchy: owner > admin > member
    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    const hasPermission =
      roleHierarchy[membership.role] >= roleHierarchy[args.requiredRole];

    return { hasPermission, role: membership.role };
  },
});
