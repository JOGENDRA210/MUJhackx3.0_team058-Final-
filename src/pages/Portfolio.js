import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import {
  FolderKanban,
  Plus,
  X,
  CheckCircle,
  Clock,
  Lightbulb,
  Code,
  ExternalLink,
  Trash2,
  Loader2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../components/ui/use-toast";

export default function Portfolio() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    target_career: '',
    skills_demonstrated: [],
    status: 'idea',
    technologies_used: [],
    github_url: '',
    live_demo_url: '',
    impact_metrics: ''
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => base44.entities.CareerRecommendation.list('-match_score', 5),
    initialData: [],
  });

  const { data: projects } = useQuery({
    queryKey: ['portfolioProjects'],
    queryFn: () => base44.entities.PortfolioProject.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PortfolioProject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioProjects'] });
      resetForm();
      toast({ title: "Project Created!", description: "Your portfolio project has been added." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PortfolioProject.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioProjects'] });
      resetForm();
      toast({ title: "Project Updated!", description: "Your changes have been saved." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PortfolioProject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioProjects'] });
      toast({ title: "Project Deleted", description: "The project has been removed." });
    },
  });

  const generateRoadmap = async (career) => {
    setIsGeneratingRoadmap(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a detailed project roadmap for a portfolio project targeting this career: ${career}.

Create 8-10 specific, actionable steps that would demonstrate relevant skills for this role.
Each step should be clear, measurable, and realistic for a student/early professional.`,
        response_json_schema: {
          type: "object",
          properties: {
            roadmap: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "string" },
                  description: { type: "string" },
                  completed: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      setFormData(prev => ({ ...prev, roadmap: response.roadmap }));
      toast({ title: "Roadmap Generated!", description: "AI has created a step-by-step plan for your project." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate roadmap.", variant: "destructive" });
    }
    setIsGeneratingRoadmap(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      skills_demonstrated: formData.skills_demonstrated.filter(s => s.trim()),
      technologies_used: formData.technologies_used.filter(t => t.trim()),
      start_date: formData.start_date || new Date().toISOString().split('T')[0],
      progress_percentage: calculateProgress(formData.roadmap)
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const resetForm = () => {
    setFormData({
      project_name: '',
      description: '',
      target_career: '',
      skills_demonstrated: [],
      status: 'idea',
      technologies_used: [],
      github_url: '',
      live_demo_url: '',
      impact_metrics: '',
      roadmap: []
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const editProject = (project) => {
    setFormData(project);
    setEditingProject(project);
    setShowForm(true);
  };

  const toggleRoadmapStep = (index) => {
    const newRoadmap = [...(formData.roadmap || [])];
    newRoadmap[index] = { ...newRoadmap[index], completed: !newRoadmap[index].completed };
    setFormData({ ...formData, roadmap: newRoadmap });
  };

  const calculateProgress = (roadmap) => {
    if (!roadmap || roadmap.length === 0) return 0;
    const completed = roadmap.filter(step => step.completed).length;
    return Math.round((completed / roadmap.length) * 100);
  };

  const statusColors = {
    idea: "bg-gray-100 text-gray-700",
    planning: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    published: "bg-purple-100 text-purple-700"
  };

  const statusIcons = {
    idea: Lightbulb,
    planning: Clock,
    in_progress: Code,
    completed: CheckCircle,
    published: ExternalLink
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Portfolio Builder</h1>
            <p className="text-gray-600">Build projects that showcase your skills and stand out</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</CardTitle>
                <CardDescription>Define your project and let AI generate a roadmap</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project_name">Project Name *</Label>
                      <Input
                        id="project_name"
                        value={formData.project_name}
                        onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                        placeholder="e.g., E-commerce Platform"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_career">Target Career *</Label>
                      <Select
                        value={formData.target_career}
                        onValueChange={(value) => {
                          setFormData({ ...formData, target_career: value });
                          if (value && !formData.roadmap?.length) {
                            generateRoadmap(value);
                          }
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select career" />
                        </SelectTrigger>
                        <SelectContent>
                          {recommendations.map((rec) => (
                            <SelectItem key={rec.id} value={rec.career_title}>
                              {rec.career_title}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your project goals and features..."
                      className="h-24"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="github_url">GitHub URL</Label>
                      <Input
                        id="github_url"
                        value={formData.github_url}
                        onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  {/* Project Roadmap */}
                  {formData.roadmap && formData.roadmap.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Project Roadmap</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => generateRoadmap(formData.target_career)}
                          disabled={isGeneratingRoadmap || !formData.target_career}
                        >
                          {isGeneratingRoadmap ? (
                            <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Generating...</>
                          ) : (
                            <><Sparkles className="w-3 h-3 mr-2" />Regenerate</>
                          )}
                        </Button>
                      </div>
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                        {formData.roadmap.map((step, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
                            onClick={() => toggleRoadmapStep(index)}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                              step.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {step.completed && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                {step.step}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Progress: {calculateProgress(formData.roadmap)}% complete
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {editingProject ? 'Update Project' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="border-none shadow-lg text-center p-12">
          <FolderKanban className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Projects Yet</h2>
          <p className="text-gray-600 mb-6">
            Start building your portfolio with projects that showcase your skills
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Create Your First Project
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const StatusIcon = statusIcons[project.status];
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={statusColors[project.status]} variant="secondary">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => deleteMutation.mutate(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-xl leading-tight">{project.project_name}</CardTitle>
                    <CardDescription>{project.target_career}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4 mb-4">
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      )}
                      
                      {project.roadmap && project.roadmap.length > 0 && (
                        <div>
                          <Progress value={project.progress_percentage || 0} className="h-2 mb-2" />
                          <p className="text-xs text-gray-600">
                            {project.roadmap.filter(s => s.completed).length} / {project.roadmap.length} steps completed
                          </p>
                        </div>
                      )}

                      {project.technologies_used && project.technologies_used.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.technologies_used.slice(0, 4).map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => editProject(project)}
                      >
                        Edit
                      </Button>
                      {project.github_url && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => window.open(project.github_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}