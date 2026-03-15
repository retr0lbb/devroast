"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy } from "lucide-react";

interface ShareRoastButtonProps {
  roastId: string;
  summary: string;
}

export function ShareRoastButton({ roastId, summary }: ShareRoastButtonProps) {
  const [hasShared, setHasShared] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/roast/${roastId}`;
  const shareData = {
    title: "DevRoast - My Code Analysis",
    text: `Check out my code roast: "${summary}"`,
    url: shareUrl,
  };

  const handleShare = async () => {
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setHasShared(true);
        setTimeout(() => setHasShared(false), 2000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to clipboard if share fails or is cancelled
      try {
        await navigator.clipboard.writeText(shareUrl);
        setHasShared(true);
        setTimeout(() => setHasShared(false), 2000);
      } catch (copyError) {
        console.error("Failed to copy to clipboard:", copyError);
      }
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      className="gap-2 font-mono text-[11px] uppercase tracking-wider"
      onClick={handleShare}
    >
      {hasShared ? (
        <>
          <Check className="size-3 text-accent-green" />
          copied_to_clipboard
        </>
      ) : (
        <>
          <Share2 className="size-3" />
          share_my_roast
        </>
      )}
    </Button>
  );
}
