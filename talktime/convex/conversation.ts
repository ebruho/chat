import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const get = query({
    args: {
        id: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await getUserByClerkId({
            ctx, clerkId: identity.subject
        })

        if (!currentUser) {
            throw new ConvexError("User not found");
        }

        const requests = await ctx.db.query("requests")
            .withIndex("by_receiver", (q) => q.eq("receiver", currentUser._id))
            .collect();

        const conversation = await ctx.db.get(args.id);

        if (!conversation) {
            throw new ConvexError("Conversation not found");
        }

        const membership = await ctx.db.query("conversationMembers")
            .withIndex("by_memberId_conversationId", (q) =>
                q.eq("memberId", currentUser._id).eq("conversationId", conversation._id)
            ).unique();

        if (!membership) {
            throw new ConvexError("You are not a member of this conversation");
        }

        const allConversationMemberships = await ctx.db
            .query("conversationMembers").withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.id)).collect();

        if (!conversation.isGroup) {
            const otherMembership = allConversationMemberships.filter(
                membership => membership.memberId !== currentUser._id
            )[0]

            const otherMemberDetails = await ctx.db.get(otherMembership.memberId);

            return {
                ...conversation,
                otherMember: {
                    ...otherMemberDetails,
                    lastSeenMessageId: otherMembership.lastSeenMessage,
                },
                otherMembers: null
            };
        } else {
            const otherMembers = (await Promise.all(allConversationMemberships.filter(membership => membership.memberId !== currentUser._id)
                .map(async (membership) => {
                    const member = await ctx.db.get(membership.memberId);

                    if (!member) {
                        throw new ConvexError("Member not found");
                    }

                    return {
                        username: member.username,
                    };
                })
            ))


            return {
                ...conversation,
                otherMembers,
                otherMember: null,
            }
        }
    },
});


export const deleteGroup = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await getUserByClerkId({
            ctx, clerkId: identity.subject
        })

        if (!currentUser) {
            throw new ConvexError("User not found");
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            throw new ConvexError("The conversation is not found");
        }

        // Check if it's actually a group
        if (!conversation.isGroup) {
            throw new ConvexError("This is not a group conversation");
        }

        const memberships = await ctx.db.query("conversationMembers")
            .withIndex("by_conversationId", q => q.eq("conversationId", args.conversationId))
            .collect();

        if (!memberships || memberships.length <= 1) {
            throw new ConvexError("This group does not have enough members");
        }

        // Check if current user is a member of this conversation
        const isMember = memberships.some(membership => membership.memberId === currentUser._id);
        if (!isMember) {
            throw new ConvexError("You are not a member of this group");
        }

        const messages = await ctx.db.query("messages").withIndex("by_conversationId", q => q.eq("conversationId", args.conversationId)).collect();

        await ctx.db.delete(args.conversationId);

        await Promise.all(memberships.map(async membership => {
            await ctx.db.delete(membership._id);
        }));

        await Promise.all(messages.map(async message => {
            await ctx.db.delete(message._id);
        }));

    },
})

export const leaveGroup = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await getUserByClerkId({
            ctx, clerkId: identity.subject
        })

        if (!currentUser) {
            throw new ConvexError("User not found");
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            throw new ConvexError("The conversation is not found");
        }

        // Check if it's actually a group
        if (!conversation.isGroup) {
            throw new ConvexError("This is not a group conversation");
        }

        const membership = await ctx.db.query("conversationMembers")
            .withIndex("by_memberId_conversationId", q => q.eq("memberId", currentUser._id).eq("conversationId", args.conversationId))
            .unique();

        if (!membership) {
            throw new ConvexError("You are not a member of this group");
        }

        await ctx.db.delete(membership._id);
    },
})