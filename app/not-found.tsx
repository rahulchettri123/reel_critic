import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-12 text-center">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404: Page Not Found</h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed mx-auto">
            We couldn&apos;t find the page you were looking for. 
            It might have been moved or doesn&apos;t exist.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Button asChild variant="default">
            <Link href="/">
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">
              Discover Movies
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 