import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Terms of Service - ReelCritic",
  description: "Terms and conditions for using the ReelCritic platform"
}

export default function TermsPage() {
  const lastUpdated = "May 1, 2023"
  
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {lastUpdated}
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-8 text-sm">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="mb-2">
              By accessing or using ReelCritic (the "Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="mb-2">
              ReelCritic is a social platform that allows users to discover, review, and discuss movies. 
              The Service may include features such as user profiles, reviews, comments, recommendations, 
              watchlists, and other content related to movies and entertainment.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="mb-2">
              To use certain features of the Service, you must register for an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-2 space-y-1">
              <li>Providing accurate, current, and complete information during registration</li>
              <li>Maintaining the confidentiality of your password and account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. User Content</h2>
            <p className="mb-2">
              Users may post reviews, comments, and other content ("User Content") on the Service. By posting User Content, you:
            </p>
            <ul className="list-disc pl-6 mb-2 space-y-1">
              <li>Grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, and display such content</li>
              <li>Represent that you own or have the necessary rights to post such content</li>
              <li>Agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
            </ul>
            <p>
              We reserve the right to remove any User Content that violates these Terms or for any other reason at our sole discretion.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Privacy</h2>
            <p className="mb-2">
              Our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> describes how we collect, use, and share information about you when you use our Service. 
              By using ReelCritic, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p className="mb-2">
              The Service and its original content, features, and functionality are and will remain the exclusive property of ReelCritic. 
              The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection 
              with any product or service without our prior written consent.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Links to Other Websites</h2>
            <p className="mb-2">
              Our Service may contain links to third-party websites or services that are not owned or controlled by ReelCritic. 
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. 
              You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by the use of such websites or services.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
            <p className="mb-2">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including, without limitation, 
              if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
            <p className="mb-2">
              In no event shall ReelCritic, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; 
              (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; 
              and (iv) unauthorized access, use, or alteration of your transmissions or content.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
            <p className="mb-2">
              These Terms shall be governed and construed in accordance with the laws of United States, without regard to its conflict of law provisions.
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
            <p className="mb-2">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
              we will try to provide at least 30 days' notice prior to any new terms taking effect. 
              What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
            <p className="mb-2">
              If you have any questions about these Terms, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 