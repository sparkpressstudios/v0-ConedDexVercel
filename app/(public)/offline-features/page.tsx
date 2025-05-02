import type { Metadata } from "next"
import { Shield, Wifi, Clock, Zap, ArrowDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InstallButton } from "@/components/pwa/install-button"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Download ConeDex - Ice Cream Tracking App",
  description:
    "Download ConeDex to your device and enjoy offline access to track and discover ice cream flavors anywhere, anytime.",
}

export default function DownloadPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Download ConeDex</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Take your ice cream adventures to the next level by installing ConeDex on your device. Track flavors,
            discover shops, and share experiences - even without internet!
          </p>

          <div className="relative mx-auto w-full max-w-md p-6 bg-gradient-to-b from-primary/10 to-background rounded-xl mb-8">
            <Image
              src="/icons/icon-512x512.png"
              alt="ConeDex App Icon"
              width={180}
              height={180}
              className="mx-auto mb-4 drop-shadow-md"
            />
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ArrowDown className="h-10 w-10 text-primary" />
            </div>
          </div>

          <InstallButton size="lg" className="text-lg px-8 py-6 mt-8 group relative overflow-hidden">
            <span className="relative z-10">Install ConeDex App</span>
          </InstallButton>

          <p className="text-sm text-muted-foreground mt-4">Available for iOS, Android, Windows, and Mac devices</p>
        </div>

        {/* Installation Instructions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">How to Install</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-2xl text-primary">1</span>
                </div>
                <CardTitle>Visit ConeDex</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Open ConeDex in your mobile browser (Safari on iOS, Chrome on Android) or desktop browser.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-2xl text-primary">2</span>
                </div>
                <CardTitle>Tap Install</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Look for the "Add to Home Screen" option in your browser menu or the install prompt that appears.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-2xl text-primary">3</span>
                </div>
                <CardTitle>Enjoy ConeDex</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Launch ConeDex from your home screen and enjoy the full app experience with offline capabilities.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <h2 className="text-3xl font-bold mb-6 text-center">Why Download ConeDex?</h2>
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <Wifi className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Full Offline Access</CardTitle>
              <CardDescription>Use ConeDex anywhere, even without internet</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                With the installed app, you can browse your flavor logs, view shop details, and track your ice cream
                journey even when you're off the grid. Perfect for remote ice cream adventures!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Lightning Fast Performance</CardTitle>
              <CardDescription>Experience faster load times and smoother navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The installed app loads instantly and runs more efficiently than the browser version. Enjoy a seamless,
                native-like experience with faster transitions and responsive interactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Log Flavors Anytime</CardTitle>
              <CardDescription>Never miss logging a flavor again</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Found an amazing ice cream flavor but no internet? No problem! Log flavors offline and they'll
                automatically sync when you're back online. Your ConeDex is always up to date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Enhanced Privacy & Security</CardTitle>
              <CardDescription>Keep your ice cream data safe and secure</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The installed app provides an additional layer of security for your ConeDex data. Your flavor logs and
                preferences are stored locally on your device with secure synchronization.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Offline Features */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">What You Can Do Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <ul className="list-disc pl-6 space-y-2">
                <li>View your complete flavor log history</li>
                <li>Browse previously visited shop profiles</li>
                <li>Log new ice cream flavors you've tried</li>
                <li>Update your profile information</li>
              </ul>
              <ul className="list-disc pl-6 space-y-2">
                <li>View your badges and achievements</li>
                <li>Access your saved shops and favorites</li>
                <li>View your ConeDex statistics and progress</li>
                <li>Plan your next ice cream adventure</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to enhance your ice cream experience?</h2>
          <InstallButton size="lg" className="text-lg px-8 py-6 group relative overflow-hidden">
            <span className="relative z-10">Download ConeDex Now</span>
          </InstallButton>
        </div>
      </div>
    </div>
  )
}
