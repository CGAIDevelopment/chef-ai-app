import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User, LogOut, Settings, ChefHat, Book, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/userStore"

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout } = useUser()
  const router = useRouter()
  
  const toggleDropdown = () => setIsOpen(!isOpen)
  
  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/")
    setIsOpen(false)
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => router.push("/user/login")}>
          Sign In
        </Button>
        <Button size="sm" onClick={() => router.push("/user/login?register=true")}>
          Register
        </Button>
      </div>
    )
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-2 focus:outline-none"
        onClick={toggleDropdown}
      >
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || user.username}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <User className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium line-clamp-1">
            {user?.name || user?.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user?.preferences?.cookingSkillLevel || "Chef"}
          </p>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium">{user?.name || user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            
            <Link
              href="/user/preferences"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </Link>
            
            <Link
              href="/user/favorites"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="mr-2 h-4 w-4" />
              Favorite Recipes
            </Link>
            
            <Link
              href="/user/cookbook"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Book className="mr-2 h-4 w-4" />
              My Cookbook
            </Link>
            
            <div className="border-t border-gray-100 dark:border-gray-700">
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 