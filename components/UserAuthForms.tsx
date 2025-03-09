import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/userStore"

export function UserAuthForms() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, register, loginDemo } = useUser()

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    
    try {
      await login(username, password)
      toast.success("Logged in successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    
    try {
      await register({ username, email, name })
      toast.success("Account created successfully! Welcome to Chef AI.")
      router.push("/user/preferences")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      await loginDemo()
      toast.success("Logged in as demo user")
      router.push("/dashboard")
    } catch (error) {
      console.error("Demo login error:", error)
      toast.error("Failed to log in as demo user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger 
            value="login" 
            className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
          >
            Login
          </TabsTrigger>
          <TabsTrigger 
            value="register" 
            className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
          >
            Register
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="mt-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                </div>
                <Input 
                  id="username" 
                  name="username" 
                  placeholder="johndoe" 
                  required 
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
            <div className="relative mt-6 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">or</span>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-amber-600 transition-colors" 
              onClick={handleDemoLogin} 
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Try Demo Account"}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="register" className="mt-0">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                </div>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="John Doe" 
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                  </svg>
                </div>
                <Input 
                  id="username" 
                  name="username" 
                  placeholder="johndoe" 
                  required 
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                </div>
                <Input 
                  id="email" 
                  name="email" 
                  placeholder="john@example.com" 
                  type="email" 
                  required 
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
} 