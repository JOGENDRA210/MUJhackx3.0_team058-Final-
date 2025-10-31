import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  BookOpen,
  Search,
  Star,
  Clock,
  Play,
  CheckCircle,
  Filter,
  Plus,
  ExternalLink,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../components/ui/use-toast";

export default function LearningPath() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => base44.entities.StudentProfile.list(),
    initialData: [],
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => base44.entities.CareerRecommendation.list('-match_score', 3),
    initialData: [],
  });

  const { data: learningResources } = useQuery({
    queryKey: ['learningResources'],
    queryFn: () => base44.entities.LearningResource.list(),
    initialData: [],
  });

  const userProfile = profile[0];

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LearningResource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningResources'] });
    },
  });

  const generateResourcesMutation = useMutation({
    mutationFn: async () => {
      const skills = recommendations
        .flatMap(r => r.required_skills || [])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a curated list of 12 high-quality learning resources for these skills: ${skills.join(', ')}.

For each resource, provide:
- Title: Actual course/resource name
- Provider: Real platform (Coursera, Udemy, freeCodeCamp, YouTube, etc.)
- Skill covered: Primary skill taught
- Difficulty level: beginner, intermediate, or advanced
- Duration: Realistic time estimate
- URL: Use placeholder format like https://www.coursera.org/learn/[course-name]
- Resource type: course, tutorial, certification, etc.
- Cost: free, paid, or subscription
- Rating: 3.5-5.0

Make recommendations diverse across different platforms and include both free and paid options.`,
        response_json_schema: {
          type: "object",
          properties: {
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  provider: { type: "string" },
                  skill_covered: { type: "string" },
                  difficulty_level: { type: "string" },
                  duration: { type: "string" },
                  url: { type: "string" },
                  resource_type: { type: "string" },
                  cost: { type: "string" },
                  rating: { type: "number" }
                }
              }
            }
          }
        }
      });

      return response.resources;
    },
    onSuccess: async (resources) => {
      for (const resource of resources) {
        await base44.entities.LearningResource.create({
          ...resource,
          is_completed: false,
          progress: 0
        });
      }
      queryClient.invalidateQueries({ queryKey: ['learningResources'] });
    },
  });

  const handleGenerateResources = async () => {
    setIsGenerating(true);
    try {
      await generateResourcesMutation.mutateAsync();
      toast({
        title: "Resources Generated!",
        description: "Personalized learning resources have been added to your path.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate resources. Please try again.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const markAsStarted = (resource) => {
    if (resource.progress === 0) {
      updateProgressMutation.mutate({
        id: resource.id,
        data: { ...resource, progress: 5 }
      });
    }
  };

  const filteredResources = learningResources.filter(resource => {
    const matchesSearch = resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.skill_covered?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || resource.difficulty_level === difficultyFilter;
    const matchesCost = costFilter === 'all' || resource.cost === costFilter;
    return matchesSearch && matchesDifficulty && matchesCost;
  });

  const inProgress = filteredResources.filter(r => r.progress > 0 && r.progress < 100);
  const completed = filteredResources.filter(r => r.is_completed);

  const difficultyColors = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700"
  };

  const costColors = {
    free: "bg-blue-100 text-blue-700",
    paid: "bg-purple-100 text-purple-700",
    subscription: "bg-orange-100 text-orange-700"
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Learning Path</h1>
            <p className="text-gray-600">Curated courses and resources for your career goals</p>
          </div>
          {learningResources.length === 0 && recommendations.length > 0 && (
            <Button
              onClick={handleGenerateResources}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Resources
                </>
              )}
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search courses and resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Tabs value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <TabsList>
                <TabsTrigger value="all">All Levels</TabsTrigger>
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={costFilter} onValueChange={setCostFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="free">Free</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </motion.div>

      {learningResources.length === 0 ? (
        <Card className="border-none shadow-lg text-center p-12">
          <BookOpen className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Learning Resources Yet</h2>
          <p className="text-gray-600 mb-6">
            {recommendations.length > 0
              ? "Generate personalized learning resources based on your career recommendations"
              : "Complete your assessment to get career recommendations and learning resources"}
          </p>
          <Button
            onClick={() => window.location.href = recommendations.length > 0 ? '#' : '/assessment'}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {recommendations.length > 0 ? 'Generate Resources' : 'Take Assessment'}
          </Button>
        </Card>
      ) : (
        <>
          {/* Progress Summary */}
          {(inProgress.length > 0 || completed.length > 0) && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">In Progress</p>
                      <p className="text-3xl font-bold text-blue-600">{inProgress.length}</p>
                    </div>
                    <Play className="w-10 h-10 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{completed.length}</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Resources</p>
                      <p className="text-3xl font-bold text-purple-600">{learningResources.length}</p>
                    </div>
                    <BookOpen className="w-10 h-10 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={costColors[resource.cost]} variant="outline">
                        {resource.cost}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{resource.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                    <CardDescription className="text-sm">{resource.provider}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className={difficultyColors[resource.difficulty_level]} variant="secondary">
                          {resource.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {resource.resource_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{resource.duration}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>Skill:</strong> {resource.skill_covered}
                      </p>
                      
                      {resource.progress > 0 && (
                        <div className="space-y-1">
                          <Progress value={resource.progress} className="h-2" />
                          <p className="text-xs text-gray-600">{resource.progress}% complete</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {resource.is_completed ? (
                        <Button variant="outline" className="flex-1" disabled>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Completed
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => markAsStarted(resource)}
                          >
                            {resource.progress > 0 ? 'Continue' : 'Start'}
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <Card className="border-none shadow-lg text-center p-12">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}