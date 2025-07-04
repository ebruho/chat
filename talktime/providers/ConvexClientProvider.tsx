import { useAuth } from "@clerk/clerk-react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React, { use } from "react";

type Props = {

    children: React.ReactNode;
    };

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://first-coyote-166.convex.cloud";

    const convex = new ConvexReactClient(CONVEX_URL);

    const ConvexClientProvider = ({children}: Props) => 
        {
        // This is where you would initialize your Convex client
        // For example, you might use a Convex client library to connect to your backend

        return (
            <ClerkProvider>
                
                <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
                    {children}
                </ConvexProviderWithClerk>

            </ClerkProvider>
        );
    }
export default ConvexClientProvider;