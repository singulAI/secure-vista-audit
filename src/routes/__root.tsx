import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar, Topbar, Footer } from "@/components/audit/Layout";
import { LanguageProvider } from "@/lib/i18n";
import { UIProvider } from "@/lib/uiState";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Route not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This audit surface doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md border border-cyan/40 bg-cyan/10 px-4 py-2 text-sm text-cyan hover:bg-cyan/20">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md border border-cyan/40 bg-cyan/10 px-4 py-2 text-sm text-cyan"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SingulAI Audit Center — Independent Security Module" },
      { name: "description", content: "Enterprise-grade audit, evidence vault and on-chain proofs for the SingulAI ecosystem." },
      { property: "og:title", content: "SingulAI Audit Center — Independent Security Module" },
      { property: "og:description", content: "Enterprise-grade audit, evidence vault and on-chain proofs for the SingulAI ecosystem." },
      { name: "twitter:title", content: "SingulAI Audit Center — Independent Security Module" },
      { name: "twitter:description", content: "Enterprise-grade audit, evidence vault and on-chain proofs for the SingulAI ecosystem." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ZUNF20TevSZ6KF4GNh73bWdmpVx1/social-images/social-1778731683813-IMG_7275.JPG.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ZUNF20TevSZ6KF4GNh73bWdmpVx1/social-images/social-1778731683813-IMG_7275.JPG.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <UIProvider>
          <div className="flex min-h-screen w-full">
            <Sidebar open={open} onClose={() => setOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar onMenu={() => setOpen(true)} />
              <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
                <Outlet />
              </main>
              <Footer />
            </div>
          </div>
        </UIProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
