/**
 * DashboardApp.tsx — the single React island behind /dashboard.
 *
 * Rendered from src/pages/dashboard.astro (which has `prerender = false`, so
 * clerkMiddleware protects it) as <DashboardApp client:only="react" /> —
 * client:only so Convex hooks never run during the server render.
 *
 * The provider sandwich is the fiddly bit this starter exists for:
 * Clerk's React context → ConvexProviderWithClerk fed by useAuth from
 * @clerk/astro/react. Import ONLY from @clerk/astro/react in this file —
 * never @clerk/astro/server (it would leak server code into the bundle).
 */
import { useMemo, type ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/astro/react";

export default function DashboardApp() {
  const convex = useMemo(
    () => new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL as string),
    [],
  );

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <header className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Leads</h1>
          <UserButton />
        </header>
        <CrmDashboard />
      </SignedIn>
    </ConvexProviderWithClerk>
  );
}

/**
 * Generate the real CRM here per SKILL.md step 9: stats strip, search +
 * status filter, leads table with detail (status / value / notes), CSV
 * export, and the payment-link button when site.payments is non-empty.
 * All data via useQuery/useMutation against api.leads.*.
 */
function CrmDashboard(): ReactNode {
  return null;
}
