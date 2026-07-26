"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageOff, Loader2 } from "lucide-react";

import { getScreenshotUrl } from "@/actions/payments.actions";

export function ScreenshotViewer({ screenshotPath }: { screenshotPath: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(screenshotPath));

  useEffect(() => {
    if (!screenshotPath) return;
    getScreenshotUrl(screenshotPath).then((signedUrl) => {
      setUrl(signedUrl);
      setLoading(false);
    });
  }, [screenshotPath]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border bg-muted text-muted-foreground">
        <ImageOff className="size-6" />
        <span className="text-sm">No screenshot available</span>
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border">
      <Image
        src={url}
        alt="Payment screenshot"
        width={640}
        height={480}
        className="h-auto max-h-[480px] w-full object-contain bg-muted"
        unoptimized
      />
    </a>
  );
}
