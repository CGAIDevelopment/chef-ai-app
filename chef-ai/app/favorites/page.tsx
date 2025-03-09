import Sidebar from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Favorites() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block h-screen fixed left-0 top-0 w-64 z-40">
        <Sidebar />
      </div>
      
      {/* Main content area - Full width on mobile, adjusted on desktop */}
      <div className="flex-1 md:ml-64 min-h-screen">
        <div className="flex h-full flex-col">
          {/* Mobile sidebar toggle */}
          <div className="block md:hidden absolute left-4 top-4 z-30">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-background/50 backdrop-blur-sm" aria-label="Open sidebar menu">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-4 pt-12 md:pt-4">
            <h1 className="text-3xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
              <Heart className="h-6 w-6 mr-2 text-red-500" />
              Favorites
            </h1>
            <Card className="shadow-md">
              <CardHeader className="bg-slate-50 dark:bg-gray-800">
                <CardTitle className="text-xl text-gray-900 dark:text-white">Favorite Recipes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white dark:bg-gray-800">
                <p className="text-base text-gray-800 dark:text-gray-200 font-medium">This is where you'll see your favorite recipes.</p>
                {/* If no favorite recipes */}
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-300 font-medium">No favorite recipes yet. Mark recipes as favorites to see them here for quick access.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 