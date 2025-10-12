// src/components/admin/AuthGuard.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function AuthGuard({ children, requiredRole = null }) {
  const { user, isLoading, claims } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    // Not signed in → go to CMS login, preserve where we came from
    return <Navigate to="/cms-login" state={{ from: location }} replace />;
  }

  if (requiredRole && (!claims || claims.user_role !== requiredRole)) {
    // Signed in but not authorized
    return <Navigate to="/" replace />;
  }

  return children;
}
