"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useMutationState } from "@/hooks/useMutationState";
import { zodResolver } from "@hookform/resolvers/zod";
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { CirclePlus, X, Users, UserPlus, Hash, Sparkles } from "lucide-react";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type Props = {}

const createGroupFromSchema = z.object({
    name: z.string().min(1, { message: "Group name is required" }),
    members: z
        .string()
        .array()
        .min(1, { message: "At least one member is required" }),
})

const CreateGroupDialog = (props: Props) => {
    const friends = useQuery(api.friends.get);
    const { mutate: createGroup, pending } = useMutationState(api.friends.createGroup);

    const form = useForm<z.infer<typeof createGroupFromSchema>>({
        resolver: zodResolver(createGroupFromSchema),
        defaultValues: {
            name: "",
            members: [],
        },
    });

    const members = form.watch("members", []);

    const unselectedFriends = useMemo(() => {
        return friends ? friends.filter((friend) => !members.includes(friend._id)) : [];
    }, [members, friends]);

    const handleSubmit = async (values: z.infer<typeof createGroupFromSchema>) => {
        await createGroup({
            name: values.name,
            members: values.members,
        }).then(() => {
            form.reset();
            toast.success("Group created successfully!");
        }).catch((error) => {
            toast.error(error instanceof ConvexError ? error.data : "An error occurred while creating the group");
        });
    };

    return (
        <Dialog>
            <Tooltip>
                <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button 
                            size="icon" 
                            variant="outline" 
                            className="w-12 h-12 rounded-xl hover-lift shadow-lg"
                        >
                            <CirclePlus className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent>
                    <p>Create Group</p>
                </TooltipContent>
            </Tooltip>
            
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <DialogTitle>Create Group</DialogTitle>
                    </div>
                    <DialogDescription className="text-foreground/90 text-base">
                        Create a new group chat and invite your friends to join the conversation.
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField 
                            control={form.control} 
                            name="name" 
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                            <Hash className="w-4 h-4" />
                                            Group Name
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input 
                                                    {...field} 
                                                    placeholder="Enter group name" 
                                                    className="pl-10 rounded-xl"
                                                />
                                                <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }} 
                        />
                        
                        <FormField 
                            control={form.control} 
                            name="members" 
                            render={({ }) => {
                                return (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                            <UserPlus className="w-4 h-4" />
                                            Add Friends
                                        </FormLabel>
                                        <FormControl>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild disabled={unselectedFriends.length === 0}>
                                                    <Button 
                                                        variant="outline" 
                                                        className="w-full justify-between rounded-xl hover-lift"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            {members.length > 0 ? `${members.length} member(s) selected` : "Select friends"}
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                                                    {unselectedFriends.length === 0 ? (
                                                        <div className="p-4 text-center text-muted-foreground">
                                                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                            <p>No friends available</p>
                                                        </div>
                                                    ) : (
                                                        unselectedFriends.map((friend) => {
                                                            return (
                                                                <DropdownMenuCheckboxItem 
                                                                    key={friend._id} 
                                                                    className="flex items-center gap-3 w-full p-3 hover:bg-accent rounded-lg cursor-pointer transition-all duration-200"
                                                                    onCheckedChange={checked => {
                                                                        if (checked) {
                                                                            form.setValue("members", [...members, friend._id]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Avatar className="w-8 h-8 shadow-sm">
                                                                        <AvatarImage src={friend.imageUrl || undefined} />
                                                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                                                                            {friend.username.substring(0, 1).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-medium truncate">{friend.username}</span>
                                                                </DropdownMenuCheckboxItem>
                                                            )
                                                        })
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }} 
                        />
                        
                        {members && members.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-semibold text-foreground">
                                        Selected Members ({members.length})
                                    </span>
                                </div>
                                <Card className="flex items-center gap-3 overflow-x-auto w-full p-4 no-scrollbar bg-gradient-to-r from-background to-muted/20 border-dashed">
                                    {friends?.filter((friend) => members.includes(friend._id)).map((friend) => {
                                        return (
                                            <div key={friend._id} className="flex flex-col items-center gap-2 group">
                                                <div className="relative">
                                                    <Avatar className="w-12 h-12 shadow-lg hover-lift transition-all duration-200">
                                                        <AvatarImage src={friend.imageUrl || undefined} />
                                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                                                            {friend.username.substring(0, 1).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="w-6 h-6 absolute -top-1 -right-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                                        onClick={() => form.setValue("members", members.filter((id) => id !== friend._id))}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-foreground/80 truncate max-w-16 text-center font-medium">
                                                    {friend.username.split(" ")[0]}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </Card>
                            </div>
                        )}
                        
                        <DialogFooter>
                            <Button 
                                disabled={pending} 
                                type="submit" 
                                variant="default" 
                                className="rounded-xl w-full sm:w-auto hover-lift"
                            >
                                {pending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Creating Group...
                                    </>
                                ) : (
                                    <>
                                        <CirclePlus className="w-4 h-4 mr-2" />
                                        Create Group
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateGroupDialog;