"use client"

import * as React from "react"
import {
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMenu2,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Playground",
    email: "experiments@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Transaction List",
      url: "/transaction-list",
      icon: IconListDetails,
    },
    {
      title: "Menu Picker",
      url: "/menu-picker",
      icon: IconMenu2,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/transaction-list">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Playground</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
