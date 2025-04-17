"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  ArrowUpDown, 
  Search, 
  Users, 
  Star, 
  Film, 
  UserPlus, 
  Loader2 
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

// Type for the user data
interface UserProfile {
  _id: string
  name: string
  username: string
  avatar?: string
  bio?: string
  joinDate?: string
  stats: {
    reviewsCount: number
    followersCount: number
    followingCount: number
  }
}

export default function CommunityPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState("recent")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/users")
        if (!response.ok) throw new Error("Failed to fetch users")
        const data = await response.json()
        setUsers(data.users || [])
        setFilteredUsers(data.users || [])
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])
  
  // Handle sorting
  useEffect(() => {
    if (users.length === 0) return
    
    const sortedUsers = [...filteredUsers]
    
    switch (sortOption) {
      case "name":
        sortedUsers.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "reviews":
        sortedUsers.sort((a, b) => b.stats.reviewsCount - a.stats.reviewsCount)
        break
      case "followers":
        sortedUsers.sort((a, b) => b.stats.followersCount - a.stats.followersCount)
        break
      case "recent":
        // Assuming _id has timestamp information that can be used for sorting
        // MongoDB ObjectIds contain a timestamp component
        sortedUsers.sort((a, b) => b._id.localeCompare(a._id))
        break
      default:
        break
    }
    
    setFilteredUsers(sortedUsers)
  }, [sortOption, users, searchQuery])
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredUsers(users)
      return
    }
    
    const lowercaseQuery = query.toLowerCase()
    const results = users.filter(user => 
      user.name.toLowerCase().includes(lowercaseQuery) || 
      user.username.toLowerCase().includes(lowercaseQuery) ||
      (user.bio && user.bio.toLowerCase().includes(lowercaseQuery))
    )
    
    setFilteredUsers(results)
  }
  
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header section with gradient background */}
        <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Users size={24} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">ReelCritic Community</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Connect with movie enthusiasts, follow reviewers who share your taste, and build your network of cinema lovers.
          </p>
          {!isAuthenticated && (
            <Button size="lg" className="mt-2" onClick={() => router.push("/login?register=true")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Join the Community
            </Button>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm hidden sm:block">Sort by:</label>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Joined</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="followers">Most Followers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* User list */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading community members...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(user => (
                <Card 
                  key={user._id} 
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  <CardContent className="p-0">
                    <div className="p-5">
                      <div className="flex gap-4">
                        <Link href={`/profile/${user._id}`}>
                          <Avatar className="h-12 w-12 border-2 border-background">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/profile/${user._id}`}
                            className="hover:underline font-medium line-clamp-1"
                          >
                            {user.name}
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            @{user.username}
                          </p>
                          {user.bio && (
                            <p className="text-sm mt-1 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-4">
                        <div className="flex items-center text-sm">
                          <Star className="h-3.5 w-3.5 mr-1 text-primary/70" />
                          <span>{user.stats.reviewsCount || 0} reviews</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-3.5 w-3.5 mr-1 text-primary/70" />
                          <span>{user.stats.followersCount || 0} followers</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex border-t">
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-none h-10"
                        asChild
                      >
                        <Link href={`/profile/${user._id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any users matching your search criteria. Please try a different search term.
              </p>
            </div>
          )}
        </div>
        
        {!loading && filteredUsers.length > 0 && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Showing {filteredUsers.length} of {users.length} community members
            </p>
          </div>
        )}
        
        {!isAuthenticated && (
          <div className="bg-primary/5 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to Join?</h3>
            <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
              Sign up today to start sharing your movie opinions, connect with like-minded film enthusiasts, and build your reputation as a trusted critic.
            </p>
            <Button size="lg" onClick={() => router.push("/login?register=true")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create an Account
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 