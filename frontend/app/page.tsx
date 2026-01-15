import { redirect } from "next/navigation";

/**
 * Root page - redirects to login or dashboard
 * The middleware handles the actual redirect logic based on auth state
 */
export default function RootPage() {
  // Middleware handles the redirect, but as a fallback:
  redirect("/login");
}
