import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Circle,
  Zap,
  Sparkles,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

export default function SkillsRoadmap() {
  const queryClient = useQueryClient();
  const [selectedCareer, setSelectedCareer] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => base44.entities.StudentProfile.list(),
    initialData: [],
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => base44.entities.CareerRecommendation.list('-match_score'),
    initialData: [],
  });

  const userProfile = profile[0];
  const topRecommendations = recommendations.filter(r => r.is_favorite).length > 0
    ? recommendations.filter(r => r.is_favorite)
    : recommendations.slice(0, 5);

  const getSkillStatus = (skill) => {
    const userSkills = userProfile?.skills || [];
    const userSkill = userSkills.find(s => s.name.toLowerCase().includes(skill.toLowerCase()));
    return userSkill ? userSkill.proficiency : null;
  };

  const calculateProgress = (career) => {
    if (!userProfile?.skills) return 0;
    const required = career.required_skills || [];
    const learned = required.filter(skill => getSkillStatus(skill));
    return required.length > 0 ? (learned.length / required.length) * 100 : 0;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      essential: "bg-red-100 text-red-700 border-red-300",
      important: "bg-yellow-100 text-yellow-700 border-yellow-300",
      nice_to_have: "bg-blue-100 text-blue-700 border-blue-300"
    };
    return colors[priority] || colors.important;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Skills Roadmap</h1>
        <p className="text-gray-600">Track your progress and plan your skill development journey</p>
      </motion.div>

      {!userProfile ? (
        <Card className="border-none shadow-lg text-center p-12">
          <Target className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Complete Your Profile First</h2>
          <p className="text-gray-600 mb-6">
            We need to know your current skills to create a personalized roadmap
          </p>
          <Button
            onClick={() => window.location.href = '/profile'}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Go to Profile
          </Button>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card className="border-none shadow-lg text-center p-12">
          <Sparkles className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Career Recommendations Yet</h2>
          <p className="text-gray-600 mb-6">
            Take the assessment to get personalized career and skill recommendations
          </p>
          <Button
            onClick={() => window.location.href = '/assessment'}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Take Assessment
          </Button>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Career Selection */}
          <div className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Select Target Career</CardTitle>
                <CardDescription>Choose a career to view its skill roadmap</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topRecommendations.map((career) => (
                  <motion.div
                    key={career.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedCareer?.id === career.id
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedCareer(career)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">{career.career_title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {career.match_score}%
                          </Badge>
                        </div>
                        <Progress value={calculateProgress(career)} className="h-1.5 mb-2" />
                        <p className="text-xs text-gray-600">
                          {Math.round(calculateProgress(career))}% skills acquired
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Overall Progress */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Skills Acquired</span>
                    <span className="font-semibold">{userProfile.skills?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Projects Completed</span>
                    <span className="font-semibold">{userProfile.projects?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roadmap Details */}
          <div className="lg:col-span-2">
            {selectedCareer ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Career Header */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{selectedCareer.career_title}</CardTitle>
                        <CardDescription className="text-base">
                          {selectedCareer.description}
                        </CardDescription>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-none text-lg px-4 py-2">
                        {selectedCareer.match_score}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Overall Progress</p>
                      <Progress value={calculateProgress(selectedCareer)} className="h-3" />
                      <p className="text-sm font-semibold text-purple-600">
                        {Math.round(calculateProgress(selectedCareer))}% Complete
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Path */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Learning Path
                    </CardTitle>
                    <CardDescription>
                      Step-by-step skills to master for this career
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCareer.learning_path && selectedCareer.learning_path.length > 0 ? (
                        selectedCareer.learning_path.map((item, index) => {
                          const status = getSkillStatus(item.skill);
                          const isAcquired = status !== null;

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                isAcquired
                                  ? 'bg-green-50 border-green-300'
                                  : 'bg-white border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  isAcquired
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {isAcquired ? (
                                    <CheckCircle className="w-6 h-6" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className={`font-semibold ${isAcquired ? 'line-through text-gray-600' : ''}`}>
                                      {item.skill}
                                    </h3>
                                    <Badge className={getPriorityColor(item.priority)} variant="outline">
                                      <Zap className="w-3 h-3 mr-1" />
                                      {item.priority?.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {item.estimated_time}
                                    </span>
                                    {isAcquired && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        {status} level
                                      </Badge>
                                    )}
                                  </div>
                                  {!isAcquired && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="mt-3 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                                      onClick={() => window.location.href = '/learning-path'}
                                    >
                                      <BookOpen className="w-4 h-4 mr-2" />
                                      Find Courses
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        // Fallback to required skills if no learning path
                        selectedCareer.required_skills?.map((skill, index) => {
                          const status = getSkillStatus(skill);
                          const isAcquired = status !== null;

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`p-4 rounded-xl border-2 ${
                                isAcquired
                                  ? 'bg-green-50 border-green-300'
                                  : 'bg-white border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {isAcquired ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                  ) : (
                                    <Circle className="w-6 h-6 text-gray-300" />
                                  )}
                                  <span className={`font-medium ${isAcquired ? 'line-through text-gray-600' : ''}`}>
                                    {skill}
                                  </span>
                                </div>
                                {isAcquired && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    {status}
                                  </Badge>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={() => window.location.href = '/learning-path'}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Browse Courses
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = '/portfolio'}
                      >
                        Start Project
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-none shadow-lg h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Select a career to view its skill roadmap</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}