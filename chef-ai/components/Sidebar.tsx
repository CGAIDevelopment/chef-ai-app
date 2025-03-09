"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  ChefHat,
  CheckSquare,
  CalendarRange,
  Search,
  SparkleIcon,
  Menu,
  X,
  Tag,
  Star,
  BookOpen,
  Clock,
  PlusCircle,
  Gauge,
  Utensils,
  Home,
  Heart,
  Archive,
  Trash,
  User,
  Settings,
  CalendarDays,
  LogOut,
  ListTodo,
  Lock,
  Moon,
  Sun,
  ShoppingCart,
} from "lucide-react"
import { useUser } from "@/lib/userStore"
import { UserProfileDropdown } from "@/components/UserProfileDropdown"
import { toast } from "sonner"

// Memoize the MobileSidebarContent to prevent unnecessary re-renders
const MobileSidebarContent = memo(({ pathname }: { pathname: string }) => {
  const { isAuthenticated, logout } = useUser()
  const router = useRouter()
  
  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/user/login")
  }
  
  // Reuse the same items from the main Sidebar component
  const mainItems: NavItem[] = [
    {
      title: "Home",
      icon: Home,
      href: "/dashboard",
      variant: "ghost" as const,
    },
    {
      title: "Recipe Generator",
      icon: ChefHat,
      href: "/generate-recipes",
      variant: "ghost" as const,
    },
    {
      title: "Meal Planner",
      icon: CalendarDays,
      href: "/meal-plan",
      variant: "ghost" as const,
    },
    {
      title: "Shopping List",
      icon: ShoppingCart,
      href: "/shopping-list",
      variant: "ghost" as const,
      highlightClass: "dark:text-blue-300 text-blue-600"
    },
  ];
  
  // Recipe collection items
  const collectionItems: NavItem[] = [
    {
      title: "All Recipes",
      icon: BookOpen,
      href: "/",
      variant: "ghost" as const,
    },
    {
      title: "To Try",
      icon: Heart,
      href: "/to-try",
      variant: "ghost" as const,
    },
    {
      title: "Private",
      icon: Utensils,
      href: "/private",
      variant: "ghost" as const,
    },
    {
      title: "Archive",
      icon: Archive,
      href: "/archive",
      variant: "ghost" as const,
    },
    {
      title: "Trash",
      icon: Trash,
      href: "/trash",
      variant: "ghost" as const,
    }
  ];
  
  // User related items
  const userItems: NavItem[] = isAuthenticated ? [
    {
      title: "Profile",
      icon: User,
      href: "/user/profile",
      variant: "ghost" as const,
    },
    {
      title: "Preferences",
      icon: Settings,
      href: "/user/preferences",
      variant: "ghost" as const,
    }
  ] : [];
  
  return (
    <div className="flex h-full flex-col bg-background text-gray-900 dark:text-gray-100">
      <div className="flex h-14 items-center border-b px-4 bg-white dark:bg-gray-900">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"
          aria-label="Go to dashboard"
        >
          <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span className="font-bold">ChefAI</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 p-3">
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
          <div className="mb-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Main Menu
            </h3>
            <div className="space-y-1">
              {mainItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          <div className="mt-5 mb-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Recipe Collections
            </h3>
            <div className="space-y-1">
              {collectionItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <div className="mt-5 mb-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Your Account
              </h3>
              <div className="space-y-1">
                {userItems.map((item) => (
                  <NavItem key={item.href} item={item} pathname={pathname} />
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-x-2 text-sm font-medium py-2 px-3 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-5 w-5 text-red-500" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </nav>
      </ScrollArea>
    </div>
  )
})
MobileSidebarContent.displayName = "MobileSidebarContent"

// Memoize the DesktopSidebarContent to prevent unnecessary re-renders
const DesktopSidebarContent = memo(({ pathname }: { pathname: string }) => {
  const { isAuthenticated, logout } = useUser()
  const router = useRouter()
  
  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/user/login")
  }
  
  // Main menu items
  const mainItems: NavItem[] = [
    {
      title: "Home",
      icon: Home,
      href: "/dashboard",
      variant: "ghost" as const,
    },
    {
      title: "Recipe Generator",
      icon: ChefHat,
      href: "/generate-recipes",
      variant: "ghost" as const,
    },
    {
      title: "Meal Planner",
      icon: CalendarDays,
      href: "/meal-plan",
      variant: "ghost" as const,
    },
    {
      title: "Shopping List",
      icon: ShoppingCart,
      href: "/shopping-list",
      variant: "ghost" as const,
      highlightClass: "dark:text-blue-300 text-blue-600"
    },
  ];
  
  // Recipe collection items
  const collectionItems: NavItem[] = [
    {
      title: "All Recipes",
      icon: BookOpen,
      href: "/",
      variant: "ghost" as const,
    },
    {
      title: "To Try",
      icon: Heart,
      href: "/to-try",
      variant: "ghost" as const,
    },
    {
      title: "Private",
      icon: Utensils,
      href: "/private",
      variant: "ghost" as const,
    },
    {
      title: "Archive",
      icon: Archive,
      href: "/archive",
      variant: "ghost" as const,
    },
    {
      title: "Trash",
      icon: Trash,
      href: "/trash",
      variant: "ghost" as const,
    }
  ];
  
  // User related items
  const userItems: NavItem[] = isAuthenticated ? [
    {
      title: "Profile",
      icon: User,
      href: "/user/profile",
      variant: "ghost" as const,
    },
    {
      title: "Preferences",
      icon: Settings,
      href: "/user/preferences",
      variant: "ghost" as const,
    }
  ] : [];
  
  return (
    <div className="flex h-full flex-col text-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/dashboard" 
          className="flex items-center gap-2 font-semibold text-gray-900"
          onClick={(e) => e.currentTarget.blur()}
        >
          <ChefHat className="h-5 w-5" />
          <span>ChefAI</span>
        </Link>
        <div className="ml-auto">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-900">
              <Gauge className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4 px-4">
        <nav className="flex flex-col" aria-label="Main navigation">
          <div className="mb-2">
            {mainItems.map((item, index) => (
              <div key={item.href} className={index === 0 ? "mt-0" : "mt-1"}>
                <NavItem item={item} pathname={pathname} />
              </div>
            ))}
          </div>
        </nav>
        
        <div className="mt-6">
          <div className="pl-4 mb-3">
            <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recipe Collections
            </h2>
          </div>
          <div className="flex flex-col gap-1">
            {collectionItems.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
            <div className="pl-4 mb-3">
              <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Your Account
              </h2>
            </div>
            <div className="flex flex-col gap-1">
              {userItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="justify-start text-gray-800 hover:bg-muted hover:text-red-600"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
DesktopSidebarContent.displayName = "DesktopSidebarContent"

// Memoize the NavItems to prevent unnecessary re-renders
const NavItems = memo(({ pathname }: { pathname: string }) => {
  const items = useMemo(() => [
    {
      title: "Dashboard",
      icon: <Gauge className="h-4 w-4" />,
      href: "/dashboard",
      variant: pathname === "/dashboard" ? "default" : "ghost",
    },
    {
      title: "All Recipes",
      icon: <BookOpen className="h-4 w-4" />,
      href: "/",
      variant: pathname === "/" ? "default" : "ghost",
    },
    {
      title: "To Try",
      icon: <CheckSquare className="h-4 w-4" />,
      href: "/to-try",
      variant: pathname === "/to-try" ? "default" : "ghost",
    },
    {
      title: "Meal Plan",
      icon: <CalendarRange className="h-4 w-4" />,
      href: "/meal-plan",
      variant: pathname === "/meal-plan" ? "default" : "ghost",
    },
    {
      title: "Generate Recipe",
      icon: <SparkleIcon className="h-4 w-4" />,
      href: "/generate-recipes",
      variant: pathname === "/generate-recipes" ? "default" : "ghost",
    },
    {
      title: "Add Recipe",
      icon: <PlusCircle className="h-4 w-4" />,
      href: "/add-recipe",
      variant: pathname === "/add-recipe" ? "default" : "ghost",
    },
    {
      title: "Search",
      icon: <Search className="h-4 w-4" />,
      href: "/search",
      variant: pathname === "/search" ? "default" : "ghost",
    },
    {
      title: "Quick Meals",
      icon: <Clock className="h-4 w-4" />,
      href: "/quick-meals",
      variant: pathname === "/quick-meals" ? "default" : "ghost",
    },
    {
      title: "Popular",
      icon: <Star className="h-4 w-4" />,
      href: "/popular",
      variant: pathname === "/popular" ? "default" : "ghost",
    },
  ], [pathname])

  return (
    <>
      {items.map((item) => (
          <Button
          key={item.href}
          variant={item.variant as "default" | "ghost"}
          size="sm"
          className={cn(
            "justify-start",
            item.variant === "default" &&
              "bg-accent text-gray-900 hover:bg-accent hover:text-gray-900",
            item.variant === "ghost" &&
              "hover:bg-accent/50 text-gray-800 hover:text-gray-900"
          )}
          asChild
        >
          <Link href={item.href} className="text-current">
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Link>
          </Button>
      ))}
    </>
  )
})
NavItems.displayName = "NavItems"

// Define the NavItem interface
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "ghost" | "default" | "outline" | "link" | "destructive" | "secondary";
  label?: string;
  indicator?: boolean;
  highlightClass?: string;
}

// In the NavItem component, update to include better accessibility and styling
const NavItem = memo(
  ({ item, pathname }: { item: NavItem; pathname: string }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-x-2 text-sm font-medium py-2 px-3 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
            : item.highlightClass
              ? `hover:bg-gray-100 dark:hover:bg-gray-800 ${item.highlightClass}`
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
        )}
      >
        <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600 dark:text-blue-400" : item.highlightClass ? item.highlightClass : "text-gray-500 dark:text-gray-400")} 
          aria-hidden="true" />
        <span>{item.title}</span>
        {item.label && (
          <span
            className={cn(
              "ml-auto text-xs font-medium rounded-full px-2 py-0.5",
              isActive
                ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            )}
          >
            {item.label}
          </span>
        )}
        {item.indicator && (
          <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
        )}
      </Link>
    );
  }
);

NavItem.displayName = "NavItem";

// In the mainItems array, update the ShoppingList item to have better styling and make it more prominent
const mainItems = [
  {
    title: "Home",
    icon: Home,
    href: "/dashboard",
    variant: "ghost" as const,
  },
  {
    title: "Recipe Generator",
    icon: ChefHat,
    href: "/generate-recipes",
    variant: "ghost" as const,
  },
  {
    title: "Meal Planner",
    icon: CalendarDays,
    href: "/meal-plan",
    variant: "ghost" as const,
  },
  {
    title: "Shopping List",
    icon: ShoppingCart,
    href: "/shopping-list",
    variant: "ghost" as const,
    highlightClass: "dark:text-blue-300 text-blue-600" // Add custom highlight class for the Shopping List item
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout } = useUser()
  
  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/user/login")
  }
  
  // Recipe collection items
  const collectionItems = [
    {
      title: "All Recipes",
      icon: BookOpen,
      href: "/",
      variant: "ghost" as const,
    },
    {
      title: "To Try",
      icon: Heart,
      href: "/to-try",
      variant: "ghost" as const,
    },
    {
      title: "Private",
      icon: Utensils,
      href: "/private",
      variant: "ghost" as const,
    },
    {
      title: "Archive",
      icon: Archive,
      href: "/archive",
      variant: "ghost" as const,
    },
    {
      title: "Trash",
      icon: Trash,
      href: "/trash",
      variant: "ghost" as const,
    }
  ]
  
  // User related items - only show when authenticated
  const userItems = isAuthenticated ? [
    {
      title: "Profile",
      icon: User,
      href: "/user/profile",
      variant: "ghost" as const,
    },
    {
      title: "Preferences",
      icon: Settings,
      href: "/user/preferences",
      variant: "ghost" as const,
    }
  ] : []
  
  return (
    <aside 
      className="hidden border-r border-gray-200 dark:border-gray-800 md:block md:w-64 md:flex-shrink-0 md:h-screen md:inset-y-0 md:left-0 md:fixed z-20"
      aria-label="Main navigation sidebar"
    >
      <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            aria-label="Go to dashboard"
          >
            <ChefHat className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span className="text-xl font-bold">ChefAI</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 overflow-auto py-4 px-4">
          <nav className="flex flex-col" aria-label="Main navigation">
            <div className="mb-2">
              {mainItems.map((item, index) => (
                <div key={item.href} className={index === 0 ? "mt-0" : "mt-1"}>
                  <NavItem item={item} pathname={pathname} />
                </div>
              ))}
            </div>
          </nav>
          
          <div className="mt-6">
            <div className="pl-4 mb-3">
              <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recipe Collections
              </h2>
            </div>
            <div className="flex flex-col gap-1">
              {collectionItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
              <div className="pl-4 mb-3">
                <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Your Account
                </h2>
              </div>
              <div className="flex flex-col gap-1">
                {userItems.map((item) => (
                  <NavItem key={item.href} item={item} pathname={pathname} />
                ))}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-gray-800 hover:bg-muted hover:text-red-600"
                  size="sm"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
        <div className="hidden border-t px-3 py-4 md:block">
          <UserProfileDropdown />
        </div>
      </div>
    </aside>
  )
}

