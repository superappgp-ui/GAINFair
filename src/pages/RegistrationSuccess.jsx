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

  const { data: reg, isLoading } = useQuery({
    queryKey: ['registration', id],
    queryFn: () => getRegistrationById(id),
    enabled: !!id
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!reg) return <div className="p-8">Registration not found.</div>;

  return (
    <div className="container max-w-xl mx-auto py-12">
      <Card>
        <CardContent className="space-y-4 pt-6">
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
