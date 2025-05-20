import { Inter, Roboto_Mono } from "next/font/google"

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const fonts = {
  sans: fontSans.variable,
  mono: fontMono.variable,
}

// Add the lib export that was referenced elsewhere
export const lib = fontSans
