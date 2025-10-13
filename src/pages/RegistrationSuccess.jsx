import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRegistrationById } from "@/api/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RegistrationSuccess() {
  const [sp] = useSearchParams();
  const id = sp.get("id");

  const { data: reg, isLoading, isError } = useQuery({
    queryKey: ["registration", id],
    queryFn: () => getRegistrationById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-6">Loading your registration…</div>;
  }

  if (isError || !reg) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h1 className="text-2xl font-semibold">Thanks for registering!</h1>
            <p>We’ve received your submission. Please check your email for a confirmation.</p>
            <Button asChild><Link to="/">Back to Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-semibold">Thanks, {reg.name}!</h1>
          <p>We’ve received your registration.</p>
          <div className="flex items-center gap-2">
            <Badge variant={reg.payment_status === "paid" ? "default" : "secondary"}>
              {reg.payment_status?.toUpperCase() || "PENDING"}
            </Badge>
            {reg.paypal_order_id && <span>Order: {reg.paypal_order_id}</span>}
          </div>
          <Button asChild><Link to="/">Back to Home</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
