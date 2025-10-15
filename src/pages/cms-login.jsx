// src/pages/CMSLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function CMSLogin() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Always go straight to the dashboard if already authenticated
  useEffect(() => {
    if (user) navigate("/cms-dashboard", { replace: true });
  }, [user, navigate]);

  const goDashboard = () => navigate("/cms-dashboard", { replace: true });

  async function handleSignIn(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setErr("");
      await signIn(email, password);
      goDashboard();
    } catch (e) {
      setErr(e?.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setErr("");
      await signUp(email, password);
      goDashboard();
    } catch (e) {
      setErr(e?.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={activeTab === "signin" ? "current-password" : "new-password"}
              />
            </div>

            {err && (
              <Alert variant="destructive">
                <AlertDescription>
                  <AlertCircle className="inline mr-2" />
                  {err}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {activeTab === "signin" ? "Sign In" : "Sign Up"}
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  setActiveTab((t) => (t === "signin" ? "signup" : "signin"))
                }
                disabled={busy}
              >
                {activeTab === "signin" ? "Create account" : "Have an account? Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
