"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { SendIcon, Loader2, Mail, MapPin, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }
      
      // Success
      setSubmitted(true)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      })
      
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll respond as soon as possible.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error submitting contact form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while sending your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header section with gradient background */}
        <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Get In Touch</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or just want to say hello? We'd love to hear from you. 
            Fill out the form below and our team will get back to you as soon as possible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
              <CardContent className="p-0">
                <div className="bg-primary/5 p-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-medium">Email Us</h3>
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground mb-2">For general inquiries and support:</p>
                  <a href="mailto:support@reelcritic.com" className="text-primary font-medium hover:underline">
                    support@reelcritic.com
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
              <CardContent className="p-0">
                <div className="bg-primary/5 p-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-medium">Location</h3>
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground mb-2">Headquarters:</p>
                  <p className="font-medium">San Francisco, CA</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    123 Cinema Avenue<br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
              <CardContent className="p-0">
                <div className="bg-primary/5 p-4 flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-medium">Connect</h3>
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground mb-3">Follow us on social media:</p>
                  <div className="flex space-x-4">
                    <a 
                      href="#" 
                      className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                      aria-label="Twitter"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-1-4.8 4-8.9 8-5 1.6-1 3-2.2 4-4"/>
                      </svg>
                    </a>
                    <a 
                      href="#" 
                      className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                      aria-label="Facebook"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    </a>
                    <a 
                      href="#" 
                      className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                      aria-label="Instagram"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-primary/5 p-5 rounded-lg mt-8">
              <h3 className="font-medium mb-3">Help Resources</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                  <a href="/about" className="text-primary hover:underline">About ReelCritic</a>
                </li>
                <li className="flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                  <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                </li>
                <li className="flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                </li>
                <li className="flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                  <a href="/faq" className="text-primary hover:underline">Frequently Asked Questions</a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="md:col-span-2">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                {submitted ? (
                  <div className="text-center py-12 px-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">Thank You!</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Your message has been successfully sent. We've received your inquiry and will respond as soon as possible.
                    </p>
                    <Button 
                      onClick={() => setSubmitted(false)}
                      className="px-6"
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-5">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Full Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="h-10"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email Address <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john.doe@example.com"
                            className="h-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="How can we help you?"
                          className="h-10"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">
                          Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Please provide details about your inquiry..."
                          className="min-h-[120px] resize-none"
                          required
                        />
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto px-8" 
                          disabled={isSubmitting}
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <SendIcon className="mr-2 h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 