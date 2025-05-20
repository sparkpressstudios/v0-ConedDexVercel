import Link from "next/link"
import { IceCream, Twitter, Instagram, Facebook, GitlabIcon as GitHub, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 py-12 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <IceCream className="h-6 w-6 text-pink-400" />
              <h3 className="text-lg font-bold text-white">ConeDex</h3>
            </div>
            <p className="mb-6 text-sm">
              Your ultimate ice cream discovery and tracking platform. Find new flavors, log your experiences, and
              connect with other ice cream enthusiasts.
            </p>
            <div className="mb-6 flex space-x-4">
              <a href="#" className="hover:text-pink-400" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-pink-400" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-pink-400" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-pink-400" aria-label="GitHub">
                <GitHub className="h-5 w-5" />
              </a>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-start">
                <Mail className="mr-2 mt-1 h-4 w-4 text-pink-400" />
                <span>hello@conedex.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-2 mt-1 h-4 w-4 text-pink-400" />
                <span>123 Ice Cream Way, Flavor City, FC 12345</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Discover</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shops" className="hover:text-pink-400">
                  Find Shops
                </Link>
              </li>
              <li>
                <Link href="/conedex" className="hover:text-pink-400">
                  The ConeDex
                </Link>
              </li>
              <li>
                <Link href="/badges" className="hover:text-pink-400">
                  Badges
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-pink-400">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-pink-400">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">For Businesses</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/business" className="hover:text-pink-400">
                  Business Overview
                </Link>
              </li>
              <li>
                <Link href="/business/claim" className="hover:text-pink-400">
                  Claim Your Shop
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-pink-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/business/success-stories" className="hover:text-pink-400">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/business/api" className="hover:text-pink-400">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-pink-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-pink-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="hover:text-pink-400">
                  Sponsors
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-pink-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-pink-400">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-start md:space-x-4 md:space-y-0">
              <Link href="/privacy" className="text-sm hover:text-pink-400">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm hover:text-pink-400">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm hover:text-pink-400">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-sm hover:text-pink-400">
                Accessibility
              </Link>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-end md:space-x-4 md:space-y-0">
              <div className="flex-1 md:max-w-xs">
                <div className="flex">
                  <Input
                    type="email"
                    placeholder="Subscribe to our newsletter"
                    className="rounded-r-none bg-gray-800 text-white focus:border-pink-400 focus:ring-pink-400"
                  />
                  <Button className="rounded-l-none bg-pink-600 hover:bg-pink-700">Subscribe</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} ConeDex. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
