import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoLightbox({ video, onClose }) {
  if (!video) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      <div 
        className="w-full max-w-4xl aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        {video.type === "mp4" ? (
          <video
            src={video.src}
            controls
            autoPlay
            className="w-full h-full rounded-lg"
          />
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${video.src.split('/').pop()}`}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}