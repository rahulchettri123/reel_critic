"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Film, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Movie {
  id: string
  title: string
  poster: string | null
  year?: string
  rating?: string
  releaseDate?: string
  genres?: string[]
  localRating?: {
    average: number
    count: number
  }
}

interface MovieCarouselProps {
  title: string
  movies: Movie[]
  className?: string
  autoScroll?: boolean
  showBadges?: boolean
  itemsPerView?: number
}

export function MovieCarousel({
  title,
  movies,
  className,
  autoScroll = false,
  showBadges = true,
  itemsPerView = 6, // Default to 6 items per view
}: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)
  const [isTouching, setIsTouching] = useState(false)
  const [touchDelta, setTouchDelta] = useState(0)
  
  // Responsive items per view based on screen size
  const [responsiveItemsPerView, setResponsiveItemsPerView] = useState(itemsPerView)
  
  useEffect(() => {
    const updateItemsPerView = () => {
      // For mobile devices like iPhone, show fewer items
      if (window.innerWidth < 640) {
        setResponsiveItemsPerView(2); // Show only 2 items on small screens
      } else if (window.innerWidth < 768) {
        setResponsiveItemsPerView(3); // Show 3 items on medium screens
      } else if (window.innerWidth < 1024) {
        setResponsiveItemsPerView(4); // Show 4 items on large screens
      } else {
        setResponsiveItemsPerView(itemsPerView); // Use the prop value for larger screens
      }
    };
    
    // Initial update
    updateItemsPerView();
    
    // Update on resize
    window.addEventListener('resize', updateItemsPerView);
    
    return () => {
      window.removeEventListener('resize', updateItemsPerView);
    };
  }, [itemsPerView]);
  
  const totalPages = Math.ceil(movies.length / responsiveItemsPerView);

  const checkScrollButtons = () => {
    setCanScrollLeft(currentPage > 0)
    setCanScrollRight(currentPage < totalPages - 1)
  }

  useEffect(() => {
    checkScrollButtons()
    // Reset to first page when movies change
    setCurrentPage(0)
  }, [movies, totalPages, responsiveItemsPerView])

  useEffect(() => {
    checkScrollButtons()
  }, [currentPage, totalPages])

  // Set up auto-scroll if enabled
  useEffect(() => {
    if (autoScroll && totalPages > 1) {
      const interval = setInterval(() => {
        setCurrentPage((prevPage) => {
          const nextPage = (prevPage + 1) % totalPages;
          return nextPage;
        });
      }, 5000); // Auto-scroll every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoScroll, totalPages]);

  const scroll = (direction: "left" | "right") => {
    if (direction === "left" && currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1)
    } else if (direction === "right" && currentPage < totalPages - 1) {
      setCurrentPage(prevPage => prevPage + 1)
    }
  }

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setIsTouching(true)
    setTouchDelta(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching) return
    
    const touchCurrentX = e.touches[0].clientX
    const diff = touchStartX - touchCurrentX
    setTouchDelta(diff)
    
    // Prevent default to avoid page scrolling while swiping
    if (Math.abs(diff) > 5) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouching) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX
    
    // If swipe distance is significant enough (40px)
    if (Math.abs(diff) > 40) {
      if (diff > 0 && canScrollRight) {
        // Swiped left, go right
        scroll("right")
      } else if (diff < 0 && canScrollLeft) {
        // Swiped right, go left
        scroll("left")
      }
    }
    
    setIsTouching(false)
    setTouchDelta(0)
  }

  // Format release date to "Coming MMM DD, YYYY"
  const formatReleaseDate = (dateString?: string) => {
    if (!dateString) return null
    
    try {
      const date = new Date(dateString)
      return `Coming ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`
    } catch (e) {
      return null
    }
  }

  // Calculate the transform style for smooth sliding
  const getTransformStyle = () => {
    // Add a small drag effect during touch
    const dragOffset = isTouching ? -touchDelta / (carouselRef.current?.offsetWidth || 1000) * 100 : 0;
    
    // Limit the drag offset to not exceed one page
    const limitedDragOffset = Math.max(
      -100 * (1 - currentPage), 
      Math.min(dragOffset, 100 * (totalPages - currentPage - 1))
    );
    
    return {
      transform: `translateX(calc(-${currentPage * 100}% + ${limitedDragOffset}px))`,
      transition: isTouching ? 'none' : 'transform 0.4s ease-out'
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scroll('left');
      } else if (e.key === 'ArrowRight') {
        scroll('right');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canScrollLeft, canScrollRight]);

  return (
    <div className={cn("relative group", className)}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
          {totalPages > 1 && (
            <span className="text-xs md:text-sm text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
          )}
        </div>
        
        <div className="flex gap-1 md:gap-2">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-7 w-7 md:h-8 md:w-8 rounded-full transition-all",
              !canScrollLeft && "opacity-50 cursor-not-allowed",
              "opacity-0 group-hover:opacity-100 focus:opacity-100"
            )}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-7 w-7 md:h-8 md:w-8 rounded-full transition-all",
              !canScrollRight && "opacity-50 cursor-not-allowed",
              "opacity-0 group-hover:opacity-100 focus:opacity-100"
            )}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
      
      {/* Carousel container with touch handlers */}
      <div 
        ref={carouselRef}
        className="overflow-hidden pb-4 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-all"
          style={getTransformStyle()}
        >
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/details/${movie.id}`}
              className="group/card flex-none transition-all hover:scale-105"
              style={{ 
                width: `calc(${100 / responsiveItemsPerView}% - 12px)`,
                marginLeft: '6px',
                marginRight: '6px'
              }}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                {movie.poster ? (
                  <Image
                    src={movie.poster}
                    alt={movie.title || 'Movie poster'}
                    fill
                    sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, 200px"
                    className="object-cover transition-transform group-hover/card:scale-105"
                    priority={currentPage === 0} // Priority load first page
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                
                {/* Release date badge */}
                {movie.releaseDate && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white font-medium">
                      {formatReleaseDate(movie.releaseDate)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <h3 className="font-medium line-clamp-1 group-hover/card:text-primary text-sm md:text-base">
                  {movie.title || "Untitled Movie"}
                </h3>
                
                {showBadges && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {/* Year badge */}
                    {movie.year && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                        {movie.year}
                      </Badge>
                    )}
                    
                    {/* IMDB rating badge */}
                    {movie.rating && (
                      <Badge className="bg-yellow-500 text-[10px] px-1 py-0 h-4 flex items-center gap-0.5">
                        <Star className="h-2 w-2 fill-current" />
                        {movie.rating}
                      </Badge>
                    )}
                    
                    {/* Our site rating badge */}
                    {movie.localRating && movie.localRating.count > 0 && (
                      <Badge className="bg-primary text-[10px] px-1 py-0 h-4 flex items-center gap-0.5">
                        <Star className="h-2 w-2 fill-current" />
                        {movie.localRating.average.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {/* Navigation indicators for mobile */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentPage === index 
                    ? "bg-primary w-4" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Left and right edge navigation buttons for larger screens, always visible on hover */}
      {totalPages > 1 && (
        <>
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-90 transition-opacity",
              !canScrollLeft && "hidden"
            )}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-90 transition-opacity",
              !canScrollRight && "hidden"
            )}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}

