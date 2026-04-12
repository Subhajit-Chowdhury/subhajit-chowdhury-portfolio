import portfolioData from '../data/portfolio.json';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const { basics, social_links } = portfolioData;

  return (
    <footer className="py-8 text-center text-text/40 text-sm border-t border-border mt-24">
      <div className="flex justify-center gap-6 mb-6 md:hidden">
        <a href={social_links.github} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
          <Github className="w-5 h-5" />
        </a>
        <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href={social_links.medium} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
          </svg>
        </a>
        <a href={`mailto:${basics.email}`} className="hover:text-blue-400 transition-colors">
          <Mail className="w-5 h-5" />
        </a>
      </div>
      <p className="font-mono text-text/60">
        Crafted with <span className="text-red-500">❤</span> by {basics.name}.
      </p>
    </footer>
  );
}
