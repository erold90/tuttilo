"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  FileText, Image, VideoCamera, MusicNotes, TextAa, Code,
  YoutubeLogo, GitMerge, Scissors, ArrowsInSimple, ArrowsOutSimple,
  FileImage, FileArrowUp, ArrowClockwise, LockOpen, Images,
  PenNib, Pen, Crop, ArrowsLeftRight, DeviceMobile, Eraser,
  FilmStrip, Monitor, Microphone, Hash, TextAlignLeft,
  ArrowsDownUp, GitDiff, FileJs, BracketsCurly, Binary,
  Terminal, Palette, QrCode, Eyedropper, Link as LinkIcon,
  Clock, ClosedCaptioning, SquaresFour, SlidersHorizontal,
  ShieldCheck, ListNumbers, Drop, Table, PresentationChart,
  Scan, Wrench, Certificate, Rows,
  Key, Fingerprint, Shuffle, Database, Smiley,
  SpeakerSlash, FastForward, Megaphone, Rewind,
  SpeakerHigh, GitFork, MagnifyingGlass,
  Info, CircleHalf, EyeSlash,
} from "@phosphor-icons/react";

interface ToolIconProps {
  name: string;
  className?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  size?: number | string;
}

const iconMap: Record<string, Icon> = {
  FileText,
  Image,
  Video: VideoCamera,
  Music: MusicNotes,
  Type: TextAa,
  Code,
  Youtube: YoutubeLogo,
  Merge: GitMerge,
  Scissors,
  Minimize2: ArrowsInSimple,
  Maximize2: ArrowsOutSimple,
  FileImage,
  FileUp: FileArrowUp,
  RotateCw: ArrowClockwise,
  Unlock: LockOpen,
  Images,
  PenTool: PenNib,
  PenLine: Pen,
  Crop,
  ArrowRightLeft: ArrowsLeftRight,
  Smartphone: DeviceMobile,
  Eraser,
  Film: FilmStrip,
  Monitor,
  Mic: Microphone,
  Hash,
  AlignLeft: TextAlignLeft,
  CaseSensitive: ArrowsDownUp,
  GitCompare: GitDiff,
  FileCode: FileJs,
  Braces: BracketsCurly,
  Binary,
  Regex: Terminal,
  Palette,
  QrCode,
  Pipette: Eyedropper,
  Link: LinkIcon,
  Clock,
  Subtitles: ClosedCaptioning,
  LayoutDashboard: SquaresFour,
  Sliders: SlidersHorizontal,
  ShieldCheck,
  ListNumbers,
  Drop,
  Table,
  Presentation: PresentationChart,
  Scan,
  Wrench,
  Certificate,
  Rows,
  Key,
  Fingerprint,
  Shuffle,
  Database,
  Laugh: Smiley,
  VolumeX: SpeakerSlash,
  FastForward,
  Speaker: Megaphone,
  Rewind,
  Volume2: SpeakerHigh,
  GitMerge2: GitFork,
  Search: MagnifyingGlass,
  Info,
  CircleHalf,
  EyeOff: EyeSlash,
};

export function ToolIcon({ name, ...props }: ToolIconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent weight="duotone" {...props} />;
}
