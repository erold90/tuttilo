"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/routing";

const CONSENT_KEY = "tuttilo_cookie_consent";

type ConsentStatus = "pending" | "accepted" | "rejected";

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>("pending");

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    }
  }, []);

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
    window.dispatchEvent(new Event("tuttilo-consent-change"));
  }, []);

  const reject = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setConsent("rejected");
  }, []);

  return { consent, accept, reject };
}

export function CookieConsent() {
  const { consent, accept, reject } = useCookieConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || consent !== "pending") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm sm:p-5">
        <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
          We use cookies to show relevant ads and improve your experience.
          Ad revenue helps us keep all tools free. No personal data is sold.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={accept}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Accept
          </button>
          <button
            onClick={reject}
            className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reject
          </button>
          <Link
            href="/privacy"
            className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
