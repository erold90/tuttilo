"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type SchemaType = "Organization" | "LocalBusiness" | "Article" | "Product" | "FAQ" | "BreadcrumbList" | "Event";

export default function SchemaMarkupGenerator() {
  const t = useTranslations("tools.schema-markup-generator");
  const [schemaType, setSchemaType] = useState<SchemaType>("Organization");
  const [fields, setFields] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => setFields(prev => ({ ...prev, [key]: value }));

  const schemaFields: Record<SchemaType, string[]> = {
    Organization: ["name", "url", "logo", "description", "email", "telephone", "address"],
    LocalBusiness: ["name", "url", "image", "description", "telephone", "address", "openingHours", "priceRange"],
    Article: ["headline", "author", "datePublished", "image", "publisher", "description"],
    Product: ["name", "image", "description", "brand", "sku", "price", "currency", "availability"],
    FAQ: ["q1", "a1", "q2", "a2", "q3", "a3"],
    BreadcrumbList: ["item1Name", "item1Url", "item2Name", "item2Url", "item3Name", "item3Url"],
    Event: ["name", "startDate", "endDate", "location", "description", "image", "url", "organizer"],
  };

  const generateSchema = () => {
    const f = fields;
    let schema: Record<string, unknown> = { "@context": "https://schema.org" };

    switch (schemaType) {
      case "Organization":
        schema = { ...schema, "@type": "Organization", name: f.name, url: f.url, logo: f.logo, description: f.description, email: f.email, telephone: f.telephone, address: f.address ? { "@type": "PostalAddress", streetAddress: f.address } : undefined };
        break;
      case "LocalBusiness":
        schema = { ...schema, "@type": "LocalBusiness", name: f.name, url: f.url, image: f.image, description: f.description, telephone: f.telephone, address: f.address ? { "@type": "PostalAddress", streetAddress: f.address } : undefined, openingHours: f.openingHours, priceRange: f.priceRange };
        break;
      case "Article":
        schema = { ...schema, "@type": "Article", headline: f.headline, author: f.author ? { "@type": "Person", name: f.author } : undefined, datePublished: f.datePublished, image: f.image, publisher: f.publisher ? { "@type": "Organization", name: f.publisher } : undefined, description: f.description };
        break;
      case "Product":
        schema = { ...schema, "@type": "Product", name: f.name, image: f.image, description: f.description, brand: f.brand ? { "@type": "Brand", name: f.brand } : undefined, sku: f.sku, offers: { "@type": "Offer", price: f.price, priceCurrency: f.currency || "USD", availability: f.availability || "https://schema.org/InStock" } };
        break;
      case "FAQ":
        schema = { ...schema, "@type": "FAQPage", mainEntity: [1, 2, 3].filter(i => f[`q${i}`] && f[`a${i}`]).map(i => ({ "@type": "Question", name: f[`q${i}`], acceptedAnswer: { "@type": "Answer", text: f[`a${i}`] } })) };
        break;
      case "BreadcrumbList":
        schema = { ...schema, "@type": "BreadcrumbList", itemListElement: [1, 2, 3].filter(i => f[`item${i}Name`]).map((i, idx) => ({ "@type": "ListItem", position: idx + 1, name: f[`item${i}Name`], item: f[`item${i}Url`] })) };
        break;
      case "Event":
        schema = { ...schema, "@type": "Event", name: f.name, startDate: f.startDate, endDate: f.endDate, location: f.location ? { "@type": "Place", name: f.location } : undefined, description: f.description, image: f.image, url: f.url, organizer: f.organizer ? { "@type": "Organization", name: f.organizer } : undefined };
        break;
    }

    // Remove undefined values
    const clean = JSON.parse(JSON.stringify(schema));
    return JSON.stringify(clean, null, 2);
  };

  const output = generateSchema();

  const fieldLabels: Record<string, string> = {
    name: t("ui.name"), url: t("ui.url"), logo: t("ui.logo"), image: t("ui.image"),
    description: t("ui.description"), email: t("ui.email"), telephone: t("ui.telephone"),
    address: t("ui.address"), openingHours: t("ui.openingHours"), priceRange: t("ui.priceRange"),
    headline: t("ui.headline"), author: t("ui.author"), datePublished: t("ui.datePublished"),
    publisher: t("ui.publisher"), brand: t("ui.brand"), sku: "SKU", price: t("ui.price"),
    currency: t("ui.currency"), availability: t("ui.availability"),
    q1: "Q1", a1: "A1", q2: "Q2", a2: "A2", q3: "Q3", a3: "A3",
    item1Name: t("ui.itemName") + " 1", item1Url: t("ui.itemUrl") + " 1",
    item2Name: t("ui.itemName") + " 2", item2Url: t("ui.itemUrl") + " 2",
    item3Name: t("ui.itemName") + " 3", item3Url: t("ui.itemUrl") + " 3",
    startDate: t("ui.startDate"), endDate: t("ui.endDate"), location: t("ui.location"),
    organizer: t("ui.organizer"),
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.schemaType")}
        <select value={schemaType} onChange={e => { setSchemaType(e.target.value as SchemaType); setFields({}); }} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          {(Object.keys(schemaFields) as SchemaType[]).map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {schemaFields[schemaType].map(field => (
          <label key={field} className="block text-sm text-zinc-600 dark:text-zinc-400">
            {fieldLabels[field] || field}
            <input value={fields[field] || ""} onChange={e => updateField(field, e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.output")}</h3>
        <pre className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">{`<script type="application/ld+json">\n${output}\n</script>`}</pre>
        <button onClick={() => navigator.clipboard.writeText(`<script type="application/ld+json">\n${output}\n</script>`)} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.copy")}</button>
      </div>
    </div>
  );
}
