import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import portfolioData from '../data/portfolio.json';

export default function Experience() {
  const { experience } = portfolioData;

  return (
    <section id="experience" className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-12 flex items-center gap-4">
          Experience
          <div className="h-px bg-border flex-grow ml-4 max-w-xs"></div>
        </h2>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {experience.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg bg-blue-500/20 text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Briefcase className="w-4 h-4" />
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-card border border-border backdrop-blur-sm hover:border-blue-500/30 transition-colors">
                <div className="flex flex-col gap-1 mb-4">
                  <h3 className="text-xl font-bold text-text">{job.role}</h3>
                  <h4 className="text-lg text-blue-400 font-medium">{job.company}</h4>
                  <div className="flex flex-wrap gap-4 text-sm text-text/60 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {job.dates}
                      {'duration' in job && (job as { duration?: string }).duration
                        ? ` · ${(job as { duration?: string }).duration}`
                        : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                      {'work_mode' in job && (job as { work_mode?: string }).work_mode
                        ? ` · ${(job as { work_mode?: string }).work_mode}`
                        : ''}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 text-text/80 text-sm md:text-base">
                  {job.bullets.map((bullet, i) => {
                    // Highlight numbers/metrics but ignore numbers inside words (like S3)
                    const highlightedBullet = bullet.replace(/(~?\b\d+[-–]\d+\s*(?:GB|%)?|~?\b\d+\+?%?)/g, '<span class="text-blue-500 font-semibold">$&</span>');
                    
                    return (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-400 mt-1.5">▹</span>
                        <span dangerouslySetInnerHTML={{ __html: highlightedBullet }} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
