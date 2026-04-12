import { motion } from 'framer-motion';
import portfolioData from '../data/portfolio.json';

export default function Skills() {
  const { skills } = portfolioData;

  return (
    <section id="skills" className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-12 flex items-center gap-4">
          Technical Skills
          <div className="h-px bg-border flex-grow ml-4 max-w-xs"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skillGroup, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-blue-500/30 transition-colors"
            >
              <h3 className="text-xl font-semibold text-text mb-4 pb-2 border-b border-border">
                {skillGroup.category}
              </h3>
              <ul className="space-y-2">
                {skillGroup.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-text/60 text-sm md:text-base">
                    <span className="text-blue-400 mt-1">▹</span>
                    <span>{item}</span>
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
