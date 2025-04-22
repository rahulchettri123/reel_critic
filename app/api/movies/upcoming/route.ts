import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import axios from "axios"
import { getCollection } from "@/lib/mongodb"

// Cache duration in seconds
const CACHE_MAX_AGE = 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const forceRefresh = searchParams.get("forceRefresh") === "true"
    
    console.log(`Requested ${limit} upcoming movies${forceRefresh ? " with force refresh" : ""}`)

    // Initialize response headers with caching
    const headers = {
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
      'Content-Type': 'application/json',
    };

    // Check if we have API credentials
    const API_KEY = process.env.RAPIDAPI_KEY
    const API_HOST = process.env.RAPIDAPI_HOST
    
    console.log(`API Key available: ${Boolean(API_KEY && API_KEY !== 'your_rapidapi_key_here')}`)
    console.log(`API Host available: ${Boolean(API_HOST)}`)
    
    // First, try to get from our database (unless force refresh)
    if (!forceRefresh) {
      try {
        const moviesCollection = await getCollection("movies")
        
        // Get movies with release dates in the future
        const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
        
        // Efficient query with projection to select only needed fields
        const upcomingMovies = await moviesCollection.find(
          { 
            isUpcoming: true,
            releaseDate: { 
              $exists: true,
              $gte: currentDate // Only include movies with release date >= today
            }
          },
          { 
            projection: {
              id: 1,
              title: 1,
              poster: 1,
              backdrop: 1,
              year: 1,
              genres: 1,
              releaseDate: 1,
              rating: 1,
              runtime: 1,
              description: 1,
              contentRating: 1,
              type: 1,
              url: 1,
              director: 1,
              cast: 1,
              interests: 1,
              countriesOfOrigin: 1,
              externalLinks: 1,
              spokenLanguages: 1,
              filmingLocations: 1,
              budget: 1,
              startYear: 1,
              endYear: 1,
              language: 1,
              _id: 0 // Exclude _id to reduce payload size
            }
          }
        )
        .sort({ releaseDate: 1 }) // Sort by release date ascending (soonest first)
        .limit(limit)
        .toArray()
        
        if (upcomingMovies.length > 0) {
          console.log(`✅ Returning ${upcomingMovies.length} upcoming movies from database`)
          return NextResponse.json(
            { movies: upcomingMovies }, 
            { headers }
          )
        } else {
          console.log("⚠️ No upcoming movies in database, will fetch from API")
        }
      } catch (dbError) {
        console.error("❌ Database error:", dbError)
      }
    }
    
    // If we get here, we need to fetch from API
    if (API_KEY && API_HOST && API_KEY !== 'your_rapidapi_key_here') {
      console.log("🚀 Fetching upcoming movies from RapidAPI...")
      
      try {
        const response = await axios.request({
          method: 'GET',
          url: 'https://imdb236.p.rapidapi.com/imdb/upcoming-releases',
          params: {
            countryCode: 'US',
            type: 'MOVIE'
          },
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
          },
          timeout: 5000 // Set a timeout to avoid hanging requests
        })
        
        if (response.data && Array.isArray(response.data)) {
          const upcomingReleases = response.data
          
          // Transform the API response to our format
          let allMovies: any[] = []
          const bulkOps: any[] = [] // For bulk database operations
          
          // Process each release date
          for (const release of upcomingReleases) {
            if (release.titles && Array.isArray(release.titles)) {
              // Process each movie in this release date
              for (const movie of release.titles) {
                // Debug the movie data structure
                console.log(`Processing movie: ${JSON.stringify(movie.id)} - Raw title data:`, {
                  title: movie.title,
                  primaryTitle: movie.primaryTitle,
                  originalTitle: movie.originalTitle
                });
                
                // Ensure we're properly extracting title - look at all possible fields
                let title = movie.title || movie.primaryTitle || movie.originalTitle || null;
                
                // If title is still null, search anywhere we can find a title
                if (!title && movie.id) {
                  // Debug output to help diagnose title extraction issues
                  console.log(`⚠️ Title extraction failed for movie ID: ${movie.id}, raw object:`, JSON.stringify(movie));
                  
                  // Try to build a fallback title from any available information
                  if (movie.url && movie.url.includes('/title/')) {
                    const titleMatch = movie.url.match(/\/title\/([^/]+)/);
                    title = titleMatch ? `Movie ID: ${titleMatch[1]}` : `Movie ID: ${movie.id}`;
                  } else {
                    title = `Movie ID: ${movie.id}`;
                  }
                  
                  console.warn(`No title found for movie ID: ${movie.id}, using ID as placeholder`);
                }
                
                // Get a safe title for description
                const safeTitle = title || "this movie";
                
                // Convert to our movie format - align with database structure
                const movieData = {
                  id: movie.id,
                  title: title,
                  poster: movie.primaryImage || null,
                  backdrop: movie.primaryImage || null,
                  year: movie.startYear?.toString() || "Upcoming",
                  rating: movie.averageRating?.toString() || "N/A",
                  runtime: movie.runtimeMinutes ? `${movie.runtimeMinutes}m` : null,
                  director: "Unknown", // Default value as API doesn't provide this directly
                  cast: [], // Initialize as empty array
                  genres: Array.isArray(movie.genres) ? movie.genres : [],
                  description: movie.description || `Upcoming release: ${safeTitle}`,
                  contentRating: movie.contentRating || "Not Rated",
                  type: movie.type || "movie",
                  url: movie.url || null,
                  releaseDate: release.date || null,
                  startYear: movie.startYear || null,
                  endYear: movie.endYear || null,
                  language: null,
                  interests: Array.isArray(movie.interests) ? movie.interests : [],
                  countriesOfOrigin: Array.isArray(movie.countriesOfOrigin) ? movie.countriesOfOrigin : [],
                  externalLinks: movie.externalLinks || null,
                  spokenLanguages: Array.isArray(movie.spokenLanguages) ? movie.spokenLanguages : [],
                  filmingLocations: Array.isArray(movie.filmingLocations) ? movie.filmingLocations : [],
                  budget: movie.budget || null,
                  grossWorldwide: movie.grossWorldwide || null,
                  isUpcoming: true,
                  views: 0,
                  updatedAt: new Date(),
                  createdAt: new Date()
                }
                
                allMovies.push(movieData)
                
                // Add to bulk operations
                bulkOps.push({
                  updateOne: {
                    filter: { id: movieData.id },
                    update: { $set: movieData },
                    upsert: true
                  }
                })
              }
            }
          }
          
          // Perform bulk database update in background
          if (bulkOps.length > 0) {
            // Don't await this to improve response time
            getCollection("movies").then(collection => {
              collection.bulkWrite(bulkOps)
                .then(result => console.log(`✅ Stored/updated ${result.upsertedCount + result.modifiedCount} movies in MongoDB`))
                .catch(err => console.error("❌ Bulk write error:", err))
            })
          }
          
          // Sort movies by release date
          allMovies.sort((a, b) => {
            // If either movie has no release date, put it at the end
            if (!a.releaseDate) return 1;
            if (!b.releaseDate) return -1;
            // Sort by release date (ascending)
            return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
          });
          
          // Return the movies up to requested limit
          const limitedMovies = allMovies.slice(0, limit)
          
          // Calculate and add local ratings for each movie
          try {
            const reviewsCollection = await getCollection("reviews")
            
            // Get all movie IDs to fetch ratings for
            const movieIds = limitedMovies.map(movie => movie.id)
            
            // Get average ratings for all movies in one aggregation query
            const ratingAggregation = await reviewsCollection.aggregate([
              { $match: { movie: { $in: movieIds } } },
              { 
                $group: { 
                  _id: "$movie", 
                  averageRating: { $avg: "$rating" },
                  reviewCount: { $sum: 1 }
                } 
              }
            ]).toArray()
            
            // Add local ratings to each movie
            const moviesWithRatings = limitedMovies.map(movie => {
              const movieRating = ratingAggregation.find(r => r._id === movie.id)
              
              return {
                ...movie,
                localRating: movieRating ? {
                  average: parseFloat(movieRating.averageRating.toFixed(1)),
                  count: movieRating.reviewCount
                } : null
              }
            })
            
            return NextResponse.json(
              { movies: moviesWithRatings }, 
              { headers }
            )
          } catch (ratingError) {
            console.error("❌ Error calculating local ratings:", ratingError)
            // Continue with movies without ratings if calculation fails
            return NextResponse.json(
              { movies: limitedMovies }, 
              { headers }
            )
          }
        } else {
          console.error("❌ Invalid API response format:", response.data)
          return NextResponse.json(
            { error: "Invalid API response" },
            { status: 500 }
          )
        }
      } catch (apiError: any) {
        console.error("❌ API request error:", apiError.message)
        return NextResponse.json(
          { error: "Failed to fetch upcoming movies" },
          { status: 500 }
        )
      }
    } else {
      console.log("⚠️ API credentials not available, using fallback data")
      
      // Return fallback data
      const fallbackMovies = [
        {
          id: "tt21955520",
          title: "Peter Pan's Neverland Nightmare",
          poster: "https://m.media-amazon.com/images/M/MV5BNGZmNzhkZDAtMzJlZC00OTkxLWE1NWUtZDNjYTVlNjk0ZjNkXkEyXkFqcGc@._V1_.jpg",
          backdrop: "https://m.media-amazon.com/images/M/MV5BNGZmNzhkZDAtMzJlZC00OTkxLWE1NWUtZDNjYTVlNjk0ZjNkXkEyXkFqcGc@._V1_.jpg",
          year: "2025",
          releaseDate: "2025-01-13",
          rating: "N/A",
          runtime: null,
          director: "Unknown",
          genres: ["Adventure", "Fantasy", "Horror"],
          cast: ["Kierston Wareing", "Kit Green", "Chrissie Wunna"],
          description: "Peter Pan returns to Neverland, but this time it's not the paradise he remembers.",
          contentRating: "R",
          type: "movie",
          url: "https://www.imdb.com/title/tt21955520/",
          startYear: 2025,
          endYear: null,
          language: null,
          interests: ["Horror", "Fantasy"],
          countriesOfOrigin: ["US"],
          spokenLanguages: ["en"],
          isUpcoming: true
        },
        {
          id: "tt14260836",
          title: "Better Man",
          poster: "https://m.media-amazon.com/images/M/MV5BYWU3YzU0NTItMGVlYi00YTFmLWE5MmQtNjg4ODQ3ZWYyNjRkXkEyXkFqcGc@._V1_.jpg",
          backdrop: "https://m.media-amazon.com/images/M/MV5BYWU3YzU0NTItMGVlYi00YTFmLWE5MmQtNjg4ODQ3ZWYyNjRkXkEyXkFqcGc@._V1_.jpg",
          year: "2024",
          releaseDate: "2025-01-17",
          rating: "N/A",
          runtime: null,
          director: "Unknown",
          genres: ["Biography", "Fantasy", "Musical"],
          cast: ["Robbie Williams", "Jonno Davies", "Steve Pemberton"],
          description: "A fantastical biopic about British pop icon Robbie Williams.",
          contentRating: "PG-13",
          type: "movie",
          url: "https://www.imdb.com/title/tt14260836/",
          startYear: 2024,
          endYear: null,
          language: null,
          interests: ["Music", "Biography"],
          countriesOfOrigin: ["GB"],
          spokenLanguages: ["en"],
          isUpcoming: true
        },
        {
          id: "tt4216984",
          title: "Wolf Man",
          poster: "https://m.media-amazon.com/images/M/MV5BYmFkYTNhMWUtMjEyNy00MWE0LWJlYTQtMWFmNDUwNmFjMzAxXkEyXkFqcGc@._V1_.jpg",
          backdrop: "https://m.media-amazon.com/images/M/MV5BYmFkYTNhMWUtMjEyNy00MWE0LWJlYTQtMWFmNDUwNmFjMzAxXkEyXkFqcGc@._V1_.jpg",
          year: "2025",
          releaseDate: "2025-02-15",
          rating: "N/A",
          runtime: null,
          director: "Unknown",
          genres: ["Horror"],
          cast: ["Julia Garner", "Christopher Abbott", "Sam Jaeger"],
          description: "A modern horror reimagining of the classic Universal monster.",
          contentRating: "R",
          type: "movie",
          url: "https://www.imdb.com/title/tt4216984/",
          startYear: 2025,
          endYear: null,
          language: null,
          interests: ["Horror", "Monster"],
          countriesOfOrigin: ["US"],
          spokenLanguages: ["en"],
          isUpcoming: true
        }
      ]
      
      // Sort fallback movies by release date
      fallbackMovies.sort((a, b) => {
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      });
      
      // Calculate and add local ratings for fallback movies
      try {
        const reviewsCollection = await getCollection("reviews")
        
        // Get all movie IDs to fetch ratings for
        const movieIds = fallbackMovies.map(movie => movie.id)
        
        // Get average ratings for all movies in one aggregation query
        const ratingAggregation = await reviewsCollection.aggregate([
          { $match: { movie: { $in: movieIds } } },
          { 
            $group: { 
              _id: "$movie", 
              averageRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 }
            } 
          }
        ]).toArray()
        
        // Add local ratings to each movie
        const moviesWithRatings = fallbackMovies.map(movie => {
          const movieRating = ratingAggregation.find(r => r._id === movie.id)
          
          return {
            ...movie,
            localRating: movieRating ? {
              average: parseFloat(movieRating.averageRating.toFixed(1)),
              count: movieRating.reviewCount
            } : null
          }
        })
        
        return NextResponse.json(
          { movies: moviesWithRatings.slice(0, limit) }, 
          { headers }
        )
      } catch (ratingError) {
        console.error("❌ Error calculating local ratings for fallback movies:", ratingError)
        // Continue with movies without ratings if calculation fails
        return NextResponse.json(
          { movies: fallbackMovies.slice(0, limit) }, 
          { headers }
        )
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 