import { motion } from 'framer-motion';
import { Download, ChevronDown } from 'lucide-react';
import portfolioData from '../data/portfolio.json';
import { getExperienceYears } from '../lib/portfolio-utils';

export default function Hero() {
  const { basics } = portfolioData;

  // Prefer the summary's stated years (e.g. "~4 years") for display consistency,
  // otherwise fall back to the computed value from experience records.
  const summaryYearsMatch = String(basics?.summary || '').match(/(~?)\s*(\d+)\s*years?/i);
  const displayYears = summaryYearsMatch ? Number(summaryYearsMatch[2]) : getExperienceYears();

  return (
    <section className="min-h-screen flex flex-col justify-center relative px-6 md:px-12 lg:px-24 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl"
      >
        <h2 className="text-blue-400 font-mono text-lg md:text-xl mb-4 tracking-wide">
          Hi, I'm
        </h2>
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-text mb-4 tracking-tight whitespace-nowrap">
          {basics.name}
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-text/50 mb-6 tracking-tight">
          {basics.title}
        </h2>
        <div className="flex flex-wrap gap-3 mb-8 text-text/70 text-sm md:text-base">
          <span className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5">{displayYears}+ years experience</span>
          <span className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5">150+ production pipelines</span>
          <span className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5">GBP 1.5M+ infrastructure savings</span>
          <span className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5">Sub-minute data SLAs</span>
        </div>
        <p className="text-text/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          {basics.summary}
        </p>

        <div className="flex flex-wrap gap-4 mb-12">
          <motion.a
            href="#experience"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-blue-500/10 text-blue-400 border border-blue-500/50 rounded-lg font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-2"
          >
            View Experience
            <ChevronDown className="w-4 h-4" />
          </motion.a>
          <motion.a
            href={basics.resume_pdf}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-card text-text border border-border rounded-lg font-medium hover:bg-slate-700/20 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Resume
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
