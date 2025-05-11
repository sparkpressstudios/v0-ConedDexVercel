import Link from "next/link"
import { IceCream } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 py-12 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <IceCream className="h-6 w-6 text-pink-400" />
              <h3 className="text-lg font-bold text-white">ConeDex</h3>
            </div>
            <p className="mb-4 text-sm">Your ultimate ice cream discovery and tracking platform.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-pink-400">
                Twitter
              </a>
              <a href="#" className="hover:text-pink-400">
                Instagram
              </a>
              <a href="#" className="hover:text-pink-400">
                Facebook
              </a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="hover:text-pink-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/shops" className="hover:text-pink-400">
                  Find Shops
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
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Business</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/business/claim" className="hover:text-pink-400">
                  Claim Your Shop
                </Link>
              </li>
              <li>
                <Link href="/business/pricing" className="hover:text-pink-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/business/partners" className="hover:text-pink-400">
                  Partners
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
                <Link href="/sponsors" className="hover:text-pink-400">
                  Sponsors
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-pink-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-pink-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ConeDex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
