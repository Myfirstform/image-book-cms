import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Publications from "./pages/Publications";
import Faculty from "./pages/Faculty";
import Courses from "./pages/Courses";
import Facilities from "./pages/Facilities";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentHome from "./pages/StudentHome";
import StudentResult from "./pages/StudentResult";
import SecondaryAdmission from "./pages/SecondaryAdmission";
import SecondaryAdmissionForm from "./pages/SecondaryAdmissionForm";
import AdmissionClosed from "./pages/AdmissionClosed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/secondary-admission" element={<SecondaryAdmission />} />
          <Route path="/secondary-admission-form" element={<SecondaryAdmissionForm />} />
          <Route path="/admission-closed" element={<AdmissionClosed />} />
          <Route path="/results" element={<StudentHome />} />
          <Route path="/result/:id" element={<StudentResult />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
