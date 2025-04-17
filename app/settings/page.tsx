"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsIndexPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to profile settings page
    router.replace('/settings/profile')
  }, [router])

  // Show a loading state while redirecting
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Redirecting to profile settings...
        </p>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
} 