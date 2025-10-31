import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Briefcase, 
  Award,
  ArrowRight,
  Sparkles,
  Brain,
  Rocket
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const { data: profile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      // Try base44 first, fallback to MockAPI session
      let profiles = [];
      try {
        profiles = await base44.entities.StudentProfile.list();
      } catch (e) {
        // ignore
      }
      if (!profiles || profiles.length === 0) {
        try {
          const { MockAPI } = await import('../api/MockAPI');
          const p = await MockAPI.getStudentProfile();
          profiles = p ? [p] : [];
        } catch (e) {
          profiles = [];
        }
      }
      return profiles || [];
    },
    initialData: [],
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => base44.entities.CareerRecommendation.list('-match_score', 5),
    initialData: [],
  });

  const { data: learningResources } = useQuery({
    queryKey: ['learningResources'],
    queryFn: () => base44.entities.LearningResource.list(),
    initialData: [],
  });

  const { data: portfolioProjects } = useQuery({
    queryKey: ['portfolioProjects'],
    queryFn: () => base44.entities.PortfolioProject.list(),
    initialData: [],
  });

  const userProfile = profile[0];
  const inProgressResources = learningResources.filter(r => r.progress > 0 && r.progress < 100);
  const activeProjects = portfolioProjects.filter(p => p.status === 'in_progress' || p.status === 'planning');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Logout Button */}
      <div className="absolute top-4 left-4">
        {userProfile && (
          <button
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition-all"
            onClick={async () => {
              const { MockAPI } = await import('../api/MockAPI');
              await MockAPI.logoutProfileSession();
              navigate('/profile');
            }}
          >
            Logout
          </button>
        )}
      </div>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Your personalized career journey awaits
            </p>
          </div>
          {!userProfile && (
            <Link to={createPageUrl("Profile")}>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Your Profile
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Career Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recommendations.length}</div>
              <p className="text-xs opacity-75 mt-1">AI-powered recommendations</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Learning Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inProgressResources.length}</div>
              <p className="text-xs opacity-75 mt-1">Courses in progress</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Portfolio Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeProjects.length}</div>
              <p className="text-xs opacity-75 mt-1">Active projects</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Skills Acquired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userProfile?.skills?.length || 0}</div>
              <p className="text-xs opacity-75 mt-1">Skills in your arsenal</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Top Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Top Career Matches
                  </CardTitle>
                  <CardDescription>AI-recommended paths based on your profile</CardDescription>
                </div>
                <Link to={createPageUrl("CareerExplorer")}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{rec.career_title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{rec.description}</p>
                      </div>
                      <Badge className="ml-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-none">
                        {rec.match_score}% Match
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {rec.job_demand} demand
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ${rec.average_salary?.entry_level?.toLocaleString()}+
                      </Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Rocket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Complete your profile to get personalized recommendations</p>
                  <Link to={createPageUrl("Profile")}>
                    <Button variant="outline">Go to Profile</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Portfolio Projects */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Active Projects
                  </CardTitle>
                  <CardDescription>Build your portfolio step by step</CardDescription>
                </div>
                <Link to={createPageUrl("Portfolio")}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeProjects.length > 0 ? (
                activeProjects.slice(0, 3).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{project.project_name}</h3>
                      <Badge variant="outline" className={
                        project.status === 'in_progress' ? 'border-green-300 text-green-700' : 'border-blue-300 text-blue-700'
                      }>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Progress value={project.progress_percentage} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600">{project.progress_percentage}% complete</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No active projects yet</p>
                  <Link to={createPageUrl("Portfolio")}>
                    <Button variant="outline" size="sm">
                      Start Building
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Learning Progress */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Learning Progress
              </CardTitle>
              <CardDescription>Your current courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inProgressResources.length > 0 ? (
                inProgressResources.slice(0, 5).map((resource) => (
                  <div key={resource.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{resource.title}</p>
                        <p className="text-xs text-gray-500">{resource.provider}</p>
                      </div>
                    </div>
                    <Progress value={resource.progress} className="h-1.5" />
                    <p className="text-xs text-gray-600">{resource.progress}% complete</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-3">No courses in progress</p>
                  <Link to={createPageUrl("LearningPath")}>
                    <Button variant="outline" size="sm">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={createPageUrl("Assessment")}>
                <Button variant="outline" className="w-full justify-start hover:bg-white hover:shadow-md transition-all">
                  <Brain className="w-4 h-4 mr-2" />
                  Take Career Assessment
                </Button>
              </Link>
              <Link to={createPageUrl("SkillsRoadmap")}>
                <Button variant="outline" className="w-full justify-start hover:bg-white hover:shadow-md transition-all">
                  <Target className="w-4 h-4 mr-2" />
                  View Skills Roadmap
                </Button>
              </Link>
              <Link to={createPageUrl("Portfolio")}>
                <Button variant="outline" className="w-full justify-start hover:bg-white hover:shadow-md transition-all">
                  <Rocket className="w-4 h-4 mr-2" />
                  Start New Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}