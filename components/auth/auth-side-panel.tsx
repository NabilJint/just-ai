import React from "react";

export default function AuthSidePanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-20 border-r border-border bg-bg-surface select-none">
      {/* Top Header: Cute Logo & Brand */}
      <div className="flex items-center gap-3">
        <img
          src="/favicon.png"
          alt="Ghost AI Logo"
          className="size-11 rounded-xl shrink-0"
        />
        <span className="font-feather text-heading text-color-duo-green uppercase tracking-wider">
          Ghost AI
        </span>
      </div>

      {/* Center: Main Tagline and Features Checklist */}
      <div className="space-y-10 max-w-lg pr-4">
        <div className="space-y-4">
          <h1 className="font-feather text-display text-text-primary uppercase leading-[1.1] tracking-tight">
            Design systems in plain English.
          </h1>
          <p className="font-din-round text-body text-text-secondary leading-relaxed tracking-wider">
            Pair program with Antigravity to generate interactive architectures, collaborate in real-time, and export professional technical specifications.
          </p>
        </div>

        {/* Clean text-only features checklist */}
        <ul className="space-y-4 font-din-round text-body text-text-secondary tracking-wider">
          <li className="flex items-center gap-3">
            <span className="text-duo-green font-bold text-xl leading-none">✓</span>
            <span>AI-powered architecture mapping from prompts</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-duo-green font-bold text-xl leading-none">✓</span>
            <span>Real-time collaborative canvas & presence</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-duo-green font-bold text-xl leading-none">✓</span>
            <span>Instant Markdown technical spec generation</span>
          </li>
        </ul>
      </div>

      {/* Bottom Footer: Minimal copyright */}
      <div className="font-din-round text-caption text-text-muted tracking-widest uppercase font-semibold">
        © 2026 Ghost AI. All rights reserved.
      </div>
    </div>
  );
}
