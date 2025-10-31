export const createPageUrl = (page) => {
  const routes = {
    Dashboard: '/',
    Profile: '/profile',
    Assessment: '/assessment',
    CareerExplorer: '/career-explorer',
    LearningPath: '/learning-path',
    Portfolio: '/portfolio',
    SkillsRoadmap: '/skills-roadmap',
    Analytics: '/analytics'
  };
  return routes[page] || '/';
};
