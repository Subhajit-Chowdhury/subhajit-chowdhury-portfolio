import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Education', href: '#education' },
    { name: 'Certifications', href: '#certifications' },
  ];

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-bg/80 backdrop-blur-md py-4 shadow-lg shadow-slate-900/20' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <motion.a
          href="#"
          onClick={scrollToTop}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center group"
          aria-label="Home"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400/30 group-hover:border-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/10">
            <img 
              src="/favicon.png" 
              alt="Subhajit Chowdhury" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-sm font-medium text-text/80 hover:text-blue-400 transition-colors"
            >
              {link.name}
            </motion.a>
          ))}
          
          <motion.a
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: navLinks.length * 0.1 }}
            href="#contact"
            className="ml-2 px-4 py-2 border border-blue-400 text-blue-400 rounded hover:bg-blue-400/10 transition-colors text-sm font-medium"
          >
            Contact
          </motion.a>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            className="text-text/80 hover:text-blue-400 z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-0 bg-bg/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 lg:hidden z-40"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-medium text-text/80 hover:text-blue-400 transition-colors flex flex-col items-center gap-2"
                >
                  {link.name}
                </a>
              ))}
              
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 px-8 py-4 border border-blue-400 text-blue-400 rounded hover:bg-blue-400/10 transition-colors text-lg font-medium"
              >
                Contact
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
