"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Mail, Link2, Check, Share2, ExternalLink, X } from "lucide-react"
import { toast } from "sonner"
import { Recipe } from "@/lib/types"

interface ShareRecipeDialogProps {
  recipe: Recipe
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ShareRecipeDialog({ recipe, open, onOpenChange }: ShareRecipeDialogProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("link")
  const [emailTo, setEmailTo] = useState("")
  const [emailMessage, setEmailMessage] = useState(`Check out this recipe I found: "${recipe.title}"`)
  const linkInputRef = useRef<HTMLInputElement>(null)
  
  // Generate share URL for the recipe
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/recipe/${recipe.id}`
    : `/recipe/${recipe.id}`
  
  // Handle copy link button
  const handleCopyLink = () => {
    if (linkInputRef.current) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }
  
  // Handle sending email
  const handleSendEmail = () => {
    if (!emailTo) {
      toast.error("Please enter an email address")
      return
    }
    
    const subject = encodeURIComponent(`Recipe: ${recipe.title}`)
    const body = encodeURIComponent(
      `${emailMessage}\n\nView the recipe here: ${shareUrl}\n\n` +
      `${recipe.description ? `${recipe.description}\n\n` : ''}` +
      `Serving size: ${recipe.servings}\n\n` +
      `${recipe.nutritionalValue?.calories ? `Calories per serving: ${Math.round(recipe.nutritionalValue.calories / recipe.servings)}\n\n` : ''}` +
      `Ingredients:\n${recipe.ingredients?.join('\n')}\n\n` +
      `Instructions:\n${recipe.instructions?.map((step, i) => `${i + 1}. ${step}`).join('\n') || ''}`
    )
    
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, '_blank')
    toast.success(`Email link opened with ${emailTo}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader className="flex items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
              <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Share Recipe
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Share &quot;{recipe.title}&quot; with friends and family
            </DialogDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)} 
            className="absolute right-4 top-4 h-8 w-8 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4 text-gray-900 dark:text-gray-300" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="link" className="flex items-center gap-1.5 text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <Link2 className="h-4 w-4" />
              <span>Copy Link</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1.5 text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="link" className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                  Recipe Link
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="link"
                    ref={linkInputRef}
                    defaultValue={shareUrl}
                    readOnly
                    className="flex-1 bg-gray-50 dark:bg-gray-800 font-mono text-sm text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyLink}
                    className={copied ? "text-green-600 border-green-600" : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy Link</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => window.open(shareUrl, '_blank')} 
                  variant="outline" 
                  className="flex gap-1 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button 
                  onClick={() => onOpenChange(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email-to" className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                  Recipient's Email
                </Label>
                <Input 
                  id="email-to" 
                  type="email" 
                  placeholder="friend@example.com"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label htmlFor="message" className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                  Message (Optional)
                </Label>
                <Textarea 
                  id="message" 
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="h-20 resize-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p>This will open your email client with the recipe details.</p>
              </div>
              
              <div className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleSendEmail}
                  disabled={!emailTo}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Send Email
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Share this recipe directly with anyone, even if they don't have an account.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 