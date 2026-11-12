export type Experience = {
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
  tech: string[];
};

export const experience: Experience[] = [
  {
    role: "Lecturer",
    company: "Kaduna Polytechnic",
    location: "Kaduna, Nigeria",
    start: "Dec 2017",
    end: "Present",
    bullets: [
      "Teach undergraduate statistics courses and supervise practical lab sessions in applied data analysis.",
      "Guide students on data analysis projects, academic paths, and course content.",
      "Mentor students in statistical software (R, SPSS) and research methodology.",
    ],
    tech: ["R", "SPSS", "Minitab", "Excel"],
  },
  {
    role: "Data Analyst",
    company: "National Productivity Centre",
    location: "Abuja, Nigeria",
    start: "Mar 2023",
    end: "Jun 2023",
    bullets: [
      "Analyzed data on the 'Effect of Naira Redesign on Nigerians' Productivity'.",
      "Analyzed data on the 'Impact of Fuel Scarcity on the Productivity of MSMEs in Nigeria'.",
      "Handled data entry, coding, output processing, interpretation, and reporting.",
    ],
    tech: ["SPSS", "Excel", "R"],
  },
  {
    role: "Data Analyst",
    company: "MicroDevelopment Consulting Limited",
    location: "Abuja, Nigeria",
    start: "Apr 2019",
    end: "May 2019",
    bullets: [
      "Processed and analyzed data for the Galaxy Backbone Customer Survey.",
      "Managed data entry, coding, output processing, interpretation, and reporting.",
    ],
    tech: ["SPSS", "Excel"],
  },
  {
    role: "Data Analyst",
    company: "MicroDevelopment Consulting Limited",
    location: "Abuja, Nigeria",
    start: "Sep 2016",
    end: "Feb 2017",
    bullets: [
      "Processed and analyzed 1,794 questionnaires from the 'Positive Voices Campaign Project's Baseline Survey' across six Nigerian states.",
      "Delivered cleaned datasets, coded outputs, and analytical reports to stakeholders.",
    ],
    tech: ["SPSS", "Excel"],
  },
];

