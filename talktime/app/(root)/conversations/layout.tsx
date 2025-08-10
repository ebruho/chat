"use client";

import ItemList from "@/components/shared/item-list/itemList";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import React, { Children, use } from "react";  
import DMConversationItem from "./_components/DMConversationItem";

type Props = React.PropsWithChildren<{}>;

const ConversationsLayout = ({ children }: Props) => {

  const conversations = useQuery(api.conversations.get);

  return (
    < >
    <ItemList title="Conversations">
      {
        conversations ? conversations.length === 0 ? <p className="w-full h-full flex items-center justify-center">
          No conversations found
        </p> : conversations.map(conversations => {
          return conversations.conversations.isGroup ? null : (
            <DMConversationItem key={conversations.conversations._id}
            id={conversations.conversations._id} username={conversations.otherMember?.username || ""}
            imageUrl={conversations.otherMember?.imageUrl || ""}
            lastMessageContent={conversations.lastMessage?.content} 
            lastMessageSender={conversations.lastMessage?.sender} />
          )
        }) : <Loader2 />
      }
    </ItemList>
        {children}
    
    </>
  );
}

export default ConversationsLayout;