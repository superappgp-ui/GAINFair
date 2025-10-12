import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function SessionCard({ session }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-center">
            <div className="text-lg font-bold text-[#0EA5E9]">{session.start}</div>
            <div className="text-xs text-[#64748B]">{session.end}</div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0B132B] mb-2">{session.title}</h3>
            <div className="flex flex-wrap gap-2 text-xs text-[#64748B]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {session.track}
              </span>
              <span>•</span>
              <span>{session.speaker}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}