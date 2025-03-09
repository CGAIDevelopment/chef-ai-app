import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload, ImageIcon } from "lucide-react"
import Image from "next/image"

interface PhotoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (images: string[]) => void
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          if (newImages.length === files.length) {
            setImages((prevImages) => [...prevImages, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    onUpload(images)
    setImages([])
    onClose()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Uploaded image ${index + 1}`}
                  width={150}
                  height={150}
                  className="rounded-md object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              multiple
              className="hidden"
              ref={fileInputRef}
            />
            <Button variant="outline" className="w-full" onClick={triggerFileInput}>
              <Upload className="mr-2 h-4 w-4" />
              Add Photos
            </Button>
            <Button onClick={handleUpload} disabled={images.length === 0}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload and Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PhotoUploadModal

