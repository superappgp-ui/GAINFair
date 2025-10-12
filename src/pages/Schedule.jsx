import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import SessionCard from "../components/SessionCard";

// Mock schedule data
const schedule = [
  { id: "s1", track: "Main Hall", title: "Opening & Welcome", start: "09:00", end: "09:30", speaker: "Organizers" },
  { id: "s2", track: "Workshop Room", title: "IELTS Fast Tactics", start: "10:00", end: "10:45", speaker: "Expert Tutors" },
  { id: "s3", track: "Networking Zone", title: "Agent–School Matching", start: "11:00", end: "12:00", speaker: "Partners" },
  { id: "s4", track: "Main Hall", title: "Visa Application Masterclass", start: "11:00", end: "11:45", speaker: "Immigration Lawyer" },
  { id: "s5", track: "Workshop Room", title: "TOEFL Speaking Practice", start: "13:00", end: "13:45", speaker: "Expert Tutors" },
  { id: "s6", track: "Main Hall", title: "Scholarship Secrets", start: "14:00", end: "14:45", speaker: "Financial Aid Advisors" },
  { id: "s7", track: "Networking Zone", title: "Alumni Panel Discussion", start: "15:00", end: "16:00", speaker: "Alumni from 5 Countries" }
];

const tracks = ["All", ...new Set(schedule.map(s => s.track))];

export default function Schedule() {
  const [activeTrack, setActiveTrack] = React.useState("All");
  const [myPlan, setMyPlan] = React.useState([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("gain-fair-my-plan");
    if (saved) {
      setMyPlan(JSON.parse(saved));
    }
  }, []);

  const toggleMyPlan = (sessionId) => {
    const updated = myPlan.includes(sessionId)
      ? myPlan.filter(id => id !== sessionId)
      : [...myPlan, sessionId];
    setMyPlan(updated);
    localStorage.setItem("gain-fair-my-plan", JSON.stringify(updated));
  };

  const filtered = activeTrack === "All" 
    ? schedule 
    : schedule.filter(s => s.track === activeTrack);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B132B] mb-4">
            Event Schedule
          </h1>
          <p className="text-xl text-[#64748B] max-w-3xl mx-auto">
            Plan your day at GAIN FAIR. Add sessions to your personal schedule.
          </p>
        </div>

        <Tabs value={activeTrack} onValueChange={setActiveTrack} className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {tracks.map(track => (
              <TabsTrigger key={track} value={track} className="whitespace-nowrap">
                {track}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filtered.map(session => (
            <div key={session.id} className="flex gap-4 items-start">
              <div className="flex-1">
                <SessionCard session={session} />
              </div>
              <Button
                variant={myPlan.includes(session.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMyPlan(session.id)}
                className={myPlan.includes(session.id) ? "bg-[#0EA5E9]" : ""}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {myPlan.includes(session.id) ? "Added" : "Add"}
              </Button>
            </div>
          ))}
        </div>

        {myPlan.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-[#0B132B] mb-4">
              My Schedule ({myPlan.length} sessions)
            </h2>
            <p className="text-[#64748B] text-sm">
              Your personalized schedule is saved in your browser. 
              You can access it anytime before the event.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}