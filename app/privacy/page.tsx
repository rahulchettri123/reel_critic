import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Privacy Policy - ReelCritic",
  description: "How ReelCritic collects, uses, and protects your personal information"
}

export default function PrivacyPage() {
  const lastUpdated = "May 1, 2023"
  
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {lastUpdated}
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-8 text-sm">
          <section>
            <p className="mb-4">
              At ReelCritic, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Collection of Your Information</h2>
            <p className="mb-2">We may collect information about you in a variety of ways. The information we may collect includes:</p>
            
            <h3 className="text-base font-medium mt-4 mb-2">1.1. Personal Data</h3>
            <p className="mb-2">When you register for an account, we collect:</p>
            <ul className="list-disc pl-6 mb-2 space-y-1">
              <li>Email address</li>
              <li>First and last name</li>
              <li>Username</li>
              <li>Password (stored in encrypted form)</li>
              <li>Profile information you choose to provide (bio, profile picture, etc.)</li>
            </ul>
            
            <h3 className="text-base font-medium mt-4 mb-2">1.2. Activity Data</h3>
            <p className="mb-2">When you use our service, we may collect:</p>
            <ul className="list-disc pl-6 mb-2 space-y-1">
              <li>Movies you review, rate, or add to your lists</li>
              <li>Comments and discussions you participate in</li>
              <li>User profiles you follow</li>
              <li>Search queries</li>
              <li>Preferences and settings</li>
            </ul>
            
            <h3 className="text-base font-medium mt-4 mb-2">1.3. Device Data</h3>
            <p className="mb-2">We may collect information about your device, including:</p>
            <ul className="list-disc pl-6 mb-2 space-y-1">
              <li>Device type and model</li>
              <li>Operating system</li>
              <li>Browser type</li>
              <li>IP address</li>
              <li>Cookie data</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Use of Your Information</h2>
            <p className="mb-2">We may use the information we collect about you for various purposes, including:</p>
            <ul className="list-disc pl-6 mb-2 space-y-1">
              <li>Creating and managing your account</li>
              <li>Providing and personalizing our service</li>
              <li>Processing your transactions</li>
              <li>Sending you emails related to your account or service</li>
              <li>Responding to your inquiries and providing customer support</li>
              <li>Improving our service and developing new features</li>
              <li>Analyzing usage patterns and trends</li>
              <li>Protecting the security and integrity of our service</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Disclosure of Your Information</h2>
            <p className="mb-2">We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
            
            <h3 className="text-base font-medium mt-4 mb-2">3.1. By Law or to Protect Rights</h3>
            <p className="mb-2">
              If we believe the release of information is necessary to comply with the law, enforce our site policies, 
              or protect our or others' rights, property, or safety.
            </p>
            
            <h3 className="text-base font-medium mt-4 mb-2">3.2. Third-Party Service Providers</h3>
            <p className="mb-2">
              We may share your information with third parties that perform services for us or on our behalf, 
              including payment processing, data analysis, email delivery, hosting services, and customer service.
            </p>
            
            <h3 className="text-base font-medium mt-4 mb-2">3.3. Public Information</h3>
            <p className="mb-2">
              Your reviews, ratings, comments, and profile information (excluding your email address and other private details) 
              are publicly visible to other users. Please be mindful of the information you choose to share.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Security of Your Information</h2>
            <p className="mb-2">
              We use administrative, technical, and physical security measures to protect your personal information. 
              While we have taken reasonable steps to secure the information you provide to us, please be aware that no security measures are perfect or impenetrable, 
              and we cannot guarantee the security of your personal information.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cookies and Tracking Technologies</h2>
            <p className="mb-2">
              We may use cookies and similar tracking technologies to collect information about your browsing activities over time and across different websites.
              You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent. 
              However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Children's Privacy</h2>
            <p className="mb-2">
              Our service is not directed to anyone under the age of 13. We do not knowingly collect personal information from children under 13. 
              If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 mb-2 space-y-1">
              <li>Access the personal information we have about you</li>
              <li>Correct inaccuracies in your personal information</li>
              <li>Delete your personal information</li>
              <li>Object to the processing of your personal information</li>
              <li>Request a copy of your personal information in a structured, machine-readable format</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to This Privacy Policy</h2>
            <p className="mb-2">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
              and updating the "Last updated" date at the top of this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p className="mb-2">
              If you have questions or concerns about this Privacy Policy, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 