"use client";

import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface ToolIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

const iconMap: Record<string, LucideIcons.LucideIcon> = {
  FileText: LucideIcons.FileText,
  Image: LucideIcons.Image,
  Video: LucideIcons.Video,
  Music: LucideIcons.Music,
  Type: LucideIcons.Type,
  Code: LucideIcons.Code,
  Youtube: LucideIcons.Youtube,
  Merge: LucideIcons.Merge,
  Scissors: LucideIcons.Scissors,
  Minimize2: LucideIcons.Minimize2,
  Maximize2: LucideIcons.Maximize2,
  FileImage: LucideIcons.FileImage,
  FileUp: LucideIcons.FileUp,
  RotateCw: LucideIcons.RotateCw,
  Unlock: LucideIcons.Unlock,
  Images: LucideIcons.Images,
  PenTool: LucideIcons.PenTool,
  PenLine: LucideIcons.PenLine,
  Crop: LucideIcons.Crop,
  ArrowRightLeft: LucideIcons.ArrowRightLeft,
  Smartphone: LucideIcons.Smartphone,
  Eraser: LucideIcons.Eraser,
  Film: LucideIcons.Film,
  Monitor: LucideIcons.Monitor,
  Mic: LucideIcons.Mic,
  Hash: LucideIcons.Hash,
  AlignLeft: LucideIcons.AlignLeft,
  CaseSensitive: LucideIcons.CaseSensitive,
  GitCompare: LucideIcons.GitCompare,
  FileCode: LucideIcons.FileCode,
  Braces: LucideIcons.Braces,
  Binary: LucideIcons.Binary,
  Regex: LucideIcons.Regex,
  Palette: LucideIcons.Palette,
  QrCode: LucideIcons.QrCode,
  Pipette: LucideIcons.Pipette,
  Link: LucideIcons.Link,
  Clock: LucideIcons.Clock,
  Subtitles: LucideIcons.Subtitles,
  LayoutDashboard: LucideIcons.LayoutDashboard,
};

export function ToolIcon({ name, ...props }: ToolIconProps) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
