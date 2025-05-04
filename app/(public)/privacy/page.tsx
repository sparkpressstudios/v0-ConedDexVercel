import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | ConeDex",
  description: "ConeDex privacy policy - Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose max-w-none">
        <p className="text-lg mb-6">Last updated: May 2, 2023</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          ConeDex ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use our website and services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, such as when you create an account, update your
          profile, use interactive features, participate in contests, promotions, or surveys, request customer support,
          or otherwise communicate with us.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, to develop new features, and
          to protect ConeDex and our users.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
        <p>
          We may share your information with third-party vendors, service providers, contractors, or agents who perform
          services for us or on our behalf and require access to such information to do that work.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information. You can also object to processing
          of your personal information, ask us to restrict processing of your personal information, or request
          portability of your personal information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@conedex.com.</p>
      </div>
    </div>
  )
}
