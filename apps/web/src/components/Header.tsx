'use client';

import React from 'react';
import { Github, ExternalLink } from 'lucide-react';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/80 bg-[#07070e]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 text-white">
            <Logo size={18} />
          </div>
          <span className="font-extrabold tracking-wider text-white">stellar-starter-kit</span>
        </div>

        <nav className="text-slate-350 hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#architecture" className="transition-colors hover:text-white">
            Architecture
          </a>
          <a href="#code" className="transition-colors hover:text-white">
            Developer API
          </a>
          <a href="#roadmap" className="transition-colors hover:text-white">
            Roadmap
          </a>
          <a href="#faq" className="transition-colors hover:text-white">
            FAQ
          </a>
          <a href="/docs" className="flex items-center gap-1 transition-colors hover:text-white">
            Docs <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/techAlhaji/stellar-starter-kit"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
            aria-label="GitHub Repository"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="#code"
            className="hidden h-9 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-4 text-xs font-semibold text-white shadow-md shadow-purple-500/10 transition-all duration-300 hover:brightness-110 sm:inline-flex"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
