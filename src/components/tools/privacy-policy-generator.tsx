"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function PrivacyPolicyGenerator() {
  const t = useTranslations("tools.privacy-policy-generator");
  const [site, setSite] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [features, setFeatures] = useState({ cookies: true, analytics: true, thirdParty: false, newsletter: false, ads: false, userAccounts: false });
  const [generated, setGenerated] = useState("");

  const generate = useCallback(() => {
    const siteName = site || "Our Website";
    const siteUrl = url || "https://example.com";
    const contactEmail = email || "privacy@example.com";
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    let policy = `Privacy Policy for ${siteName}\nEffective Date: ${date}\nURL: ${siteUrl}\n\n`;
    policy += `1. INTRODUCTION\n\n${siteName} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ${siteUrl}.\n\n`;
    policy += `2. INFORMATION WE COLLECT\n\nWe may collect information about you in a variety of ways:\n`;
    policy += `- Automatically collected data: browser type, operating system, access times, pages viewed, IP address, and referring URL.\n`;
    if (features.userAccounts) policy += `- Account information: name, email address, and password when you create an account.\n`;
    if (features.newsletter) policy += `- Newsletter subscription: email address when you subscribe to our newsletter.\n`;
    policy += `\n`;

    if (features.cookies) {
      policy += `3. COOKIES\n\nWe use cookies and similar tracking technologies to track activity on our website. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.\n\n`;
    }
    if (features.analytics) {
      policy += `${features.cookies ? "4" : "3"}. ANALYTICS\n\nWe may use third-party analytics services (such as Google Analytics) to help analyze how users use the site. These services collect information sent by your browser, including your IP address and the pages you visit. This information is used to evaluate usage patterns and compile statistical reports.\n\n`;
    }
    if (features.thirdParty) {
      policy += `THIRD-PARTY SERVICES\n\nWe may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used. These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.\n\n`;
    }
    if (features.ads) {
      policy += `ADVERTISING\n\nWe may use third-party advertising companies to serve ads when you visit our website. These companies may use information about your visits to this and other websites to provide relevant advertisements.\n\n`;
    }

    policy += `DATA SECURITY\n\nWe use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the information you provide to us, no method of transmission over the Internet is 100% secure.\n\n`;
    policy += `YOUR RIGHTS\n\nDepending on your location, you may have the following rights regarding your personal data:\n- The right to access your personal data\n- The right to rectification of inaccurate data\n- The right to erasure of your data\n- The right to restrict processing\n- The right to data portability\n- The right to object to processing\n\n`;
    policy += `CHILDREN'S PRIVACY\n\nOur service does not address anyone under the age of 13. We do not knowingly collect personal information from children under 13.\n\n`;
    policy += `CHANGES TO THIS POLICY\n\nWe may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.\n\n`;
    policy += `CONTACT US\n\nIf you have any questions about this Privacy Policy, please contact us at: ${contactEmail}\n`;

    setGenerated(policy);
  }, [site, url, email, features]);

  const copyPolicy = useCallback(() => { navigator.clipboard.writeText(generated); }, [generated]);
  const downloadPolicy = useCallback(() => {
    const blob = new Blob([generated], { type: "text/plain" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = u; a.download = "privacy-policy.txt"; a.click();
    URL.revokeObjectURL(u);
  }, [generated]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input placeholder={t("ui.siteName")} value={site} onChange={e => setSite(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        <input placeholder={t("ui.siteUrl")} value={url} onChange={e => setUrl(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        <input placeholder={t("ui.contactEmail")} value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
      </div>
      <div className="flex flex-wrap gap-4">
        {(Object.keys(features) as (keyof typeof features)[]).map(key => (
          <label key={key} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={features[key]} onChange={e => setFeatures({ ...features, [key]: e.target.checked })} className="accent-blue-600" />
            {t(`ui.${key}`)}
          </label>
        ))}
      </div>
      <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      {generated && (
        <div className="space-y-3">
          <textarea readOnly value={generated} rows={20} className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono" />
          <div className="flex gap-3">
            <button onClick={copyPolicy} className="px-3 py-1.5 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
            <button onClick={downloadPolicy} className="px-3 py-1.5 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.download")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
