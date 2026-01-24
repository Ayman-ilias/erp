"use client";

import { Construction, Clock } from "lucide-react";

interface UnderDevelopmentProps {
  title?: string;
  message?: string;
}

export function UnderDevelopment({
  title = "Under Development",
  message = "This feature is currently being developed and will be available soon.",
}: UnderDevelopmentProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center">
      {/* Ash/Mirror type overlay background - only covers the content area */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/80 via-gray-500/70 to-gray-600/80 backdrop-blur-sm" />

      {/* Glass effect container */}
      <div className="relative z-10 max-w-lg mx-auto p-8 text-center">
        {/* Glass card */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-full">
                <Construction className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            {title}
          </h1>

          {/* Message */}
          <p className="text-lg text-white/90 drop-shadow">
            {message}
          </p>

          {/* Coming Soon Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full border border-white/40">
              <Clock className="h-5 w-5 text-white animate-pulse" />
              <span className="text-white font-semibold text-lg">Coming Soon</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center gap-2 pt-4">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
