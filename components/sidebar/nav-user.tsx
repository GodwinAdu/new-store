"use client"

import {
  ChevronsUpDown,
  Keyboard,
  Settings,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import Link from "next/link"

import { useTourControl } from "@/hooks/use-tour-control"
import { ModeToggle } from "@/components/commons/theme/ModeToggle"



export function NavUser() {
  const { isMobile } = useSidebar()
  
  useTourControl([
    {
      target: '.school-avatar',
      content:
        'Here you can manage your school’s settings, view your plan, and more. For the best experience, switch to your school profile now and complete the necessary setup. This is essential for the app to run smoothly.'
    },
  ])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="school-avatar" asChild>
            <SidebarMenuButton
              size="lg"
              className=" data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src='' alt="store name" />
                <AvatarFallback className="rounded-lg">ST</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Store Nsme</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src='' alt="store-name" />
                  <AvatarFallback className="rounded-lg">ST</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Store name</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <div className="flex gap-2 items-center">
                <ModeToggle />
                <p className="font-extrabold">Theme</p>
              </div>
              <Link href={`/dashboard/keyboard-shortcuts`}>
                <DropdownMenuItem>
                  <Keyboard />
                  Keyboard shortcuts
                </DropdownMenuItem>
              </Link>
              <Link href={`/dashboard/settings`}>
                <DropdownMenuItem>
                  <Settings />
                  Store Settings
                </DropdownMenuItem>
              </Link>

            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
