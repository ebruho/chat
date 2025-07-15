import SidebarWrapper from "@/components/shared/sidebar/SidebarWrapper";
import { Sidebar } from "lucide-react";
import React from "react";

type Props = React.PropsWithChildren<{}>;

const Layout = ({children}: Props) => {
  return (
    <SidebarWrapper>{children}</SidebarWrapper>
  );
}
export default Layout;