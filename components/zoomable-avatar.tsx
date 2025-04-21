"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import Image from "next/image"

// Component to visually hide elements but keep them accessible to screen readers
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
)

interface ZoomableAvatarProps {
  src: string
  alt: string
  fallback: string
  className?: string
}

export function ZoomableAvatar({ src, alt, fallback, className = "h-24 w-24 md:h-40 md:w-40" }: ZoomableAvatarProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <Avatar className={`${className} shrink-0 cursor-pointer`} onClick={() => setOpen(true)}>
        <AvatarImage src={src || "/placeholder.svg?height=200&width=200"} alt={alt || "User profile"} />
        <AvatarFallback>{fallback || "?"}</AvatarFallback>
      </Avatar>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px] p-1 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">
            {alt || "Profile picture"} (Enlarged view)
          </DialogTitle>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={src || "/placeholder.svg?height=400&width=400"}
              alt={alt || "Profile picture"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 450px"
              priority
            />
          </div>
          <DialogClose className="absolute right-2 top-2 bg-background/80 backdrop-blur rounded-full p-1.5">
            <X className="h-5 w-5" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  )
} 