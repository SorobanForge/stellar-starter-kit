'use client';

import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import CodePlayground from '../components/CodePlayground';
import WhySection from '../components/WhySection';
import Architecture from '../components/Architecture';
import Ecosystem from '../components/Ecosystem';
import BuiltWith from '../components/BuiltWith';
import Roadmap from '../components/Roadmap';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#06060c] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Ambient background mesh glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-pulse-slow absolute left-[-10%] top-[-10%] h-[60%] w-[60%] rounded-full bg-purple-900/10 blur-[150px]"></div>
        <div
          className="animate-pulse-slow absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-cyan-900/10 blur-[150px]"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <Header />

      <main className="relative z-10">
        <Hero />
        <FeatureGrid />
        <WhySection />
        <Architecture />
        <CodePlayground />
        <Ecosystem />
        <BuiltWith />
        <Roadmap />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
