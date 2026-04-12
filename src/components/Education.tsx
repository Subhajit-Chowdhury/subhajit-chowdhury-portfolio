import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import portfolioData from '../data/portfolio.json';

export default function Education() {
  const { education } = portfolioData;

  return (
    <section id="education" className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-12 flex items-center gap-4">
          Education
          <div className="h-px bg-border flex-grow ml-4 max-w-xs"></div>
        </h2>

        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl font-bold text-text">Degrees</h3>
          </div>
          <div className="space-y-8">
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-blue-500/20 before:border-2 before:border-blue-400 before:rounded-full"
              >
                <h4 className="text-xl font-bold text-text">{edu.degree}</h4>
                <p className="text-blue-400 font-medium my-1">{edu.institution}</p>
                <p className="text-text/60 text-sm mb-2">{edu.dates}</p>
                <p className="text-text/80">{edu.details}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
