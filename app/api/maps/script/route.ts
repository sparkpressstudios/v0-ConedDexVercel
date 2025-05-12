export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return new Response("Google Maps API key not configured", {
      status: 500,
    })
  }

  // Generate a Google Maps script URL with the API key
  const scriptContent = `
    window.initMap = function() {
      window.googleMapsLoaded = true;
      document.dispatchEvent(new Event('googlemapsloaded'));
    };

    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries","places");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\${e}\`;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      key: "${apiKey}",
      v: "weekly",
    });
    
    if (!window.googleMapsLoaded) {
      window.googleMapsLoaded = false;
      window.google = window.google || {};
      window.google.maps = window.google.maps || {};
    }
  `

  return new Response(scriptContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
