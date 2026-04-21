import { motion } from 'framer-motion';
import { Folder, ExternalLink, Github } from 'lucide-react';
import portfolioData from '../data/portfolio.json';

export default function Projects() {
  const { projects } = portfolioData;

  return (
    <section id="projects" className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-12 flex items-center gap-4">
          Featured Projects
          <div className="h-px bg-border flex-grow ml-4 max-w-xs"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => {
            const bullets = (project as { bullets?: string[] }).bullets ?? [];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col justify-between p-8 rounded-xl bg-card border border-border hover:bg-slate-800/10 hover:-translate-y-2 transition-all duration-300"
              >
                <div>
                  {/* Header: folder icon + links */}
                  <div className="flex justify-between items-center mb-4">
                    <Folder className="w-10 h-10 text-blue-400" />
                    <div className="flex gap-4">
                      {project.links.github && (
                        <a
                          href={project.links.github}
                          target="_blank"
                          rel="noreferrer"
                          className="text-text/60 hover:text-blue-400 transition-colors"
                          aria-label="GitHub Repository"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.links.external && (
                        <a
                          href={project.links.external}
                          target="_blank"
                          rel="noreferrer"
                          className="text-text/60 hover:text-blue-400 transition-colors"
                          aria-label="External Link"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Project title — links to GitHub if available */}
                  <h3 className="text-xl font-bold text-text mb-4 group-hover:text-blue-400 transition-colors leading-snug">
                    {project.links.github ? (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {project.title}
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>

                  {/* Bullet points — verbatim from LinkedIn */}
                  {bullets.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-2 text-text/70 text-sm leading-relaxed">
                          <span className="text-blue-400 mt-1 shrink-0">▹</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Tech stack tags */}
                <ul className="flex flex-wrap gap-3 mt-auto pt-2 border-t border-border/40">
                  {project.tech_stack.map((tech, i) => (
                    <li key={i} className="text-xs font-mono text-text/80 bg-slate-500/10 px-3 py-1 rounded-full border border-border">
                      {tech}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
