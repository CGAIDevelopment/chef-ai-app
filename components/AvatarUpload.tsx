import { useState } from "react"
import { FileUpload } from "@/components/ui/file-upload"
import { useUser } from "@/lib/userStore"
import { toast } from "sonner"

interface AvatarUploadProps {
  onSuccess?: () => void
  className?: string
}

export function AvatarUpload({ onSuccess, className }: AvatarUploadProps) {
  const { user, updateAvatar } = useUser()
  const [isUploading, setIsUploading] = useState(false)
  
  const handleFileChange = async (file: File | null) => {
    if (!file || !user) return
    
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.id)
      
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }
      
      const data = await response.json()
      
      // Update user avatar in store
      await updateAvatar(data.avatarPath)
      
      toast.success('Profile photo updated successfully')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload profile photo')
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <FileUpload
      onFileChange={handleFileChange}
      previewUrl={user?.avatar}
      buttonText={isUploading ? "Uploading..." : user?.avatar ? "Change Photo" : "Add Profile Photo"}
      className={className}
      accept="image/jpeg,image/png,image/webp"
      disabled={isUploading}
    />
  )
} 