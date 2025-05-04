import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | ConeDex",
  description: "ConeDex terms of service - Please read these terms carefully before using our platform.",
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose max-w-none">
        <p className="text-lg mb-6">Last updated: May 2, 2023</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using ConeDex, you agree to be bound by these Terms of Service and all applicable laws and
          regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this
          site.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials on ConeDex for personal,
          non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate, complete, and current information. You are
          responsible for safeguarding the password that you use to access the service and for any activities or actions
          under your password.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Content</h2>
        <p>
          Our service allows you to post, link, store, share and otherwise make available certain information, text,
          graphics, videos, or other material. You are responsible for the content you post to the service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason
          whatsoever, including without limitation if you breach the Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law
          provisions.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to
          access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at terms@conedex.com.</p>
      </div>
    </div>
  )
}
