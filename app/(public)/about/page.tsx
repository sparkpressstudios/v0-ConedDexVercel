import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About ConeDex | The Ice Cream Discovery Platform",
  description:
    "Learn about ConeDex, the ultimate platform for ice cream enthusiasts to discover, track, and share their favorite frozen treats.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">About ConeDex</h1>

      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          ConeDex is the ultimate platform for ice cream enthusiasts to discover, track, and share their favorite frozen
          treats.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p>
          At ConeDex, we're passionate about connecting ice cream lovers with the best frozen treats around the world.
          Our mission is to create a comprehensive database of ice cream flavors and shops, making it easy for
          enthusiasts to discover new favorites and track their ice cream adventures.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
        <p>
          ConeDex was founded in 2023 by a group of ice cream enthusiasts who were frustrated by the lack of a
          comprehensive resource for discovering and tracking ice cream flavors. What started as a simple spreadsheet
          quickly evolved into a passion project, and eventually, the platform you see today.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Team</h2>
        <p>
          Our team consists of ice cream enthusiasts, developers, and food industry experts who are dedicated to
          creating the best possible platform for the ice cream community. We're constantly working to improve ConeDex
          and add new features based on user feedback.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Join Our Community</h2>
        <p>
          ConeDex is more than just a platform—it's a community of ice cream lovers. Join us in our mission to document
          every ice cream flavor and shop around the world. Sign up today to start tracking your ice cream adventures!
        </p>
      </div>
    </div>
  )
}
