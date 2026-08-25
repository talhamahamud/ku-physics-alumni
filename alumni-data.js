/**
 * Khulna University Physics Discipline Alumni Database
 * Curated dataset showcasing alumni in Researcher and Tech, Data & AI domains.
 */

const ALUMNI_DATA = [
  {
    "id": "ku-phy-002",
    "name": "Nusrat Jahan Tania",
    "batch": "14th Batch (2011-12)",
    "session": "2015-2016",
    "title": "Senior Lead Data Scientist & AI Architect",
    "organization": "Brain Station 23 / FinTech Global",
    "location": "Dhaka, Bangladesh",
    "categoryTag": "tech",
    "tags": [
      "Alumni",
      "tech"
    ],
    "gender": "female",
    "kuThesisTopic": "Applied Physics Research",
    "email": "nusrat.tania.ds@gmail.com",
    "linkedin": "https://linkedin.com/in/example-nusrat-ds",
    "scholar": "https://scholar.google.com/citations?user=example-nusrat",
    "facebook": "https://facebook.com/example-nusrat",
    "website": null,
    "researchGate": null,
    "availableForMentorship": true,
    "careerPathway": [
      {
        "year": "2018",
        "event": "B.Sc. in Physics, Khulna University"
      },
      {
        "year": "2020",
        "event": "Joined Brain Station 23 / FinTech Global"
      }
    ],
    "achievements": [
      "Winner of National Data Science Hackathon 2020",
      "Keynote Speaker at PyCon Bangladesh",
      "Mentored 30+ Physics undergrads into Software/ML jobs"
    ],
    "image": "https://i.ibb.co.com/67ZH0hgL/cgpa.png",
    "phone": "+8801913337269"
  },
  {
    "id": "ku-phy-004",
    "name": "Fahim Shahriar",
    "batch": "17th Batch (2014-15)",
    "session": "2014-2015",
    "title": "Senior DevOps & Cloud Solutions Architect",
    "organization": "Chaldal Tech / AWS Partner",
    "location": "Dhaka, Bangladesh",
    "categoryTag": "tech",
    "tags": [
      "Tech, Data & AI",
      "DevOps",
      "Cloud Architecture",
      "AWS",
      "Linux"
    ],
    "gender": "male",
    "kuThesisTopic": "Parallel Computing Simulations of N-Body Celestial Mechanics",
    "email": "fahim.devops@gmail.com",
    "linkedin": "https://linkedin.com/in/example-fahim-devops",
    "scholar": null,
    "facebook": "https://facebook.com/example-fahim",
    "website": "https://fahim-devops.io",
    "researchGate": null,
    "availableForMentorship": true,
    "careerPathway": [
      {
        "year": "2018",
        "event": "B.Sc. in Physics, Khulna University"
      },
      {
        "year": "2020",
        "event": "M.Sc. in Computational Physics, Khulna University"
      },
      {
        "year": "2021",
        "event": "System Administrator at Software House"
      },
      {
        "year": "2023-Present",
        "event": "Senior DevOps Engineer"
      }
    ],
    "achievements": [
      "AWS Certified Solutions Architect Professional",
      "Open Source contributor to Linux Kernel tools"
    ]
  },
  {
    "id": "ku-phy-005",
    "name": "Tamim Iqbal",
    "batch": "18th Batch (2015-16)",
    "session": "2015-2016",
    "title": "Master Scholar in Renewable Energy & Photovoltaics",
    "organization": "University of Cambridge / Erasmus Mundus",
    "location": "Cambridge, United Kingdom",
    "categoryTag": "study-abroad",
    "tags": [
      "Researcher",
      "UK Masters",
      "Solar Physics",
      "Erasmus Mundus",
      "Cambridge"
    ],
    "gender": "male",
    "kuThesisTopic": "Efficiency Enhancement of Perovskite Solar Cells using Plasmonic Nanoparticles",
    "email": "tamim.phy@cam.ac.uk",
    "linkedin": "https://linkedin.com/in/example-tamim-cam",
    "scholar": "https://scholar.google.com/citations?user=example-tamim",
    "facebook": "https://facebook.com/example-tamim",
    "website": null,
    "researchGate": null,
    "availableForMentorship": true,
    "careerPathway": [
      {
        "year": "2019",
        "event": "B.Sc. in Physics, Khulna University (1st Class 2nd)"
      },
      {
        "year": "2021",
        "event": "M.Sc. in Physics, Khulna University"
      },
      {
        "year": "2022",
        "event": "Awarded Fully Funded Erasmus Mundus Master Scholarship"
      },
      {
        "year": "2023-Present",
        "event": "Researching Perovskite Materials in UK"
      }
    ],
    "achievements": [
      "Erasmus Mundus Scholar 2022",
      "Best B.Sc. Thesis Award in KU Science Faculty",
      "IELTS Score 8.5/9.0"
    ]
  }
];

// Career tracks database for freshers (Study Abroad & Tech/Data/AI)
const GUIDANCE_ROADMAP = [
  {
    "id": "study-abroad-track",
    "category": "Researcher (USA, EU, Japan, UK)",
    "summary": "Roadmap to securing fully-funded PhD & Master's scholarships in top international universities.",
    "steps": [
      {
        "title": "1st & 2nd Year",
        "detail": "Focus intensely on core Physics subjects (Mechanics, Electrodynamics, Quantum Physics). Maintain a strong academic GPA."
      },
      {
        "title": "3rd Year",
        "detail": "Join a research lab under KU Physics faculty. Learn computational tools (Python, MATLAB, LaTeX) and begin IELTS/TOEFL preparation."
      },
      {
        "title": "4th Year & Thesis",
        "detail": "Aim to present or publish your thesis research. Prepare for GRE & Physics GRE if applying to US universities."
      },
      {
        "title": "Application Phase",
        "detail": "Draft your Statement of Purpose (SOP), secure letters of recommendation, and contact potential research advisors abroad."
      }
    ],
    "alumniContacts": [
      "Dr. Rahat Hossain (Max Planck)",
      "Sabbir Hossain (UT Austin)",
      "Tamim Iqbal (Cambridge)"
    ]
  },
  {
    "id": "tech-data-track",
    "category": "Tech, Data Science & AI",
    "summary": "Transitioning analytical problem-solving skills into Software Engineering, Data Science, and Machine Learning.",
    "steps": [
      {
        "title": "1st & 2nd Year",
        "detail": "Master Python programming alongside your numerical physics lab work. Learn basic Data Structures & Algorithms."
      },
      {
        "title": "3rd Year",
        "detail": "Choose computational physics or data modeling for your thesis. Practice SQL, Pandas, Scikit-Learn, and build project repositories."
      },
      {
        "title": "4th Year",
        "detail": "Participate in Kaggle competitions or open-source projects. Build a developer portfolio website & LinkedIn profile."
      },
      {
        "title": "Job Hunt Phase",
        "detail": "Apply for Data Analyst, ML Trainee, or DevOps roles. Highlight quantitative modeling and analytical strengths."
      }
    ],
    "alumniContacts": [
      "Nusrat Jahan Tania (Lead Data Scientist)",
      "Fahim Shahriar (DevOps Lead)",
      "Arik Rahman (ML Engineer)"
    ]
  }
];
