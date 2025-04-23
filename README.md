# ReelCritic - Movie Review Community

ReelCritic is a feature-rich web application built to connect movie enthusiasts, share reviews, and discover films within a thriving community of cinema lovers.

## 🎬 Overview

ReelCritic provides a platform for users to:
- Discover trending and upcoming movies
- Write and share detailed reviews
- Follow other critics with similar tastes
- Track favorite movies and maintain a watchlist
- Engage with a community of film enthusiasts

## ✨ Key Features

### User Authentication and Profiles
- Email/password authentication with JWT tokens
- Customizable user profiles with avatars, bio, and social links
- Follow/unfollow mechanism for connecting with other critics
- User statistics tracking for reviews, followers, and favorites
- AWS S3 integration for secure profile image storage

### Movie Discovery
- Browse trending and upcoming movies
- Search for films with autocomplete suggestions
- Detailed movie information with cast, plot, and ratings
- Responsive movie carousels with touch support for mobile devices

### Social Interaction
- Write, edit, and delete reviews with star ratings
- Comment on reviews and engage in discussions
- Add movies to personal favorites and watchlist
- Community page to discover active reviewers

### UI/UX
- Responsive design for desktop, tablet, and mobile devices
- Dark mode support
- Accessible components with keyboard navigation
- Modern, intuitive interface with smooth transitions

## 🛠️ Technologies Used

- **Frontend**: Next.js 14 (App Router), TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: JWT, bcrypt for password hashing
- **UI Components**: Shadcn UI, Lucide Icons
- **API Integration**: RapidAPI (IMDb API)
- **Image Storage**: AWS S3 for secure profile image uploads
- **Image Optimization**: Next.js Image component
- **Form Handling**: React Hook Form, zod validation
- **Cloud Deployment**: AWS infrastructure

## 🧩 Project Structure

```
reelcritic/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Main application pages
│   └── ...
├── components/           # Reusable React components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── public/               # Static assets
└── ...
```

## Recent Updates

- Enhanced mobile responsiveness across all pages
- Improved user profile with cleaner interface
- Fixed follower and review count statistics
- Improved movie carousel with touch support
- Refined authentication flow and user registration
- Integrated AWS S3 for profile image uploads and storage
- Removed comments section from profile page for cleaner UI

## Performance Optimizations

The application has been optimized for better performance and a lightweight experience:

### Component Optimizations

1. **Feed Posts**
   - Implemented React memo to prevent unnecessary re-renders
   - Lazy loading of comments (only fetch when expanded)
   - Memoized callback functions with useCallback
   - Added image optimization with blur placeholders
   - Improved prop drilling with useCallback for event handlers

2. **Feed Component**
   - Added infinite scroll with Intersection Observer API
   - Optimized data fetching with pagination
   - Implemented proper error handling and retry mechanisms
   - Improved loading states and user feedback
   - Added useMemo for computed values

3. **Movie Carousel**
   - Added image optimization with blur placeholders
   - Throttled resize handlers to prevent excessive calculations
   - Memoized component parts to reduce re-renders

### API Optimizations

1. **Comment API**
   - Implemented MongoDB projections to only fetch required fields
   - Added pagination for comments to reduce payload size
   - Optimized database queries for better performance
   - Improved error handling with detailed status codes

2. **Authentication**
   - Optimized token verification process
   - Reduced number of database calls

### General Improvements

1. **Image Loading**
   - Added lazy loading for images outside the viewport
   - Implemented blur placeholders for better perceived performance
   - Properly sized images using the "sizes" attribute
   - Used Next.js Image optimization

2. **Network Optimization**
   - Reduced payload sizes with specific field selection
   - Implemented pagination to limit data transfer
   - Added better error handling to prevent unnecessary retries

These optimizations significantly reduce the application's load time, memory usage, and network traffic while maintaining all functionality.

## 📞 Contact

Rahul Chettri - [@rahulchettri](https://github.com/rahulchettri123)

Project Link: [https://github.com/rahulchettri123/reel_critic](https://github.com/rahulchettri123/reel_critic) 