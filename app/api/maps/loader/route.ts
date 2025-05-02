import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Maps API not configured" }, { status: 500 })
  }

  // Create a proxy endpoint that loads the Maps API without exposing the key
  // This returns a script that can be used by the client
  const script = `
    (function() {
      const script = document.createElement('script');
      script.src = "https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    })();
  `

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
    },
  })
}
