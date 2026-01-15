"use client";

import { BellIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/lib/auth-context";
import { AUTH_CONFIG } from "@/lib/config";
import { safeDecrypt } from "@/lib/crypto";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_entity_type?: string;
  related_entity_id?: string;
};

const Notifications = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { token, user } = useAuth();

  // Only fetch notifications if user is authenticated
  const shouldFetch = !!token && !!user;

  // Fetch notifications
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!token) {
        console.warn("No token available for notifications");
        return [];
      }
      try {
        // Use direct API call with token from auth context
        const basePath = "/api/v1";
        const response = await fetch(`${basePath}/notifications?limit=50`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          console.error("Notifications fetch failed:", response.status);
          return [];
        }
        return await response.json();
      } catch (error: any) {
        console.error("Error fetching notifications:", error);
        // Return empty array on error instead of throwing
        return [];
      }
    },
    enabled: shouldFetch,
    refetchInterval: shouldFetch ? 30000 : false, // Poll every 30 seconds if authenticated
    retry: 1,
    retryOnMount: false, // Don't retry on mount if it fails (prevents 401 errors on initial load)
  });

  // Fetch unread count
  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: async () => {
      if (!token) {
        console.warn("No token available for unread count");
        return { count: 0 };
      }
      try {
        // Use direct API call with token from auth context
        const basePath = "/api/v1";
        const response = await fetch(`${basePath}/notifications/unread-count`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          console.error("Unread count fetch failed:", response.status);
          return { count: 0 };
        }
        return await response.json();
      } catch (error: any) {
        console.error("Error fetching unread count:", error);
        return { count: 0 };
      }
    },
    enabled: shouldFetch,
    refetchInterval: shouldFetch ? 30000 : false, // Poll every 30 seconds if authenticated
    retry: 1,
    retryOnMount: false, // Don't retry on mount if it fails
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error("No token");
      const basePath = "/api/v1";
      const response = await fetch(`${basePath}/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("No token");
      const basePath = "/api/v1";
      const response = await fetch(`${basePath}/notifications/mark-all-read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to mark all as read");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on related entity
    if (notification.related_entity_type === "sample_request" && notification.related_entity_id) {
      // You can add navigation logic here
      // router.push(`/dashboard/erp/samples/requests`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const unreadNotifications = notifications.filter((n: Notification) => !n.is_read);
  const hasUnread = (unreadCount?.count || 0) > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <>
            <BellIcon className={hasUnread ? "animate-pulse" : ""} />
            {hasUnread && (
              <span className="bg-destructive absolute end-0 top-0 block size-2 shrink-0 rounded-full"></span>
            )}
          </>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isMobile ? "center" : "end"} className="ms-4 w-80 p-0">
        <DropdownMenuLabel className="bg-background dark:bg-muted sticky top-0 z-10 p-0">
          <div className="flex justify-between border-b px-6 py-4">
            <div className="font-medium">
              Notifications
              {hasUnread && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({unreadCount?.count || 0} unread)
                </span>
              )}
            </div>
            {hasUnread && (
              <Button
                variant="link"
                className="h-auto p-0 text-xs"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-sm text-destructive">
              Failed to load notifications
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((item: Notification) => (
              <DropdownMenuItem
                key={item.id}
                className={`group flex cursor-pointer items-start gap-9 rounded-none border-b px-4 py-3 ${
                  !item.is_read ? "bg-muted/50" : ""
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="flex flex-1 items-start gap-2">
                  <div className="flex-none">
                    <Avatar className="size-8">
                      <AvatarFallback>{item.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="dark:group-hover:text-default-800 truncate text-sm font-medium">
                      {item.title}
                    </div>
                    <div className="dark:group-hover:text-default-700 text-muted-foreground line-clamp-2 text-xs">
                      {item.message}
                    </div>
                    <div className="dark:group-hover:text-default-500 text-muted-foreground flex items-center gap-1 text-xs">
                      <ClockIcon className="size-3!" />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
                {!item.is_read && (
                  <div className="flex-0">
                    <span className="bg-destructive/80 block size-2 rounded-full border" />
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
