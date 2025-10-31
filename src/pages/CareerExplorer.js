import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  TrendingUp, 
  DollarSign, 
  Heart, 
  Search,
  Briefcase,
  Target,
  ArrowRight,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

export default function CareerExplorer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCareer, setSelectedCareer] = useState(null);

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      // Try base44 first, fallback to MockAPI if empty
      let recs = [];
      try {
        recs = await base44.entities.CareerRecommendation.list('-match_score');
      } catch (e) {
        // ignore
      }
      if (!recs || recs.length === 0) {
        try {
          const { MockAPI } = await import('../api/MockAPI');
          recs = await MockAPI.getCareerRecommendations();
        } catch (e) {
          recs = [];
        }
      }
      return recs || [];
    },
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        return await base44.entities.CareerRecommendation.update(id, data);
      } catch (e) {
        // fallback to MockAPI
        const { MockAPI } = await import('../api/MockAPI');
        return await MockAPI.updateCareerRecommendation(id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const toggleFavorite = (career) => {
    updateMutation.mutate({
      id: career.id,
      data: { ...career, is_favorite: !career.is_favorite }
    });
  };

  const filteredCareers = recommendations.filter(career =>
    career.career_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    career.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDemandColor = (demand) => {
    const colors = {
      low: "bg-gray-100 text-gray-700",
      moderate: "bg-blue-100 text-blue-700",
      high: "bg-green-100 text-green-700",
      very_high: "bg-purple-100 text-purple-700"
    };
    return colors[demand] || colors.moderate;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Career Explorer</h1>
        <p className="text-gray-600">Discover careers that match your profile and aspirations</p>
      </motion.div>

      {/* Search */}
      <Card className="border-none shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search careers..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {recommendations.length === 0 ? (
        <Card className="border-none shadow-lg text-center p-12">
          <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Recommendations Yet</h2>
          <p className="text-gray-600 mb-6">
            Complete your profile and take the assessment to get personalized career recommendations
          </p>
          <Button
            onClick={() => navigate('/assessment')}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Take Assessment
          </Button>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Career List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredCareers.map((career, index) => (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`border-none shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                    selectedCareer?.id === career.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedCareer(career)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          {career.career_title}
                          {career.match_score >= 80 && (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {career.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(career);
                        }}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            career.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                          }`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-none">
                        {career.match_score}% Match
                      </Badge>
                      <Badge className={getDemandColor(career.job_demand)}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {career.job_demand?.replace('_', ' ')} demand
                      </Badge>
                      {career.average_salary?.entry_level && (
                        <Badge variant="outline">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${career.average_salary.entry_level.toLocaleString()}+
                        </Badge>
                      )}
                      {career.growth_rate && (
                        <Badge variant="outline">
                          📈 {career.growth_rate} growth
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {career.required_skills?.slice(0, 4).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {career.required_skills?.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{career.required_skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Career Details Sidebar */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            {selectedCareer ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">{selectedCareer.career_title}</CardTitle>
                    <CardDescription>Career Details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Salary Range */}
                    {selectedCareer.average_salary && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          Salary Range
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Entry Level</span>
                            <span className="font-semibold">
                              ${selectedCareer.average_salary.entry_level?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mid Level</span>
                            <span className="font-semibold">
                              ${selectedCareer.average_salary.mid_level?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Senior Level</span>
                            <span className="font-semibold">
                              ${selectedCareer.average_salary.senior_level?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Required Skills */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCareer.required_skills?.map((skill, i) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Learning Path */}
                    {selectedCareer.learning_path && selectedCareer.learning_path.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Learning Path</h3>
                        <div className="space-y-2">
                          {selectedCareer.learning_path.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                item.priority === 'essential' ? 'bg-red-100 text-red-700' :
                                item.priority === 'important' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.skill}</p>
                                <p className="text-xs text-gray-500">{item.estimated_time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Companies */}
                    {selectedCareer.key_companies && selectedCareer.key_companies.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Top Hiring Companies</h3>
                        <div className="space-y-1 text-sm">
                          {selectedCareer.key_companies.map((company, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Briefcase className="w-3 h-3 text-gray-400" />
                              <span>{company}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Roles */}
                    {selectedCareer.related_roles && selectedCareer.related_roles.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Related Roles</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCareer.related_roles.map((role, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={() => window.location.href = '/skills-roadmap'}
                    >
                      View Skills Roadmap
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6 text-center text-gray-500">
                  Select a career to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}