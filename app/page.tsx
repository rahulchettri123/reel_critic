"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, Film, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { MovieCarousel } from "@/components/movie-carousel"

// Loading placeholder for carousels
const CarouselSkeleton = () => (
  <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
    <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 rounded-full border-4 border-primary/20 border-t-primary"></div>
  </div>
)

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [popularMovies, setPopularMovies] = useState<any[]>([])
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true)
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now())

  // Fetch popular movies
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPopularMovies = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/movies/popular?limit=18&forceRefresh=false&_=${lastRefreshTime}`, {
          signal,
          cache: 'no-store' // Use no-store to avoid caching
        })
        const data = await response.json()

        if (data.movies && Array.isArray(data.movies)) {
          // Process the movie data to ensure consistent format
          const processedMovies = data.movies.map((movie: any) => {
            const safeTitle = movie.title || movie.primaryTitle || movie.originalTitle || "Unknown Title";
            const posterImage = movie.poster || movie.primaryImage;
            
            return {
              id: movie.id || movie.imdbId || "unknown",
              title: safeTitle,
              poster: posterImage || `/placeholder.svg?height=450&width=300&text=${encodeURIComponent(safeTitle)}`,
              year: movie.year || movie.startYear || movie.releaseDate?.split("-")[0] || "Unknown",
              rating: movie.rating || movie.averageRating || "N/A",
              genres: movie.genres || [],
              localRating: movie.localRating || null,
              // Track if this movie has a real title and image
              hasValidTitle: Boolean(movie.title || movie.primaryTitle || movie.originalTitle),
              hasValidPoster: Boolean(posterImage)
            }
          })
          
          // Filter out movies without proper titles or images
          const filteredMovies = processedMovies.filter((movie: any) => movie.hasValidTitle && movie.hasValidPoster);
          
          console.log(`Fetched ${processedMovies.length} trending movies, filtered out ${processedMovies.length - filteredMovies.length} missing title/image`)
          setPopularMovies(filteredMovies)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error("Error fetching popular movies:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch upcoming movies
    const fetchUpcomingMovies = async () => {
      setIsLoadingUpcoming(true)
      try {
        const response = await fetch(`/api/movies/upcoming?limit=18&forceRefresh=false&_=${lastRefreshTime}`, {
          signal,
          cache: 'no-store' // Use no-store to avoid caching
        })
        const data = await response.json()

        if (data.movies && Array.isArray(data.movies)) {
          console.log(`Fetched ${data.movies.length} upcoming movies for carousel`)
          // Process the movie data and convert to the right format
          const processedMovies = data.movies.map((movie: any) => {
            // Ensure we have a title, even if all source fields are null
            const safeTitle = movie.title || 
                            movie.primaryTitle || 
                            movie.originalTitle || 
                            (movie.id ? `Movie ID: ${movie.id}` : "Unknown Movie");
            
            const posterImage = movie.poster || movie.primaryImage;
            
            return {
              id: movie.id || movie.imdbId || "unknown",
              title: safeTitle,
              poster: posterImage || `/placeholder.svg?height=450&width=300&text=${encodeURIComponent(safeTitle)}`,
              year: movie.year || movie.startYear || movie.releaseDate?.split("-")[0] || "Unknown",
              rating: movie.rating || movie.averageRating || "N/A",
              genres: movie.genres || [],
              releaseDate: movie.releaseDate,
              localRating: movie.localRating || null,
              // Track if this movie has a real title and image
              hasValidTitle: Boolean(movie.title || movie.primaryTitle || movie.originalTitle),
              hasValidPoster: Boolean(posterImage)
            };
          });
          
          // Filter out movies without proper titles or images
          const filteredMovies = processedMovies.filter((movie: any) => movie.hasValidTitle && movie.hasValidPoster);
          
          console.log(`Filtered out ${processedMovies.length - filteredMovies.length} movies without titles or images`);
          
          // Sort movies by release date (soonest first)
          const sortedMovies = filteredMovies.sort((a: any, b: any) => {
            // If either movie has no release date, put it at the end
            if (!a.releaseDate) return 1;
            if (!b.releaseDate) return -1;
            // Sort by release date (ascending)
            return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
          });
          
          setUpcomingMovies(sortedMovies);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error("Error fetching upcoming movies:", error)
        }
      } finally {
        setIsLoadingUpcoming(false)
      }
    }

    // Execute fetches in parallel for better performance
    Promise.all([fetchPopularMovies(), fetchUpcomingMovies()]);

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [lastRefreshTime])

  // Function to refresh data - can be called after a user adds a review
  const refreshMovies = () => {
    setLastRefreshTime(Date.now());
  }

  // Listen for the custom event that's fired after a review is added
  useEffect(() => {
    const handleReviewAdded = () => {
      refreshMovies();
    };

    window.addEventListener('reviewAdded', handleReviewAdded);
    
    // Check for recently added reviews on page load
    const checkRecentReviews = async () => {
      const lastVisit = localStorage.getItem('lastHomeVisit');
      const now = new Date().toISOString();
      
      if (!lastVisit || (new Date(now).getTime() - new Date(lastVisit).getTime() > 60000)) {
        // If it's been more than a minute since last visit, refresh movies
        refreshMovies();
      }
      
      localStorage.setItem('lastHomeVisit', now);
    };
    
    checkRecentReviews();
    
    return () => {
      window.removeEventListener('reviewAdded', handleReviewAdded);
    };
  }, []);

  return (
    <div className="py-3 md:py-6 px-3 md:px-4 max-w-[1400px] mx-auto">
      {/* Hero Section */}
      <section className="mb-6 md:mb-10">
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Discover, Review, Connect with Fellow Movie Critics
            </h1>
            <p className="text-muted-foreground md:text-xl">
              Join our community of film enthusiasts to share your thoughts, discover new movies, and connect with
              like-minded critics.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link href="/critics">Visit Critics Feed</Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild variant="outline" size="lg">
                  <Link href="/login?register=true">Join Community</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-xl border p-6 bg-card shadow-sm space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Project Repository</h2>
              <Link 
                href="https://github.com/rahulchettri123/reel_critic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                github.com/rahulchettri123/reel_critic
              </Link>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Team Members</h2>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  RC
                </div>
                <div>
                  <p className="font-medium">Rahul Chettri</p>
                  <p className="text-sm text-muted-foreground">Project Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Movies Carousel */}
      <section className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Coming Soon</h2>
        </div>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
          Be the first to know about upcoming releases
        </p>
        {isLoadingUpcoming ? (
          <CarouselSkeleton />
        ) : (
          <MovieCarousel 
            title="" 
            movies={upcomingMovies} 
            showBadges={true}
            itemsPerView={6}
          />
        )}
      </section>

      {/* Trending Movies Carousel */}
      <section className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Trending Now</h2>
        </div>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
          The most popular movies everyone is talking about
        </p>
        {isLoading ? (
          <CarouselSkeleton />
        ) : (
          <MovieCarousel 
            title="" 
            movies={popularMovies} 
            showBadges={true}
            itemsPerView={6}
          />
        )}
      </section>

      {/* CTA Section - hidden on smaller screens for better focus on movies */}
      <section className="hidden md:block rounded-xl bg-muted p-4 md:p-6">
        <div className="flex flex-col items-center text-center">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Join Our Community of Movie Critics</h2>
            <p className="text-muted-foreground">
              Create an account to share your reviews, follow other critics, and build your reputation in the film
              community.
            </p>
            {!isAuthenticated ? (
              <div className="space-x-3">
                <Button asChild size="lg">
                  <Link href="/login?register=true">Sign Up Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/community">Browse Community</Link>
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="lg">
                <Link href="/community">Explore Community</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

