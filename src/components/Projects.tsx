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
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col justify-between p-8 rounded-xl bg-card border border-border hover:bg-slate-800/10 hover:-translate-y-2 transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
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
                <h3 className="text-2xl font-bold text-text mb-4 group-hover:text-blue-400 transition-colors">
                  {project.title.replace(/-/g, ' ')}
                </h3>
                <p className="text-text/60 text-sm md:text-base leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>
              <ul className="flex flex-wrap gap-3 mt-auto">
                {project.tech_stack.map((tech, i) => (
                  <li key={i} className="text-xs font-mono text-text/80 bg-slate-500/10 px-3 py-1 rounded-full border border-border">
                    {tech}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
