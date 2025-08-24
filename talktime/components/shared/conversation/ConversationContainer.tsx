import { Card } from "@/components/ui/card";
import React from "react";

type Props = React.PropsWithChildren<{}>;

const ConversationContainer = ({children} : Props) => {
    return (
        <Card className="w-full h-[calc(100svh-32px)] lg:h-full flex flex-col gap-4 glass shadow-2xl border-0 backdrop-blur-sm animate-in fade-in-0 duration-500 p-6">
            {children} 
        </Card>
    );
}

export default ConversationContainer;