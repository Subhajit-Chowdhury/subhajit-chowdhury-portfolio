import portfolioData from '../data/portfolio.json';

type ExperienceRecord = {
  dates: string;
};

const parseStartDate = (dates: string): Date | null => {
  const startPart = dates.split('–')[0]?.trim();
  if (!startPart) {
    return null;
  }

  const parsed = new Date(startPart);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function getExperienceYears(experience: ExperienceRecord[] = portfolioData.experience): number {
  const startDates = experience
    .map((record) => parseStartDate(record.dates))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (!startDates.length) {
    return 0;
  }

  const earliest = startDates[0];
  const now = new Date();
  const diffMs = now.getTime() - earliest.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(years);
}
