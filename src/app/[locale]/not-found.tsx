import { Link } from "@/i18n/routing";
import { House, MagnifyingGlass, FilePdf, Image, VideoCamera, Microphone, Code, TextT, YoutubeLogo } from "@phosphor-icons/react/dist/ssr";

const categoryLinks = [
  { href: "/pdf", icon: FilePdf, label: "PDF Tools" },
  { href: "/image", icon: Image, label: "Image Tools" },
  { href: "/video", icon: VideoCamera, label: "Video Tools" },
  { href: "/audio", icon: Microphone, label: "Audio Tools" },
  { href: "/text", icon: TextT, label: "Text Tools" },
  { href: "/developer", icon: Code, label: "Developer Tools" },
  { href: "/youtube", icon: YoutubeLogo, label: "YouTube Tools" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl font-bold text-muted-foreground/20">404</div>
      <h1 className="mb-3 text-3xl font-bold">Page Not Found</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Try browsing our free tools below.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categoryLinks.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <cat.icon className="h-4 w-4 text-primary" weight="duotone" />
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <House className="h-4 w-4" weight="duotone" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
