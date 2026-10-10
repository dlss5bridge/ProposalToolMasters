// Lazy loaders for heavy third-party assets that used to live in public/index.html
// and were therefore downloaded on every page — including the login/landing page,
// which uses none of them. Moving them here lets us inject them only once the user
// is authenticated (and only on the pages that actually need them), which keeps the
// public entry page's critical path small (better PageSpeed / LCP / TBT).
//
// Every loader is idempotent: calling it more than once injects nothing extra.

// The ~25 Google Font families are only used by the template / PDF font picker and
// the on-screen template preview (see Middleware/Utils.js + the template/EL/proposal
// editors). They are not used by the app shell or the auth pages.
const TEMPLATE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Bebas+Neue&family=Cedarville+Cursive&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Fira+Code:wght@300..700&family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inconsolata:wght@200..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Oswald:wght@200..700&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&family=Raleway:ital,wght@0,100..900;1,100..900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&family=Ubuntu+Sans:ital,wght@0,100..800;1,100..800&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap";

const GOOGLE_MAPS_SRC =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyCqenMIavBsRCF0kRPQ_8ARRZviLvHGD8Q&libraries=places&v=beta";

let mapsPromise = null;

// Injects the template-font stylesheet once. Safe to call on every render/mount.
export function loadTemplateFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById("template-fonts")) return;

  const link = document.createElement("link");
  link.id = "template-fonts";
  link.rel = "stylesheet";
  link.href = TEMPLATE_FONTS_HREF;
  document.head.appendChild(link);
}

// Injects the Google Maps JS API once and resolves when window.google.maps is ready.
// Address autocomplete reads window.google.maps.places on user interaction, so as
// long as this is called when an address-bearing page mounts the API is loaded well
// before it is used.
export function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google && window.google.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("google-maps-js");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-js";
    script.src = GOOGLE_MAPS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => {
      mapsPromise = null; // allow a later retry
      reject(e);
    };
    document.head.appendChild(script);
  });
  return mapsPromise;
}
