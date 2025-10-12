// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Layout from "@/pages/Layout.jsx";

import Home from "@/pages/Home";
import WhyAttend from "@/pages/WhyAttend";
import Exhibitors from "@/pages/Exhibitors";
import Schedule from "@/pages/Schedule";
import Venue from "@/pages/Venue";
import FAQs from "@/pages/FAQs";
import Register from "@/pages/Register";
import RegistrationSuccess from "@/pages/RegistrationSuccess";

import CMSLogin from "@/pages/cms-login";
import CMSDashboard from "@/pages/cms-dashboard";
import AuthGuard from "@/components/admin/AuthGuard";

function useCurrentPageName() {
  const { pathname } = useLocation();
  let slug = pathname.split("/").filter(Boolean).pop() || "Home";
  const keys = [
    "Home",
    "WhyAttend",
    "Exhibitors",
    "Schedule",
    "Venue",
    "FAQs",
    "Register",
    "RegistrationSuccess",
    "cms-login",
    "cms-dashboard",
  ];
  return keys.find((k) => k.toLowerCase() === slug.toLowerCase()) ?? "Home";
}

export default function App() {
  const currentPageName = useCurrentPageName();

  return (
    <Layout currentPageName={currentPageName}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/WhyAttend" element={<WhyAttend />} />
        <Route path="/Exhibitors" element={<Exhibitors />} />
        <Route path="/Schedule" element={<Schedule />} />
        <Route path="/Venue" element={<Venue />} />
        <Route path="/FAQs" element={<FAQs />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/RegistrationSuccess" element={<RegistrationSuccess />} />

        <Route path="/cms-login" element={<CMSLogin />} />
        <Route
          path="/cms-dashboard"
          element={
            <AuthGuard requiredRole="admin">
              <CMSDashboard />
            </AuthGuard>
          }
        />

        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </Layout>
  );
}
