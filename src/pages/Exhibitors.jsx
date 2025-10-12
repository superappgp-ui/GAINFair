import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import ExhibitorCard from "../components/ExhibitorCard";

// Mock exhibitors data
const exhibitors = [
  { id: "u1", name: "Global University A", type: "University", country: "Canada", booth: "A12", logo: "", pitch: "STEM scholarships & co-op programs" },
  { id: "u2", name: "City College B", type: "College", country: "USA", booth: "B07", logo: "", pitch: "Affordable diplomas in business and tech" },
  { id: "u3", name: "Institute of Technology C", type: "University", country: "Australia", booth: "A15", logo: "", pitch: "Engineering and IT programs with industry placement" },
  { id: "u4", name: "International School D", type: "College", country: "UK", booth: "C03", logo: "", pitch: "Foundation programs and pathway courses" },
  { id: "u5", name: "Business Academy E", type: "College", country: "Singapore", booth: "B12", logo: "", pitch: "MBA and professional certifications" }
];

const countries = ["All", ...new Set(exhibitors.map(e => e.country))];
const types = ["All", ...new Set(exhibitors.map(e => e.type))];

export default function Exhibitors() {
  const [search, setSearch] = React.useState("");
  const [countryFilter, setCountryFilter] = React.useState("All");
  const [typeFilter, setTypeFilter] = React.useState("All");

  const filtered = exhibitors.filter(exhibitor => {
    const matchesSearch = exhibitor.name.toLowerCase().includes(search.toLowerCase()) ||
                         exhibitor.pitch.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === "All" || exhibitor.country === countryFilter;
    const matchesType = typeFilter === "All" || exhibitor.type === typeFilter;
    return matchesSearch && matchesCountry && matchesType;
  });

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B132B] mb-4">
            Meet Our Exhibitors
          </h1>
          <p className="text-xl text-[#64748B] max-w-3xl mx-auto">
            Connect with 50+ universities, colleges, and education providers from around the world
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search exhibitors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 text-[#64748B]">
          Showing {filtered.length} of {exhibitors.length} exhibitors
        </div>

        {/* Exhibitors Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map(exhibitor => (
            <ExhibitorCard key={exhibitor.id} exhibitor={exhibitor} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#64748B] text-lg">No exhibitors match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}