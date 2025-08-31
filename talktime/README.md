# TalkTime - Real-time Chat Application

## 📋 Project Overview

TalkTime is a modern, real-time chat application built with Next.js and Convex. It provides a seamless messaging experience with support for both direct messages (DM) and group conversations, featuring a clean, responsive UI with dark/light theme support.

### Key Features
- **Real-time messaging** with instant message delivery
- **Direct and group conversations** with member management
- **Friend system** with friend requests and management
- **Modern UI/UX** with responsive design and theme switching
- **Message read receipts** showing who has seen messages
- **Auto-resizing chat input** with keyboard shortcuts
- **Secure authentication** using Clerk

## 🔍 Competitive Analysis

### Comparison with Existing Solutions

| Feature | TalkTime | Slack | Discord | Telegram | Matrix/Element |
|---------|----------|-------|---------|----------|----------------|
| **Complexity** | Simple & Lightweight | Complex (Enterprise) | Complex (Gaming) | Moderate | High (Federation) |
| **Real-time** | ✅ Convex-powered | ✅ | ✅ | ✅ | ✅ |
| **Group Chats** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Friend System** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Read Receipts** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Theme Support** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Audio/Video** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Integrations** | ❌ | ✅ | ✅ | ✅ | Limited |
| **Self-hosted** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Learning Curve** | Low | High | Moderate | Low | High |

### Strengths of TalkTime
- **Developer-friendly**: Built with modern, well-documented technologies
- **Lightweight**: Focused on core chat functionality without bloat
- **Customizable**: Full control over codebase and features
- **Real-time by default**: Convex provides instant updates
- **Modern UI**: Clean, accessible design with shadcn/ui components

### Limitations
- No audio/video calling (by design - focused on text chat)
- Limited to smaller groups (not designed for massive communities)
- No bot ecosystem or integrations
- Requires technical knowledge for deployment

## 🛠 Technology Stack

### Frontend
- **Next.js 15** with App Router for modern React development
- **React 19** with TypeScript for type safety
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** + **Radix UI** for accessible, customizable components
- **React Hook Form** + **Zod** for form validation
- **Lucide React** for consistent iconography

### Backend & Real-time
- **Convex** as Backend-as-a-Service for real-time data
- **Clerk** for authentication and user management
- **Real-time subscriptions** with automatic UI updates

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **PostCSS** for CSS processing
- **date-fns** for date manipulation
- **Sonner** for toast notifications

## 🏗 Architecture & Key Modules

### 1. Data Layer (Convex Schema)

The application uses a well-structured database schema with optimized indexes:

```typescript
// convex/schema.ts
export default defineSchema({
    users: defineTable({ 
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string(),
    }).index("byClerkId", ["clerkId"])
    .index("byEmail", ["email"]),

    conversations: defineTable({
        name: v.optional(v.string()),
        isGroup: v.boolean(),
        lastMessageId: v.optional(v.id("messages")),
    }),

    conversationMembers: defineTable({
        memberId: v.id("users"),
        conversationId: v.id("conversations"),
        lastSeenMessage: v.optional(v.id("messages")),
    }).index("by_memberId_conversationId", ["memberId", "conversationId"]),

    messages: defineTable({
        senderId: v.id("users"),
        conversationId: v.id("conversations"),
        type: v.string(), // "text", "image", "file"
        content: v.array(v.string()), // Flexible content storage
    }).index("by_conversationId", ["conversationId"])
});
```

**Interesting Design Decisions:**
- `content` as `v.array(v.string())` allows for flexible message types (text, images, files)
- Optimized indexes for common query patterns
- Separate `conversationMembers` table for efficient member management

### 2. Real-time Message System

The messaging system provides instant updates with read receipts:

```typescript
// convex/messages.ts
export const get = query({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        // Authentication check
        const identity = await ctx.auth.getUserIdentity();
        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });

        // Membership validation
        const membership = await ctx.db.query("conversationMembers")
            .withIndex("by_memberId_conversationId", q => 
                q.eq("memberId", currentUser._id).eq("conversationId", args.id)
            ).unique();

        // Get messages with sender details
        const messages = await ctx.db.query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
            .order("desc").collect();

        return Promise.all(messages.map(async message => ({
            message,
            senderImage: (await ctx.db.get(message.senderId)).imageUrl,
            senderName: (await ctx.db.get(message.senderId)).username,
            isCurrentUser: message.senderId === currentUser._id,
        })));
    },
});
```

**Key Features:**
- Automatic membership validation for security
- Efficient queries using indexes
- Real-time updates through Convex subscriptions

### 3. Chat Interface Components

#### Message Body with Read Receipts

```typescript
// app/(root)/conversations/[conversationId]/_components/body/Body.tsx
export const Body = ({ members }: Props) => {
  const { conversationId } = useConversation();
  const messages = useQuery(api.messages.get, { id: conversationId });
  const { mutate: markRead } = useMutationState(api.conversation.markRead);

  // Auto-mark messages as read
  useEffect(() => {
    if (messages && messages.length > 0) {
      markRead({ conversationId, messageId: messages[0].message._id });
    }
  }, [messages?.length, conversationId, markRead]);

  const formatSeenBy = (names: string[]) => {
    switch (names.length) {
      case 1: return <p>Seen by {names[0]}</p>
      case 2: return <p>Seen by {names[0]} and {names[1]}</p>
      default: return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p>Seen by {names[0]}, {names[1]}, and {names.length - 2} more</p>
            </TooltipTrigger>
            <TooltipContent>
              <ul>{names.map((name, index) => <li key={index}>{name}</li>)}</ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  };

  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3">
      {messages?.map(({ message, senderImage, senderName, isCurrentUser }, index) => {
        const lastByUser = messages[index - 1]?.message.senderId === messages[index].message.senderId;
        const seenMessage = isCurrentUser ? getSeenMessage(message._id) : undefined;

        return <Message 
          key={message._id} 
          fromCurrentUser={isCurrentUser} 
          senderImage={senderImage}
          senderName={senderName} 
          lastByUser={lastByUser} 
          content={message.content}
          createdAt={message._creationTime} 
          seen={seenMessage} 
          type={message.type} 
        />
      })}
    </div>
  );
};
```

**Interesting Features:**
- Auto-marking messages as read when viewed
- Smart read receipt formatting with tooltips for large groups
- Efficient message grouping by sender
- Reverse chronological display with `flex-col-reverse`

#### Smart Chat Input

```typescript
// app/(root)/conversations/[conversationId]/_components/input/ChatInput.tsx
export const ChatInput = () => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const { conversationId } = useConversation();
    const { mutate: createMessage, pending } = useMutationState(api.message.create);

    const form = useForm<z.infer<typeof chatMessageSchema>>({
        resolver: zodResolver(chatMessageSchema),
        defaultValues: { content: "" },
    });

    const handleSubmit = async (values: z.infer<typeof chatMessageSchema>) => {
        try {
            await createMessage({
                conversationId,
                type: "text",
                content: [values.content]
            });
            form.reset();
        } catch (error) {
            toast.error(error instanceof ConvexError ? 
                error.data : "Unexpected error occurred"
            );
        }
    };

    return (
        <Card className="w-full p-2 rounded-lg relative">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-end gap-2 w-full">
                    <FormField control={form.control} name="content"
                        render={({field}) => (
                            <FormItem className="h-full w-full">
                                <FormControl>
                                    <TextareaAutosize 
                                        onKeyDown={async e => {
                                            if(e.key === "Enter" && !e.shiftKey){
                                                e.preventDefault();
                                                await form.handleSubmit(handleSubmit)();
                                            }
                                        }} 
                                        rows={1} 
                                        maxRows={3} 
                                        {...field} 
                                        placeholder="Type a message..." 
                                        className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground placeholder:text-muted-foreground p-1.5" 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} 
                    />
                    <Button disabled={pending} size="icon" type="submit">
                        <SendHorizonal />
                    </Button>
                </form>
            </Form>
        </Card>
    );
};
```

**Key Features:**
- Auto-resizing textarea with `react-textarea-autosize`
- Enter to send, Shift+Enter for new line
- Form validation with Zod schema
- Optimistic UI updates with pending states
- Error handling with toast notifications

### 4. Custom Hooks

#### Conversation Hook

```typescript
// hooks/useConversation.tsx
export const useConversation = () => {
    const params = useParams();
    
    const conversationId = useMemo(() => 
        params?.conversationId || ("" as string),
        [params?.conversationId]
    );

    const isActive = useMemo(() => !!conversationId, [conversationId]);
    
    return { isActive, conversationId };
};
```

**Benefits:**
- Centralized conversation state management
- Memoized values for performance
- Type-safe conversation ID handling

#### Mutation State Hook

```typescript
// hooks/useMutationState.tsx
export const useMutationState = <T extends (...args: any[]) => Promise<any>>(
    mutation: T
) => {
    const [pending, setPending] = useState(false);
    
    const mutate = useCallback(async (...args: Parameters<T>) => {
        setPending(true);
        try {
            const result = await mutation(...args);
            return result;
        } finally {
            setPending(false);
        }
    }, [mutation]);

    return { mutate, pending };
};
```

**Purpose:**
- Provides loading states for mutations
- Consistent error handling
- Better UX with pending indicators

### 5. Group Management System

The group management system handles complex operations like creating, leaving, and deleting groups:

```typescript
// convex/conversation.ts
export const deleteGroup = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        // Authentication and validation
        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
        const conversation = await ctx.db.get(args.conversationId);

        // Security checks
        if (!conversation.isGroup) {
            throw new ConvexError("This is not a group conversation");
        }

        const memberships = await ctx.db.query("conversationMembers")
            .withIndex("by_conversationId", q => q.eq("conversationId", args.conversationId))
            .collect();

        // Cascade deletion
        await ctx.db.delete(args.conversationId);
        await Promise.all(memberships.map(membership => ctx.db.delete(membership._id)));
        await Promise.all(messages.map(message => ctx.db.delete(message._id)));
    },
});
```

**Security Features:**
- Comprehensive permission checks
- Cascade deletion to prevent orphaned data
- Proper error handling with descriptive messages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Convex account
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talktime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Convex and Clerk credentials
   ```

4. **Deploy Convex backend**
   ```bash
   npx convex dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

### Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

## 🏃‍♂️ Development

### Project Structure

```
talktime/
├── app/                    # Next.js App Router pages
│   └── (root)/            # Protected routes
│       ├── conversations/ # Chat functionality
│       └── friends/       # Friend management
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Custom shared components
├── convex/               # Backend functions and schema
│   ├── _generated/       # Auto-generated types
│   └── schema.ts         # Database schema
├── hooks/                # Custom React hooks
└── providers/            # Context providers
```

### Key Development Patterns

1. **Real-time Data**: Use `useQuery` for reactive data fetching
2. **Mutations**: Use `useMutationState` for optimistic updates
3. **Form Handling**: Combine React Hook Form with Zod validation
4. **Error Handling**: Use ConvexError for structured error messages
5. **Type Safety**: Leverage TypeScript throughout the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Convex](https://convex.dev) for the real-time backend
- [Clerk](https://clerk.com) for authentication
- [shadcn/ui](https://ui.shadcn.com) for the component library
- [Next.js](https://nextjs.org) for the React framework
