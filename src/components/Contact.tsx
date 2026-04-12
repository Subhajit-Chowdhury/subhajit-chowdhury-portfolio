import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import portfolioData from '../data/portfolio.json';

export default function Contact() {
  const { basics, social_links } = portfolioData;

  const contactLinks = [
    {
      name: 'Email',
      value: basics.email,
      href: `mailto:${basics.email}`,
      icon: <Mail className="w-8 h-8" />,
      color: 'hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400'
    },
    {
      name: 'LinkedIn',
      value: 'Connect on LinkedIn',
      href: social_links.linkedin,
      icon: <Linkedin className="w-8 h-8" />,
      color: 'hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400'
    },
    {
      name: 'GitHub',
      value: 'View my repositories',
      href: social_links.github,
      icon: <Github className="w-8 h-8" />,
      color: 'hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-400'
    },
    {
      name: 'Medium',
      value: 'Read my articles',
      href: social_links.medium,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
        </svg>
      ),
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400'
    }
  ];

  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-text mb-6">
          Get In Touch
        </h2>
        <p className="text-text/60 text-lg max-w-2xl mx-auto mb-16">
          I’m currently open to new opportunities and always happy to connect. Whether you have a question, a role in mind, or just want to say hello, feel free to reach out—I’ll do my best to get back to you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {contactLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group flex items-center p-6 rounded-xl bg-card border border-border transition-all duration-300 ${link.color}`}
            >
              <div className="mr-6 text-text/40 group-hover:text-inherit transition-colors">
                {link.icon}
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-text group-hover:text-inherit transition-colors">
                  {link.name}
                </h3>
                <p className="text-text/60 text-sm mt-1 group-hover:text-inherit transition-colors">
                  {link.value}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-text/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
