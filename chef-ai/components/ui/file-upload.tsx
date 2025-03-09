import * as React from "react"
import { useRef, useState } from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange: (file: File | null) => void
  previewUrl?: string
  className?: string
  buttonText?: string
  accept?: string
  showPreview?: boolean
}

export function FileUpload({
  onFileChange,
  previewUrl,
  className,
  buttonText = "Upload file",
  accept = "image/*",
  showPreview = true,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(previewUrl || null)

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    
    // Clear the input value to allow re-selection of the same file
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    
    if (file) {
      onFileChange(file)
      
      if (showPreview) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onFileChange(null)
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
        {...props}
      />
      
      {showPreview && preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-24 h-24 object-cover rounded-full"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div 
          className="w-24 h-24 rounded-full bg-muted flex items-center justify-center"
          onClick={handleButtonClick}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      <Button 
        type="button" 
        onClick={handleButtonClick}
        variant="outline"
        size="sm"
        className="mt-2 text-gray-800 border-gray-400 hover:bg-gray-100 hover:text-gray-900 font-medium"
      >
        <Upload className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    </div>
  )
} 