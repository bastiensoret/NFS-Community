"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Briefcase, 
  LogOut, 
  Home, 
  Shield, 
  User as UserIcon, 
  Settings,
  ChevronsUpDown, 
  SquareKanban,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getRoleDisplayName } from "@/lib/roles"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
  onSignOut: () => Promise<void>
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = pathname === href
    
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link href={href} className="w-full">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10 mb-1",
                isCollapsed ? "px-2 justify-center" : "px-4"
              )}
            >
              <Icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>{label}</span>}
            </Button>
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    )
  }

  return (
    <aside 
      className={cn(
        "bg-background border-r flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex items-center p-4", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-xl font-bold text-foreground truncate">NFS Community</h1>
            <p className="text-xs text-muted-foreground truncate">Grow NFS together</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className={cn("h-8 w-8", isCollapsed && "w-full")}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="px-2 space-y-1 flex-1 py-4">
        <NavItem href="/dashboard" icon={Home} label="Dashboard" />
        <NavItem href="/dashboard/candidates" icon={Users} label="Candidates" />
        <NavItem href="/dashboard/positions" icon={Briefcase} label="Positions" />
        
        <div className="pt-4 mt-4 border-t border-border/50">
          {(user?.role === "GATEKEEPER" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
            <NavItem href="/dashboard/gatekeeper" icon={SquareKanban} label="Gatekeeping" />
          )}

          {user?.role === "SUPER_ADMIN" && (
             <NavItem href="/dashboard/admin" icon={Shield} label="Administration" />
          )}
        </div>
      </nav>

      <div className="p-2 border-t mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn(
              "flex items-center gap-2 p-2 w-full hover:bg-accent rounded-md cursor-pointer transition-colors outline-none",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-8 w-8 border shrink-0">
                <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 overflow-hidden text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getRoleDisplayName(user?.role || '')}
                    </p>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align={isCollapsed ? "start" : "end"} side={isCollapsed ? "right" : "top"}>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user.name && <p className="font-medium">{user.name}</p>}
                {user.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer flex w-full items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/preferences" className="cursor-pointer flex w-full items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Preferences</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={onSignOut} className="w-full">
                <Button variant="ghost" type="submit" className="w-full justify-start h-auto p-0 font-normal hover:bg-transparent">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect</span>
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
