"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { useConversation } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";

type Props = React.PropsWithChildren<{
    title: string;
    action?: React.ReactNode;
}>;

const ItemList = ({ title, action: Action, children }: Props) => {
    const {isActive} = useConversation();
    return (
        <Card className={cn("hidden w-full h-full lg:flex-none lg:w-80 p-2",{
            "block" : !isActive, 
            "lg:block" : isActive,
        })}>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {Action? Action : null}
            </div>
            <div className="h-full  w-full flex flex-col items-center justify-start gap-2">
                {children}
            </div>
            

        </Card>
    );
}

export default ItemList;