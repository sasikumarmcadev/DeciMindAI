'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronsUpDown, LogOut, User as UserIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/blocks/sidebar";
import { User } from 'firebase/auth';

interface UserCardProps {
    user: User | null;
    onLogout: () => void;
    onLogin: () => void;
    loading: boolean;
}

export function UserCard({ user, onLogout, onLogin, loading }: UserCardProps) {
    const { isOpen } = useSidebar();

    if (loading) {
        return (
            <SidebarMenuButton className="w-full justify-start gap-3 h-14 p-2 transition-all duration-200">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                {isOpen && (
                    <div className="flex flex-col gap-2 w-full">
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-2 w-32 bg-muted animate-pulse rounded" />
                    </div>
                )}
            </SidebarMenuButton>
        )
    }

    if (!user) {
        return (
            <SidebarMenuButton
                className="w-full justify-start gap-3 h-14 p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group"
                onClick={onLogin}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background group-hover:border-primary/50 transition-colors">
                    <UserIcon className="h-4 w-4" />
                </div>
                {isOpen && <span className="text-sm font-medium">Log in to DeciMind</span>}
            </SidebarMenuButton>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between gap-3 h-auto py-3 px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group">
                    <div className="flex items-center gap-3 overflow-hidden text-left">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {user.displayName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        {isOpen && (
                            <div className="flex flex-col items-start overflow-hidden">
                                <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                                    {user.displayName}
                                </span>
                                <span className="text-xs text-muted-foreground truncate w-full max-w-[140px]">
                                    {user.email}
                                </span>
                            </div>
                        )}
                    </div>
                    {isOpen && <ChevronsUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors ml-auto" />}
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-popover-trigger-width] min-w-56 rounded-lg" align="end" sideOffset={8}>
                <div className="flex items-center gap-2 p-2 mb-1 border-b">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.displayName}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </div>
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
