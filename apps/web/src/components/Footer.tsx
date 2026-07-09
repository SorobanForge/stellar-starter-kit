'use client';

import React from 'react';
import { Star, Github, Twitter, MessageCircle } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-slate-900 bg-[#04040a] py-16"
      aria-label="Footer Nav Section"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Branding Block */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 text-white">
                <Logo size={16} />
              </div>
              <span className="font-extrabold tracking-wider text-white">stellar-starter-kit</span>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-slate-400">
              The flagship open-source template to develop, compile, test, and deploy smart contract
              applications on the Stellar/Soroban platform.
            </p>

            {/* Social icons */}
            <div className="text-slate-550 mt-6 flex items-center gap-4">
              <a
                href="https://github.com/techAlhaji/stellar-starter-kit"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
              <span
                className="flex cursor-not-allowed items-center gap-1.5 transition-colors hover:text-white"
                title="Discord community coming soon"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                  Soon
                </span>
              </span>
              <span
                className="flex cursor-not-allowed items-center gap-1.5 transition-colors hover:text-white"
                title="X channel coming soon"
              >
                <Twitter className="h-5 w-5" />
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                  Soon
                </span>
              </span>
            </div>
          </div>

          {/* Docs & Specs links */}
          <div>
            <h5 className="mb-4 text-sm text-xs font-bold uppercase tracking-wide text-slate-500 text-white">
              Resources
            </h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Stellar Foundation
                </a>
              </li>
              <li>
                <a
                  href="https://soroban.stellar.org"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Soroban Docs
                </a>
              </li>
              <li>
                <a href="/docs" className="transition-colors hover:text-white">
                  Documentation Guide
                </a>
              </li>
              <li>
                <a href="/docs" className="transition-colors hover:text-white">
                  Architecture Map
                </a>
              </li>
            </ul>
          </div>

          {/* Community & legal links */}
          <div>
            <h5 className="mb-4 text-sm text-xs font-bold uppercase tracking-wide text-slate-500 text-white">
              Developers
            </h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://github.com/techAlhaji/stellar-starter-kit/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Contributing
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/techAlhaji/stellar-starter-kit/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Security Policy
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/techAlhaji/stellar-starter-kit/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  MIT License
                </a>
              </li>
              <li>
                <a href="#roadmap" className="transition-colors hover:text-white">
                  Roadmap Milestone
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* copyright and credit bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-900 pt-8 text-xs text-slate-500 md:flex-row">
          <div>
            &copy; {new Date().getFullYear()} Stellar Starter Kit. Open Source under the MIT
            License.
          </div>
          <div className="flex items-center gap-2">
            <span>Maintained by techAlhaji and the community</span>
            <Star className="h-3 w-3 fill-yellow-500/20 text-yellow-500/80" />
          </div>
        </div>
      </div>
    </footer>
  );
}
