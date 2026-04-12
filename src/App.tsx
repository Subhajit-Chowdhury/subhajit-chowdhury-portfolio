/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Education from './components/Education';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AIChat from './components/AIChat';

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-bg flex flex-col p-6 md:p-12 lg:p-24">
      <div className="max-w-7xl mx-auto w-full space-y-12 animate-pulse">
        {/* Nav Skeleton */}
        <div className="flex justify-between items-center mb-24">
          <div className="w-10 h-10 rounded-full bg-slate-800/50"></div>
          <div className="hidden md:flex gap-8">
            <div className="h-4 w-20 bg-slate-800/30 rounded"></div>
            <div className="h-4 w-20 bg-slate-800/30 rounded"></div>
            <div className="h-4 w-20 bg-slate-800/30 rounded"></div>
          </div>
        </div>
        
        {/* Hero Skeleton */}
        <div className="space-y-6">
          <div className="h-4 w-32 bg-blue-500/20 rounded"></div>
          <div className="h-16 md:h-24 w-full md:w-3/4 bg-slate-800/40 rounded-2xl"></div>
          <div className="h-16 md:h-24 w-full md:w-1/2 bg-slate-800/30 rounded-2xl"></div>
          <div className="h-20 w-full md:w-2/3 bg-slate-800/20 rounded-xl pt-4"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
          <div className="h-64 bg-slate-800/10 rounded-2xl border border-slate-800/50"></div>
          <div className="h-64 bg-slate-800/10 rounded-2xl border border-slate-800/50"></div>
          <div className="h-64 bg-slate-800/10 rounded-2xl border border-slate-800/50"></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <AnimatedBackground />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Certifications />
        <Contact />
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}
