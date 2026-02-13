"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ShieldCheck as Shield, GithubLogo, XLogo, Envelope } from "@phosphor-icons/react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";
import { getCategoryNavItems } from "@/lib/tools/registry";

const categories = getCategoryNavItems();

const companyLinks = [
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold text-cyan-500">Tuttilo</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span>{t("privacyBadge")}</span>
            </div>
          </div>

          {/* Column 2: Tool categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("tools")}</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.key}>
                  <Link
                    href={cat.href}
                    className={cn(
                      "text-sm text-muted-foreground transition-colors",
                      cat.hoverText
                    )}
                  >
                    {tNav(cat.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("company")}</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Settings + Social */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold">{t("settings")}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t("language")}
                  </span>
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">{t("followUs")}</h3>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/erold90/tuttilo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <GithubLogo className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/tuttilo_tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="X (Twitter)"
                >
                  <XLogo className="h-5 w-5" />
                </a>
                <a
                  href="mailto:support@tuttilo.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Email"
                >
                  <Envelope className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tuttilo. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-green-500" />
            <span>{t("filesNeverLeave")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
