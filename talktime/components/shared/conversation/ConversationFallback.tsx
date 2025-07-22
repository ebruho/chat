import { Card } from "@/components/ui/card";
import React from "react";

const ConversationFallback = () => {
    return (
        <Card className="hidden w-full h-full lg:flex p-2 items-center justify-center
        bg-secondary text-secondary-foreground">
            Select/Start a conversation to begin chatting
        </Card>
    );
}

export default ConversationFallback;