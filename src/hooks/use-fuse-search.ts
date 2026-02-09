"use client";

import { useMemo } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import { useTranslations } from "next-intl";
import { tools, type Tool } from "@/lib/tools/registry";

export interface SearchableTool extends Tool {
  name: string;
  description: string;
  keywords: string;
  synonyms: string;
}

const fuseOptions: IFuseOptions<SearchableTool> = {
  keys: [
    { name: "name", weight: 0.5 },
    { name: "synonyms", weight: 0.3 },
    { name: "keywords", weight: 0.15 },
    { name: "description", weight: 0.05 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
};

export function useFuseSearch() {
  const t = useTranslations("tools");

  const toolsWithMeta = useMemo(() => {
    return tools.filter((tool) => tool.isAvailable).map((tool) => {
      let name = tool.id;
      let description = "";
      let keywords = "";
      let synonyms = "";
      try {
        name = t(`${tool.id}.name`);
        description = t(`${tool.id}.description`);
      } catch {
        name = tool.id.replace(/-/g, " ");
      }
      try {
        const kw = t(`${tool.id}.keywords`);
        if (kw && !kw.startsWith("tools.")) keywords = kw;
      } catch {}
      try {
        const syn = t(`${tool.id}.synonyms`);
        if (syn && !syn.startsWith("tools.")) synonyms = syn;
      } catch {}
      return { ...tool, name, description, keywords, synonyms } as SearchableTool;
    });
  }, [t]);

  const fuse = useMemo(() => new Fuse(toolsWithMeta, fuseOptions), [toolsWithMeta]);

  return { fuse, toolsWithMeta };
}
