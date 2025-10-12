import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function TestimonialCard({ testimonial }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <Quote className="w-8 h-8 text-[#0EA5E9] opacity-20 mb-4" />
        <p className="text-[#475569] mb-4 italic">"{testimonial.quote}"</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {testimonial.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-semibold text-[#0B132B] text-sm">{testimonial.name}</div>
            <div className="text-xs text-[#64748B]">{testimonial.role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}