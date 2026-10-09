"use client";

import { useState } from "react";
import { X, Play } from "lucide-react";

export default function TutorialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#8BAA5C] px-5 py-4">
          <h2 className="font-display text-lg font-bold text-white">TUTORIAL</h2>
          <button onClick={onClose} aria-label="Tutup">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div>
  <div className="relative aspect-video overflow-hidden bg-black">
            {playing ? (
              <iframe
                src="https://www.youtube.com/embed/h4GJpX3fO70?autoplay=1"
                title="Tutorial Soilmate"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="group relative h-full w-full"
                aria-label="Putar video"
              >
                <img
                  src="https://img.youtube.com/vi/h4GJpX3fO70/maxresdefault.jpg"
                  alt="Thumbnail tutorial"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
                    <Play className="ml-1 h-7 w-7 fill-forest-dark text-forest-dark" />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}