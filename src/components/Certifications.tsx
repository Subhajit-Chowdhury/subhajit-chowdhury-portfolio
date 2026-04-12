import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import portfolioData from '../data/portfolio.json';

export default function Certifications() {
  const { certifications } = portfolioData;

  return (
    <section id="certifications" className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-12 flex items-center gap-4">
          Certifications
          <div className="h-px bg-border flex-grow ml-4 max-w-xs"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert: any, index: number) => {
            const CardContent = (
              <>
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-text pr-4">{cert.name}</h4>
                  {cert.link && <ExternalLink className="w-5 h-5 text-text/40 group-hover:text-blue-400 shrink-0" />}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-blue-400 font-medium">{cert.issuer}</p>
                  {cert.date && <p className="text-text/60 text-sm">{cert.date}</p>}
                </div>
                {cert.details && (
                  <p className="text-text/60 text-xs mt-3 font-mono bg-slate-500/10 p-2 rounded break-all">
                    {cert.details}
                  </p>
                )}
              </>
            );

            const cardClasses = "block p-6 rounded-xl bg-card border border-border hover:bg-slate-500/10 hover:border-blue-500/30 transition-all group h-full";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {cert.link ? (
                  <a href={cert.link} target="_blank" rel="noreferrer" className={cardClasses}>
                    {CardContent}
                  </a>
                ) : (
                  <div className={cardClasses}>
                    {CardContent}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
