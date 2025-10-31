import assessment from "../entities/Assessment.json";
import recommendations from "../entities/CareerRecommendation.json";
import learningResources from "../entities/LearningResource.json";
import portfolioProjects from "../entities/PortfolioProject.json";
import studentProfile from "../entities/StudentProfile.json";

// Enhanced mock data for institutional analytics
const institutionalAnalytics = {
  totalStudents: 1250,
  activeStudents: 890,
  completedAssessments: 650,
  popularCareers: [
    { career: "Software Engineer", count: 120 },
    { career: "Data Scientist", count: 95 },
    { career: "UX Designer", count: 85 },
    { career: "Product Manager", count: 70 },
    { career: "Marketing Specialist", count: 60 }
  ],
  skillGaps: [
    { skill: "Machine Learning", gap: 45 },
    { skill: "Cloud Computing", gap: 38 },
    { skill: "UI/UX Design", gap: 32 },
    { skill: "Data Analysis", gap: 28 }
  ],
  graduationTrends: [
    { year: "2022", rate: 85 },
    { year: "2023", rate: 88 },
    { year: "2024", rate: 92 }
  ]
};

// In-memory mutable data for development
let _studentProfile = Array.isArray(studentProfile) ? studentProfile[0] : studentProfile || null;
let _profileSessionActive = false;
let _recommendations = Array.isArray(recommendations) ? recommendations : [];
let _learningResources = Array.isArray(learningResources) ? learningResources : [];
let _portfolioProjects = Array.isArray(portfolioProjects) ? portfolioProjects : [];
let _assessments = Array.isArray(assessment) ? assessment : [];


export const MockAPI = {
  getStudentProfile: () => {
    if (_profileSessionActive && _studentProfile) {
      return Promise.resolve(_studentProfile);
    }
    return Promise.resolve(null);
  },
  createStudentProfile: (data) => {
    _studentProfile = { id: Date.now().toString(), ...data };
    _profileSessionActive = true;
    return Promise.resolve(_studentProfile);
  },
  updateStudentProfile: (id, data) => {
    _studentProfile = { ...( _studentProfile || {} ), ...data };
    _profileSessionActive = true;
    return Promise.resolve(_studentProfile);
  },
  logoutProfileSession: () => {
    _profileSessionActive = false;
    return Promise.resolve();
  },
  getCareerRecommendations: () => Promise.resolve(_recommendations),
  createCareerRecommendations: (items) => {
    _recommendations = [..._recommendations, ...(items || [])];
    return Promise.resolve(items);
  },
  getLearningResources: () => Promise.resolve(_learningResources),
  getAssessment: () => Promise.resolve(_assessments),
  createAssessment: (data) => {
    const item = { id: Date.now().toString(), ...data };
    _assessments = [..._assessments, item];
    return Promise.resolve(item);
  },
  getPortfolioProjects: () => Promise.resolve(_portfolioProjects),
  getInstitutionalAnalytics: () => Promise.resolve(institutionalAnalytics),
  // Mock external API for industry data
  getIndustryData: (career) => Promise.resolve({
    jobDemand: "high",
    averageSalary: {
      entry_level: 75000,
      mid_level: 95000,
      senior_level: 125000
    },
    growthRate: "12%",
    keyCompanies: ["Google", "Microsoft", "Amazon", "Meta"],
    emergingSkills: ["AI/ML", "Cloud Computing", "Cybersecurity"]
  })
};
export default MockAPI;
