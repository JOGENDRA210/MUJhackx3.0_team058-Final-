import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Assessment from "./pages/Assessment";
import Signup from "./pages/Signup";
import CareerExplorer from "./pages/CareerExplorer";
import LearningPath from "./pages/LearningPath";
import Portfolio from "./pages/Portfolio";
import SkillsRoadmap from "./pages/SkillsRoadmap";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import { Toaster } from "./components/ui/toaster";
import { motion } from "framer-motion";
import { SidebarLayout } from "./components/ui/layout";

// Initialize React Query Client
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <SidebarLayout>{children}</SidebarLayout>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-gray-50"
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment"
              element={
                <ProtectedRoute>
                  <Assessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-explorer"
              element={
                <ProtectedRoute>
                  <CareerExplorer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning-path"
              element={
                <ProtectedRoute>
                  <LearningPath />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills-roadmap"
              element={
                <ProtectedRoute>
                  <SkillsRoadmap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </motion.div>
      </Router>
    </QueryClientProvider>
  );
}
