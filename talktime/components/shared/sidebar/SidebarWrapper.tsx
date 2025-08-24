import React from "react";
import DesktopNav from "./nav/DesktopNav";
import MobileNav from "./nav/MobileNav";

type Props = React.PropsWithChildren<{}>;

const SidebarWrapper = ({ children }: Props) => {
    return (
        <div className="flex flex-col lg:flex-row h-full w-full p-8 gap-8 bg-gradient-to-br from-background via-background to-muted/20">
            <MobileNav />
            <DesktopNav />
            <main className="h-[calc(100%-80px)] lg:h-full w-full flex gap-8 animate-in fade-in-0 duration-500">
                {children}      
            </main>
        </div>
    );
}

export default SidebarWrapper;