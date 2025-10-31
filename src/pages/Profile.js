import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MockAPI } from "../api/MockAPI";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Save, Plus, X, Award, Briefcase, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../components/ui/use-toast";

export default function Profile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => Promise.resolve({ full_name: 'Test User' }),
  });

  const { data: profiles } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => MockAPI.getStudentProfile().then(data => [data]),
    initialData: [],
  });

  const existingProfile = profiles[0];
  
  const [formData, setFormData] = useState({
    full_name: '',
    education_level: '',
    field_of_study: '',
    gpa: '',
    interests: [],
    skills: [],
    academic_achievements: [],
    projects: [],
    preferred_work_style: '',
    career_goals: ''
  });

  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'beginner' });
  
  useEffect(() => {
    if (existingProfile) {
      setFormData(existingProfile);
    } else if (user) {
      setFormData(prev => ({ ...prev, full_name: user.full_name }));
    }
  }, [existingProfile, user]);

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Use MockAPI to persist profile in-memory during development
      return MockAPI.createStudentProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      toast({
        title: "Profile Created!",
        description: "Your profile has been successfully created.",
      });
      // Navigate to Career Explorer after successful profile creation
      setTimeout(() => {
        navigate('/career-explorer');
      }, 1000);
    },
    onError: (error) => {
      console.error('Create Error:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      // Use MockAPI to update profile in-memory during development
      return MockAPI.updateStudentProfile(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      toast({
        title: "Profile Updated!",
        description: "Your changes have been saved.",
      });
      // Navigate to Career Explorer after successful profile update
      setTimeout(() => {
        navigate('/career-explorer');
      }, 1000);
    },
    onError: (error) => {
      console.error('Update Error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (existingProfile) {
      updateMutation.mutate({ id: existingProfile.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setFormData(prev => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill]
      }));
      setNewSkill({ name: '', proficiency: 'beginner' });
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-block p-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <div className="bg-white rounded-xl px-6 py-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tell us about yourself to unlock personalized career recommendations and learning paths
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
              <CardHeader className="relative pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Basic Information</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">Your academic background and current status</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education_level" className="text-sm font-semibold text-gray-700">Education Level</Label>
                    <Select
                      value={formData.education_level}
                      onValueChange={(value) => setFormData({ ...formData, education_level: value })}
                    >
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm relative">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent 
                        position="popper" 
                        className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl z-50 shadow-xl"
                        sideOffset={5}
                      >
                        <SelectItem value="high_school" className="hover:bg-purple-50 rounded-lg">High School</SelectItem>
                        <SelectItem value="undergraduate" className="hover:bg-purple-50 rounded-lg">Undergraduate</SelectItem>
                        <SelectItem value="graduate" className="hover:bg-purple-50 rounded-lg">Graduate</SelectItem>
                        <SelectItem value="postgraduate" className="hover:bg-purple-50 rounded-lg">Postgraduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field_of_study" className="text-sm font-semibold text-gray-700">Field of Study</Label>
                    <Input
                      id="field_of_study"
                      value={formData.field_of_study}
                      onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpa" className="text-sm font-semibold text-gray-700">GPA (Optional)</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                      placeholder="4.0 scale"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_work_style" className="text-sm font-semibold text-gray-700">Preferred Work Style</Label>
                  <Select
                    value={formData.preferred_work_style}
                    onValueChange={(value) => setFormData({ ...formData, preferred_work_style: value })}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm relative">
                      <SelectValue placeholder="Select work style" />
                    </SelectTrigger>
                    <SelectContent 
                      position="popper" 
                      className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl z-50 shadow-xl"
                      sideOffset={5}
                    >
                      <SelectItem value="remote" className="hover:bg-purple-50 rounded-lg">Remote</SelectItem>
                      <SelectItem value="hybrid" className="hover:bg-purple-50 rounded-lg">Hybrid</SelectItem>
                      <SelectItem value="onsite" className="hover:bg-purple-50 rounded-lg">Onsite</SelectItem>
                      <SelectItem value="flexible" className="hover:bg-purple-50 rounded-lg">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5"></div>
              <CardHeader className="relative pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Interests & Goals</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">What excites you and where do you want to go?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Add Interests</Label>
                  <div className="flex gap-3">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="e.g., AI, Web Development"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    />
                    <Button
                      type="button"
                      onClick={addInterest}
                      size="lg"
                      className="h-12 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {formData.interests?.map((interest, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="inline-flex"
                      >
                        <Badge className="relative pr-8 py-2 px-4 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-0 rounded-full shadow-sm hover:shadow-md transition-all duration-200">
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeInterest(index)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="career_goals" className="text-sm font-semibold text-gray-700">Career Goals</Label>
                  <Textarea
                    id="career_goals"
                    value={formData.career_goals}
                    onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                    placeholder="Describe your long-term career aspirations..."
                    className="h-32 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5"></div>
              <CardHeader className="relative pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Skills</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">What can you do? Rate your proficiency</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Add Skills</Label>
                  <div className="flex gap-3">
                    <Input
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="Skill name"
                    />
                    <Select
                      value={newSkill.proficiency}
                      onValueChange={(value) => setNewSkill({ ...newSkill, proficiency: value })}
                    >
                      <SelectTrigger className="w-40 h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm relative">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent 
                        position="popper" 
                        className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl z-50 shadow-xl"
                        sideOffset={5}
                      >
                        <SelectItem value="beginner" className="hover:bg-green-50 rounded-lg">Beginner</SelectItem>
                        <SelectItem value="intermediate" className="hover:bg-green-50 rounded-lg">Intermediate</SelectItem>
                        <SelectItem value="advanced" className="hover:bg-green-50 rounded-lg">Advanced</SelectItem>
                        <SelectItem value="expert" className="hover:bg-green-50 rounded-lg">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={addSkill}
                      size="lg"
                      className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.skills?.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                          <span className="font-semibold text-gray-900">{skill.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium border-0 ${
                              skill.proficiency === 'beginner' ? 'bg-blue-100 text-blue-800' :
                              skill.proficiency === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              skill.proficiency === 'advanced' ? 'bg-orange-100 text-orange-800' :
                              'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {skill.proficiency}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex justify-end pt-4"
          >
            <Button
              type="submit"
              size="lg"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="h-14 px-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-5 h-5 mr-3" />
              {existingProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}