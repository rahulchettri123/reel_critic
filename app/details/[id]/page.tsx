"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, Bookmark, Share, MessageSquare, Clock, Edit, AlertCircle, MoreVertical, Send, Loader2, Trash2, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Comment {
  _id: string
  user: {
    _id: string
    name: string
    username: string
    avatar?: string
  }
  content: string
  parentId: string | null
  replies: Comment[]
  likes: string[]
  createdAt: string
  updatedAt: string
}

// Define ObjectId type to help TypeScript
type ObjectId = string

interface Review {
  _id: string
  user: {
    _id: string
    name: string
    username: string
    avatar?: string
  }
  movie: string
  movieTitle: string
  moviePoster?: string
  rating: number
  content: string
  likes: string[] // Using string type for likes array
  comments: Comment[]
  createdAt: string
}

export default function MovieDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const movieId = params.id as string
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [movie, setMovie] = useState<any>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isWatchlist, setIsWatchlist] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Comment states
  const [expandedReview, setExpandedReview] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{reviewId: string, commentId: string | null} | null>(null)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState<Record<string, boolean>>({})
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editedCommentContent, setEditedCommentContent] = useState("")
  const [isDeletingComment, setIsDeletingComment] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null)
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const [isEditingComment, setIsEditingComment] = useState(false)
  
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null)
  const editCommentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Function to fetch movie details from API
  const fetchMovieDetails = async (refresh = false) => {
    setLoading(true)
    setError(null)
    if (refresh) {
      setIsRefreshing(true)
    }

    if (!movieId || typeof movieId !== 'string' || !movieId.trim()) {
      console.error("Invalid movie ID:", movieId);
      setError("Invalid movie ID provided");
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      console.log(`Fetching details for movie ID: ${movieId}${refresh ? " (with refresh)" : ""}`)
      
      // Use absolute URL when in production to avoid proxy issues
      let url = `/api/movies/details?id=${encodeURIComponent(movieId)}${refresh ? "&refresh=true" : ""}`;
      
      // Check if we're in a deployed environment where relative URLs might be problematic
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        const baseUrl = window.location.origin;
        url = `${baseUrl}${url}`;
        console.log("Using absolute URL in production:", url);
      }
      
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Movie data received:", data)
      
      if (data.movie) {
        // Verify that the returned movie ID matches what we requested
        if (data.movie.id !== movieId) {
          console.error("⚠️ API returned wrong movie! Requested:", movieId, "Received:", data.movie.id);
          setError(`Incorrect movie data returned (got ${data.movie.id} instead of ${movieId})`);
          setLoading(false);
          setIsRefreshing(false);
          return;
        }
        
        console.log("Movie data received:", data.movie)
        setMovie(data.movie)

        // Track view
        if (isAuthenticated) {
          try {
            await fetch("/api/movies/track-view", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ movieId }),
              credentials: "include",
            })
          } catch (trackError) {
            console.error("Error tracking view:", trackError)
          }
        }
      } else {
        console.error("No movie data returned:", data)
        setError("Failed to load movie details")
      }
    } catch (error) {
      console.error("Error fetching movie details:", error)
      setError("An error occurred while loading movie details")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch movie details directly from API
  useEffect(() => {
    if (movieId) {
      fetchMovieDetails()
    }
  }, [movieId, isAuthenticated])

  // Fetch reviews for this movie
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true)
      try {
        const response = await fetch(`/api/reviews?movie=${movieId}`, {
          credentials: "include",
        })
        const data = await response.json()
        setReviews(data.reviews || [])
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setReviewsLoading(false)
      }
    }

    if (movieId) {
      fetchReviews()
    }
  }, [movieId])

  // Check if movie is in user's favorites/watchlist
  useEffect(() => {
    if (isAuthenticated && user) {
      const checkUserLists = async () => {
        try {
          // Check favorites
          const favResponse = await fetch("/api/user/favorites", {
            credentials: "include",
          })
          const favData = await favResponse.json()
          setIsFavorite(favData.favorites?.includes(movieId) || false)

          // Check watchlist
          const watchResponse = await fetch("/api/user/watchlist", {
            credentials: "include",
          })
          const watchData = await watchResponse.json()
          setIsWatchlist(watchData.watchlist?.includes(movieId) || false)
        } catch (error) {
          console.error("Error checking user lists:", error)
        }
      }

      checkUserLists()
    }
  }, [isAuthenticated, user, movieId])

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to add movies to your favorites",
        variant: "destructive",
      })
      router.push(`/login?callbackUrl=${encodeURIComponent(`/details/${movieId}`)}`)
      return
    }

    try {
      const response = await fetch("/api/user/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          action: isFavorite ? "remove" : "add",
          movieData: movie, // Send the movie data to ensure it's in the database
        }),
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          router.push(`/login?callbackUrl=${encodeURIComponent(`/details/${movieId}`)}`)
          return
        }
        throw new Error("Failed to update favorites")
      }

      setIsFavorite(!isFavorite)
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite
          ? `${movie.title} has been removed from your favorites`
          : `${movie.title} has been added to your favorites`,
      })
    } catch (error) {
      console.error("Error updating favorites:", error)
      toast({
        title: "Action failed",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to add movies to your watchlist",
        variant: "destructive",
      })
      router.push(`/login?callbackUrl=${encodeURIComponent(`/details/${movieId}`)}`)
      return
    }

    try {
      const response = await fetch("/api/user/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          action: isWatchlist ? "remove" : "add",
          movieData: movie, // Send the movie data to ensure it's in the database
        }),
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          router.push(`/login?callbackUrl=${encodeURIComponent(`/details/${movieId}`)}`)
          return
        }
        throw new Error("Failed to update watchlist")
      }

      setIsWatchlist(!isWatchlist)
      toast({
        title: isWatchlist ? "Removed from watchlist" : "Added to watchlist",
        description: isWatchlist
          ? `${movie.title} has been removed from your watchlist`
          : `${movie.title} has been added to your watchlist`,
      })
    } catch (error) {
      console.error("Error updating watchlist:", error)
      toast({
        title: "Action failed",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle liking/unliking a review
  const handleLikeReview = async (reviewId: string, isLiked: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to like reviews",
        variant: "destructive",
      })
      router.push(`/login?callbackUrl=${encodeURIComponent(`/details/${movieId}`)}`)
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: isLiked ? "unlike" : "like" }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update like")
      }

      // Update reviews state - safely handle the user ID
      setReviews(
        reviews.map((review) => {
          if (review._id === reviewId) {
            // Make sure we have a valid string ID
            const userIdString = user?._id || "";
            
            const updatedLikes = isLiked
              ? review.likes.filter((id) => id !== userIdString)
              : [...review.likes, userIdString];

            return {
              ...review,
              likes: updatedLikes as string[], // Cast to ensure type compatibility
            };
          }
          return review;
        })
      );
    } catch (error) {
      console.error("Error updating like:", error)
      toast({
        title: "Action failed",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Load comments for a specific review
  const loadComments = useCallback(async (reviewId: string) => {
    if (commentsLoaded[reviewId]) {
      return
    }
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/comment`)
      if (response.ok) {
        const data = await response.json()
        
        // Update the specific review with fetched comments
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId 
              ? {...review, comments: data.comments || []} 
              : review
          )
        )
        
        // Mark comments as loaded for this review
        setCommentsLoaded(prev => ({...prev, [reviewId]: true}))
      }
    } catch (error) {
      console.error("Failed to load comments:", error)
    }
  }, [commentsLoaded])

  // Toggle comment section for a review
  const handleToggleComments = useCallback((reviewId: string) => {
    setExpandedReview(prev => prev === reviewId ? null : reviewId)
    
    if (expandedReview !== reviewId && !commentsLoaded[reviewId]) {
      loadComments(reviewId)
    }
  }, [expandedReview, commentsLoaded, loadComments])

  // Handle comment submission
  const handleSubmitComment = useCallback(async (e: React.FormEvent, reviewId: string, parentCommentId: string | null = null) => {
    e.preventDefault()
    if (!commentText.trim() || !isAuthenticated || isSubmittingComment) return

    // Ensure mention is at the beginning if it's a reply
    let finalContent = commentText;
    if (parentCommentId) {
      // Find the review
      const review = reviews.find(r => r._id === reviewId)
      if (!review) return
      
      // Find any @username mention at the start
      const mentionMatch = commentText.match(/^@(\w+)/);
      
      // If there's no mention at the start but we're replying, find the username we need
      if (!mentionMatch) {
        // Find the comment we're replying to - could be in nested replies
        let parentComment: Comment | undefined;
        
        for (const comment of review.comments) {
          if (comment._id === parentCommentId) {
            parentComment = comment;
            break;
          }
          
          // Check in replies
          if (comment.replies) {
            const foundInReplies = comment.replies.find(reply => reply._id === parentCommentId);
            if (foundInReplies) {
              parentComment = foundInReplies;
              break;
            }
          }
        }
        
        if (parentComment) {
          // Add the username mention at the beginning
          finalContent = `@${parentComment.user.username} ${commentText.trim()}`;
        }
      }
    }

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/reviews/${reviewId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: finalContent,
          parentCommentId: parentCommentId
        }),
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review._id !== reviewId) return review;
            
            if (parentCommentId) {
              // Add reply to the parent comment
              return {
                ...review,
                comments: review.comments.map(comment => {
                  if (comment._id === parentCommentId) {
                    return {
                      ...comment,
                      replies: [data.comment, ...(comment.replies || [])]
                    }
                  }
                  return comment;
                })
              }
            } else {
              // Add top-level comment
              return {
                ...review,
                comments: [data.comment, ...review.comments]
              }
            }
          })
        )
        
        setCommentText("")
        setReplyingTo(null)
        
        toast({
          title: "Comment posted",
          description: "Your comment has been posted successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }, [commentText, isAuthenticated, isSubmittingComment, reviews, toast])

  // Handle replying to a comment
  const handleReply = useCallback((reviewId: string, commentId: string, username: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to reply to comments",
        variant: "destructive",
      })
      router.push(`/login?callbackUrl=${encodeURIComponent(`/details/${movieId}`)}`)
      return
    }
    
    const currentReplyingTo = replyingTo?.reviewId === reviewId && replyingTo?.commentId === commentId;
    
    // Cancel reply if already replying to this comment
    if (currentReplyingTo) {
      setReplyingTo(null)
      setCommentText("")
      return
    }
    
    // Set up new reply
    setReplyingTo({ reviewId, commentId })
    const mentionText = `@${username} `;
    setCommentText(mentionText);
    
    // Use setTimeout to position cursor after the DOM updates
    setTimeout(() => {
      if (replyTextareaRef.current) {
        replyTextareaRef.current.focus();
        replyTextareaRef.current.selectionStart = mentionText.length;
        replyTextareaRef.current.selectionEnd = mentionText.length;
      }
    }, 50);
  }, [isAuthenticated, replyingTo, router, movieId, toast])

  // Toggle replies visibility
  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
  }, [])

  // Function to render comment text with @ mention highlighting
  const renderCommentWithMentions = (text: string) => {
    // Look for mentions at the start of the text
    const startMentionMatch = text.match(/^@(\w+)\s/);
    
    if (startMentionMatch) {
      const mention = startMentionMatch[0];
      const mentionLength = mention.length;
      const restOfText = text.substring(mentionLength);
      
      return (
        <>
          <span className="text-primary font-bold">
            {mention.trim()}
          </span>
          {" "}{restOfText}
        </>
      );
    }
    
    // If no mention at the start, just return the text
    return text;
  };

  // Start editing a comment
  const startEditingComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditedCommentContent(content);
    
    // Focus the textarea after rendering
    setTimeout(() => {
      if (editCommentTextareaRef.current) {
        editCommentTextareaRef.current.focus();
      }
    }, 50);
  };
  
  // Cancel editing a comment
  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditedCommentContent("");
  };
  
  // Delete comment dialog
  const openDeleteCommentDialog = (reviewId: string, commentId: string) => {
    setDeleteReviewId(reviewId);
    setDeleteCommentId(commentId);
    setDeleteCommentDialogOpen(true);
  };

  // Handle delete comment
  const handleDeleteComment = async () => {
    if (!isAuthenticated || !deleteCommentId || !deleteReviewId) return;
    
    setIsDeletingComment(true);
    try {
      const response = await fetch(`/api/reviews/${deleteReviewId}/comment/${deleteCommentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (response.ok) {
        // Update reviews state by removing the comment
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review._id !== deleteReviewId) return review;
            
            // Check if it's a top-level comment
            const isTopLevel = review.comments.some(c => c._id === deleteCommentId);
            
            if (isTopLevel) {
              // Remove top-level comment
              return {
                ...review,
                comments: review.comments.filter(c => c._id !== deleteCommentId)
              };
            } else {
              // Remove from replies
              return {
                ...review,
                comments: review.comments.map(comment => ({
                  ...comment,
                  replies: comment.replies?.filter(reply => reply._id !== deleteCommentId) || []
                }))
              };
            }
          })
        );
        
        toast({
          title: "Comment deleted",
          description: "Your comment has been successfully deleted.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete comment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingComment(false);
      setDeleteCommentDialogOpen(false);
      setDeleteCommentId(null);
      setDeleteReviewId(null);
    }
  };
  
  // Handle edit comment
  const handleEditComment = async () => {
    if (!isAuthenticated || !editingCommentId || !editedCommentContent.trim()) return;
    
    // Find which review contains this comment
    let foundReviewId: string | null = null;
    
    for (const review of reviews) {
      // Check in top-level comments
      if (review.comments.some(c => c._id === editingCommentId)) {
        foundReviewId = review._id;
        break;
      }
      
      // Check in replies
      for (const comment of review.comments) {
        if (comment.replies && comment.replies.some(r => r._id === editingCommentId)) {
          foundReviewId = review._id;
          break;
        }
      }
      
      if (foundReviewId) break;
    }
    
    if (!foundReviewId) {
      toast({
        title: "Error",
        description: "Could not determine which review this comment belongs to.",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditingComment(true);
    try {
      const response = await fetch(`/api/reviews/${foundReviewId}/comment/${editingCommentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editedCommentContent
        }),
        credentials: "include",
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        // Update the comments in state
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review._id !== foundReviewId) return review;
            
            // Check if it's a top-level comment
            const topLevelIndex = review.comments.findIndex(c => c._id === editingCommentId);
            
            if (topLevelIndex !== -1) {
              // Update top-level comment
              const updatedComments = [...review.comments];
              updatedComments[topLevelIndex] = {
                ...updatedComments[topLevelIndex],
                content: editedCommentContent,
                updatedAt: new Date().toISOString()
              };
              return {
                ...review,
                comments: updatedComments
              };
            } else {
              // Update in replies
              return {
                ...review,
                comments: review.comments.map(comment => {
                  if (!comment.replies) return comment;
                  
                  const replyIndex = comment.replies.findIndex(reply => reply._id === editingCommentId);
                  if (replyIndex === -1) return comment;
                  
                  const updatedReplies = [...comment.replies];
                  updatedReplies[replyIndex] = {
                    ...updatedReplies[replyIndex],
                    content: editedCommentContent,
                    updatedAt: new Date().toISOString()
                  };
                  
                  return {
                    ...comment,
                    replies: updatedReplies
                  };
                })
              };
            }
          })
        );
        
        toast({
          title: "Comment updated",
          description: "Your comment has been successfully updated.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update comment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditingComment(false);
      setEditingCommentId(null);
      setEditedCommentContent("");
    }
  };

  // Helper function to check if a user has liked a review
  const hasUserLiked = (likes: string[], userId: any): boolean => {
    if (!userId) return false;
    // Convert to string to ensure compatibility
    const userIdStr = String(userId);
    return likes.includes(userIdStr);
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="space-y-6">
          <div className="relative w-full aspect-[21/9] overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto grid gap-6 md:grid-cols-[300px_1fr] lg:gap-12">
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
              <Skeleton className="h-32 w-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error Loading Movie</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/search">Back to Search</Link>
        </Button>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find the movie you're looking for.</p>
        <Button asChild>
          <Link href="/search">Back to Search</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
    <div className="w-full">
      <div className="space-y-6">
        {/* Backdrop */}
        <div className="relative w-full aspect-[21/9] overflow-hidden">
          <Image
            src={movie.backdrop || movie.poster || "/placeholder.svg?height=400&width=1000"}
            alt={movie.title || `Movie backdrop image`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Movie Details */}
        <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto grid gap-6 md:grid-cols-[300px_1fr] lg:gap-12">
          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
            <Image
              src={movie.poster || `/placeholder.svg?height=450&width=300&text=${encodeURIComponent(movie.title)}`}
              alt={movie.title || "Movie poster"}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-2">
              {movie.title} <span className="text-muted-foreground">({movie.year})</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Local Community Rating */}
              {movie.localRating && movie.localRating.count > 0 && (
                <Badge className="flex items-center gap-1 bg-primary text-primary-foreground">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {movie.localRating.average}/5 · {movie.localRating.count} {movie.localRating.count === 1 ? 'review' : 'reviews'}
                </Badge>
              )}
              
              {/* External Rating (shown when available, but less prominently) */}
              {movie.rating && movie.rating !== "N/A" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  IMDB {movie.rating}
                </Badge>
              )}
              
              {movie.runtime && movie.runtime !== "Unknown" && <Badge variant="outline">{movie.runtime}</Badge>}
              {movie.contentRating && movie.contentRating !== "Not Rated" && (
                <Badge variant="outline">{movie.contentRating}</Badge>
              )}
              {movie.genres &&
                movie.genres.map((genre: string) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                className="gap-1"
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary-foreground" : ""}`} />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
              <Button
                variant={isWatchlist ? "default" : "outline"}
                size="sm"
                className="gap-1"
                onClick={handleToggleWatchlist}
              >
                <Bookmark className="h-4 w-4" />
                {isWatchlist ? "In Watchlist" : "Watchlist"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Share className="h-4 w-4" />
                Share
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() =>
                    router.push(
                      `/reviews/new?movieId=${movieId}&title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(movie.poster || "")}`,
                    )
                  }
                >
                  <Edit className="h-4 w-4" />
                  Write Review
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-1">Overview</h2>
                <p className="text-muted-foreground">{movie.description || "No description available."}</p>
              </div>

              {movie.director && movie.director !== "Unknown" && (
                <div>
                  <h2 className="font-semibold mb-1">Director</h2>
                  <p className="text-muted-foreground">{movie.director}</p>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-1">Cast</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.map((actor: string) => (
                      <Badge key={actor} variant="secondary">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional movie info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {movie.language && (
                  <div>
                    <h2 className="font-semibold mb-1">Language</h2>
                    <p className="text-muted-foreground">{movie.language}</p>
                  </div>
                )}

                {movie.releaseDate && (
                  <div>
                    <h2 className="font-semibold mb-1">Release Date</h2>
                    <p className="text-muted-foreground">{new Date(movie.releaseDate).toLocaleDateString()}</p>
                  </div>
                )}

                {movie.budget && (
                  <div>
                    <h2 className="font-semibold mb-1">Budget</h2>
                    <p className="text-muted-foreground">${movie.budget.toLocaleString()}</p>
                  </div>
                )}

                {movie.grossWorldwide && (
                  <div>
                    <h2 className="font-semibold mb-1">Box Office</h2>
                    <p className="text-muted-foreground">${movie.grossWorldwide.toLocaleString()}</p>
                  </div>
                )}

                {movie.numVotes > 0 && (
                  <div>
                    <h2 className="font-semibold mb-1">Votes</h2>
                    <p className="text-muted-foreground">{movie.numVotes.toLocaleString()}</p>
                  </div>
                )}

                {movie.url && (
                  <div>
                    <h2 className="font-semibold mb-1">IMDb</h2>
                    <a 
                      href={movie.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      View on IMDb
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Reviews Section */}
        <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <Tabs defaultValue="reviews">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Reviews & Discussions</h2>
              <TabsList>
                <TabsTrigger value="reviews" className="gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="discussions" className="gap-1">
                  <Clock className="h-4 w-4" />
                  Discussions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="reviews" className="space-y-6">
              {/* Write Review CTA */}
              {isAuthenticated ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                        <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-muted-foreground h-auto py-3"
                        onClick={() =>
                          router.push(
                            `/reviews/new?movieId=${movieId}&title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(movie.poster || "")}`,
                          )
                        }
                      >
                        Write a review for {movie.title}...
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="text-center mb-4">You need to be logged in to write a review.</p>
                    <Button asChild>
                      <Link href="/login">Log In</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.user?.avatar || "/placeholder.svg"} alt={review.user?.name || "Reviewer"} />
                            <AvatarFallback>{review.user?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <Link href={`/profile/${review.user?.username}`} className="font-medium hover:underline">
                                  {review.user?.name}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    {Array(5)
                                      .fill(0)
                                      .map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${i < Math.floor(review.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                                        />
                                      ))}
                                    <span className="ml-1">{review.rating}</span>
                                  </div>
                                  <span>•</span>
                                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleLikeReview(review._id, hasUserLiked(review.likes, user?._id))}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${hasUserLiked(review.likes, user?._id) ? "fill-primary text-primary" : ""}`}
                                  />
                                  {review.likes.length}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleToggleComments(review._id)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  {review.comments?.length || 0}
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm">{review.content}</p>
                          </div>
                        </div>
                        
                        {/* Comments Section */}
                        {expandedReview === review._id && (
                          <div className="mt-6 px-4 py-3 bg-muted/10 border-t">
                            {/* Comment Form */}
                            {isAuthenticated && !replyingTo && (
                              <form onSubmit={(e) => handleSubmitComment(e, review._id)} className="flex gap-2 mb-4">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User avatar"} />
                                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="relative flex-1">
                                  <Textarea 
                                    placeholder="Write a comment..." 
                                    className="min-h-0 h-9 py-2 resize-none pr-8"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                  />
                                  <Button 
                                    type="submit" 
                                    size="sm" 
                                    variant="ghost" 
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                    disabled={!commentText.trim() || isSubmittingComment}
                                  >
                                    <Send className={`h-4 w-4 ${commentText.trim() ? 'text-primary' : ''}`} />
                                    <span className="sr-only">Send</span>
                                  </Button>
                                </div>
                              </form>
                            )}

                            {/* Comments List */}
                            <div className="space-y-4 mt-2">
                              {review.comments && review.comments.length > 0 ? (
                                review.comments.map((comment) => (
                                  <div key={comment._id} className="space-y-3">
                                    {/* Main Comment */}
                                    <div className="flex gap-2">
                                      <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name || "Commenter"} />
                                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        {editingCommentId === comment._id ? (
                                          // Edit comment form
                                          <div className="space-y-2">
                                            <Textarea 
                                              ref={editCommentTextareaRef}
                                              value={editedCommentContent}
                                              onChange={(e) => setEditedCommentContent(e.target.value)}
                                              className="min-h-[60px] text-sm"
                                            />
                                            <div className="flex justify-end gap-2">
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={cancelEditingComment}
                                              >
                                                Cancel
                                              </Button>
                                              <Button 
                                                size="sm" 
                                                onClick={handleEditComment}
                                                disabled={!editedCommentContent.trim() || isEditingComment}
                                              >
                                                {isEditingComment ? (
                                                  <>
                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                    Saving...
                                                  </>
                                                ) : (
                                                  "Save"
                                                )}
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          // Comment display
                                          <>
                                            <div className="rounded-2xl bg-muted p-3">
                                              <div className="flex justify-between items-start">
                                                <Link
                                                  href={`/profile/${comment.user.username}`}
                                                  className="font-medium hover:underline"
                                                >
                                                  {comment.user.name}
                                                </Link>
                                                
                                                {/* Comment actions dropdown - only for comment author or post author */}
                                                {isAuthenticated && (user?._id === comment.user._id || user?._id === review.user._id) && (
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                                                        <MoreVertical className="h-3 w-3" />
                                                        <span className="sr-only">Comment actions</span>
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                      {user?._id === comment.user._id && (
                                                        <DropdownMenuItem onClick={() => startEditingComment(comment._id, comment.content)}>
                                                          <Edit className="mr-2 h-3.5 w-3.5" />
                                                          Edit
                                                        </DropdownMenuItem>
                                                      )}
                                                      <DropdownMenuItem 
                                                        onClick={() => openDeleteCommentDialog(review._id, comment._id)}
                                                        className="text-destructive focus:text-destructive"
                                                      >
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                        Delete
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                )}
                                              </div>
                                              <p className="text-sm mt-1">
                                                {renderCommentWithMentions(comment.content)}
                                              </p>
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                {comment.updatedAt && comment.updatedAt !== comment.createdAt && 
                                                  " (edited)"}
                                              </p>
                                            </div>

                                            {/* Comment Actions */}
                                            <div className="flex gap-4 mt-1 px-3">
                                              <button 
                                                className="text-xs font-medium hover:underline"
                                                onClick={() => handleReply(review._id, comment._id, comment.user.username)}
                                              >
                                                Reply
                                              </button>
                                            </div>
                                          </>
                                        )}

                                        {/* Reply Form */}
                                        {replyingTo?.reviewId === review._id && replyingTo?.commentId === comment._id && isAuthenticated && (
                                          <form 
                                            onSubmit={(e) => handleSubmitComment(e, review._id, comment._id)} 
                                            className="flex gap-2 mt-2 pl-2"
                                          >
                                            <Avatar className="h-7 w-7 shrink-0">
                                              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User avatar"} />
                                              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="relative flex-1">
                                              <Textarea 
                                                ref={replyTextareaRef}
                                                placeholder={`Reply to ${comment.user.name}...`} 
                                                className="min-h-0 h-8 py-1.5 text-sm resize-none pr-8"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                autoFocus
                                              />
                                              <Button 
                                                type="submit" 
                                                size="sm" 
                                                variant="ghost" 
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                                disabled={!commentText.trim() || isSubmittingComment}
                                              >
                                                <Send className={`h-3 w-3 ${commentText.trim() ? 'text-primary' : ''}`} />
                                                <span className="sr-only">Send Reply</span>
                                              </Button>
                                            </div>
                                          </form>
                                        )}

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                          <>
                                            <div className="flex items-center gap-2 mt-1 px-3">
                                              <button 
                                                className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1"
                                                onClick={() => toggleReplies(comment._id)}
                                              >
                                                {expandedReplies[comment._id] ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                              </button>
                                            </div>
                                            
                                            {expandedReplies[comment._id] && (
                                              <div className="pl-4 mt-2 space-y-3 border-l-2 border-muted ml-2">
                                                {comment.replies.map((reply) => (
                                                  <div key={reply._id} className="flex gap-2">
                                                    <Avatar className="h-7 w-7 shrink-0">
                                                      <AvatarImage src={reply.user.avatar || "/placeholder.svg"} alt={reply.user.name || "User who replied"} />
                                                      <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                      {editingCommentId === reply._id ? (
                                                        // Edit reply form
                                                        <div className="space-y-2">
                                                          <Textarea 
                                                            ref={editCommentTextareaRef}
                                                            value={editedCommentContent}
                                                            onChange={(e) => setEditedCommentContent(e.target.value)}
                                                            className="min-h-[60px] text-sm"
                                                          />
                                                          <div className="flex justify-end gap-2">
                                                            <Button 
                                                              variant="outline" 
                                                              size="sm" 
                                                              onClick={cancelEditingComment}
                                                            >
                                                              Cancel
                                                            </Button>
                                                            <Button 
                                                              size="sm" 
                                                              onClick={handleEditComment}
                                                              disabled={!editedCommentContent.trim() || isEditingComment}
                                                            >
                                                              {isEditingComment ? (
                                                                <>
                                                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                  Saving...
                                                                </>
                                                              ) : (
                                                                "Save"
                                                              )}
                                                            </Button>
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        // Reply display
                                                        <>
                                                          <div className="rounded-xl bg-muted p-2">
                                                            <div className="flex justify-between items-start">
                                                              <Link
                                                                href={`/profile/${reply.user.username}`}
                                                                className="font-medium text-sm hover:underline"
                                                              >
                                                                {reply.user.name}
                                                              </Link>
                                                              
                                                              {/* Reply actions dropdown - only for reply author or review author */}
                                                              {isAuthenticated && (user?._id === reply.user._id || user?._id === review.user._id) && (
                                                                <DropdownMenu>
                                                                  <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-5 w-5 -mt-1 -mr-1">
                                                                      <MoreVertical className="h-3 w-3" />
                                                                      <span className="sr-only">Reply actions</span>
                                                                    </Button>
                                                                  </DropdownMenuTrigger>
                                                                  <DropdownMenuContent align="end" className="w-[160px]">
                                                                    {user?._id === reply.user._id && (
                                                                      <DropdownMenuItem onClick={() => startEditingComment(reply._id, reply.content)}>
                                                                        <Edit className="mr-2 h-3.5 w-3.5" />
                                                                        Edit
                                                                      </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem 
                                                                      onClick={() => openDeleteCommentDialog(review._id, reply._id)}
                                                                      className="text-destructive focus:text-destructive"
                                                                    >
                                                                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                      Delete
                                                                    </DropdownMenuItem>
                                                                  </DropdownMenuContent>
                                                                </DropdownMenu>
                                                              )}
                                                            </div>
                                                            <p className="text-sm">
                                                              {renderCommentWithMentions(reply.content)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                              {reply.updatedAt && reply.updatedAt !== reply.createdAt && 
                                                                " (edited)"}
                                                            </p>
                                                          </div>
                                                          <div className="flex gap-4 mt-0.5 px-2">
                                                            <button 
                                                              className="text-xs font-medium hover:underline"
                                                              onClick={() => handleReply(review._id, comment._id, comment.user.username)}
                                                            >
                                                              Reply
                                                            </button>
                                                          </div>
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-sm text-muted-foreground py-3">
                                  No comments yet. Be the first to comment!
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground mb-6">Be the first to review {movie.title}</p>
                  <Button
                    onClick={() =>
                      isAuthenticated
                        ? router.push(
                            `/reviews/new?movieId=${movieId}&title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(movie.poster || "")}`,
                          )
                        : router.push("/login")
                    }
                  >
                    Write a Review
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="discussions" className="py-4">
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No discussions yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a discussion about {movie.title}</p>
                <Button asChild>
                  <Link href={isAuthenticated ? `/discussions/new?movie=${movie.id}` : "/login"}>Start Discussion</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    
    {/* Delete comment confirmation dialog */}
    <AlertDialog open={deleteCommentDialogOpen} onOpenChange={setDeleteCommentDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete comment?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your comment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteComment}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeletingComment}
          >
            {isDeletingComment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

