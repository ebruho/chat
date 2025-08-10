import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { CircleArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
    imageUrl?: string;
    name: string;
    options?:{
        label: string;
        destructive: boolean;
        onClick: () => void;
    }[];
}

export const Header = ({ imageUrl, name, options }: Props) => {
    return (
        <Card className="w-full flex flex-row rounded-lg items-center p-2 justify-between">
            <div className="flex items-center gap-2">
                <Link href="/conversations" className="block lg:hidden"><CircleArrowLeft/></Link>
                <Avatar className="w-8 h-8">
                    <AvatarImage src={imageUrl} />
                    <AvatarFallback>
                        {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <h2 className="font-semibold">{name}</h2>
            </div>
            <div className="flex gap-2">
                {options ? 
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button size="icon" variant="secondary" >
                            <Settings/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {options.map((option, id) => {
                            return <DropdownMenuItem key={id} onClick={option.onClick} 
                            className={cn("font-semibold", {
                                "text-destructive" : option.destructive
                            })}>
                                {option.label}
                            </DropdownMenuItem>
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
                : null}
            </div>
        </Card>
    );
}