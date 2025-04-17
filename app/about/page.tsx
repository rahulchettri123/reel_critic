import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "About ReelCritic",
  description: "Learn more about ReelCritic, the social platform for movie enthusiasts"
}

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About ReelCritic</h1>
          <p className="text-muted-foreground mt-2">
            Your destination for authentic movie reviews and discussions
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p>
              ReelCritic was founded with a simple mission: to create a space where movie enthusiasts can share their authentic opinions, 
              discover new films, and engage in meaningful discussions about cinema. We believe that every moviegoer's perspective matters, 
              and that the collective wisdom of our community provides a more nuanced and valuable view than traditional critics alone.
            </p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">What We Offer</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Authentic Reviews:</strong> Read and write honest reviews from real movie fans, not just professional critics.
              </li>
              <li>
                <strong>Community Discussions:</strong> Engage in conversations about your favorite films with like-minded enthusiasts.
              </li>
              <li>
                <strong>Personalized Recommendations:</strong> Discover new movies based on your taste and preferences.
              </li>
              <li>
                <strong>Watchlist Management:</strong> Keep track of films you want to watch and ones you've already seen.
              </li>
              <li>
                <strong>Social Features:</strong> Follow other users, share your thoughts, and build your reputation as a trusted reviewer.
              </li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Our Story</h2>
            <p>
              ReelCritic began as a passion project in 2023, born from the frustration of not having a dedicated platform 
              where movie lovers could share their thoughts without the noise of general social media. 
              What started as a small community has grown into a vibrant ecosystem of film enthusiasts from all walks of life.
            </p>
            <p>
              Today, we're proud to host thousands of reviews across all genres and eras of cinema, 
              from the latest blockbusters to obscure indie gems. Our community continues to grow, 
              driven by a shared love of storytelling through film.
            </p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Join Our Community</h2>
            <p>
              Whether you're a casual moviegoer or a devoted cinephile, there's a place for you at ReelCritic. 
              Sign up today to start sharing your thoughts, connecting with other movie lovers, and discovering your next favorite film.
            </p>
            <p>
              We're constantly evolving and improving our platform based on feedback from our users. 
              If you have suggestions or ideas, we'd love to hear from you through our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 