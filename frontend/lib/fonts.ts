// Temporary system fonts configuration to bypass Google Fonts network issues during Docker build
// System fonts provide excellent fallback and work in all environments

import { cn } from "@/lib/utils";

// Use system font stack - no external dependencies
// These fonts are available on all systems and provide excellent rendering
export const fontVariables = cn(
  // Modern system font stack
  "font-sans"
);

// Export for backwards compatibility if any code imports specific fonts
export const inter = { variable: "--font-inter" };
export const geist = { variable: "--font-geist" };
export const roboto = { variable: "--font-roboto" };
export const montserrat = { variable: "--font-montserrat" };
export const poppins = { variable: "--font-poppins" };
export const overpass_mono = { variable: "--font-overpass-mono" };
export const ptSans = { variable: "--font-pt-sans" };
export const plus_jakarta_sans = { variable: "--font-plus-jakarta-sans" };
export const hedvig_letters_serif = { variable: "--font-hedvig-letters-serif" };
export const kumbh_sans = { variable: "--font-kumbh-sans" };
