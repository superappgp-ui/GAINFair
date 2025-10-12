import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";

export default function ExhibitorCard({ exhibitor }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {exhibitor.logo ? (
              <img src={exhibitor.logo} alt={exhibitor.name} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0B132B] mb-1">{exhibitor.name}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {exhibitor.type}
              </Badge>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {exhibitor.country}
              </Badge>
            </div>
            <p className="text-sm text-[#64748B] mb-2">{exhibitor.pitch}</p>
            <div className="text-xs text-[#0EA5E9] font-medium">
              Booth {exhibitor.booth}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}