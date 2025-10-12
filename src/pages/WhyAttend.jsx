import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Building2, Check } from "lucide-react";
import TestimonialCard from "../components/TestimonialCard";

const benefits = {
  students: [
    "Meet 50+ universities and colleges in one place",
    "Explore programs across USA, Canada, UK, Australia, and more",
    "Get on-the-spot admission assessments",
    "Learn about scholarships and financial aid",
    "Attend IELTS and TOEFL preparation workshops",
    "Receive expert visa guidance and application support"
  ],
  agents: [
    "Network with international school representatives",
    "Discover new partnership opportunities",
    "Stay updated on latest intake requirements",
    "Access exclusive agent-only sessions",
    "Build your client pipeline",
    "Get commission structure information"
  ],
  schools: [
    "Reach motivated Vietnamese students directly",
    "Meet qualified education agents",
    "Showcase your programs and campus life",
    "Conduct on-site student interviews",
    "Build brand awareness in Vietnam market",
    "Network with other institutions"
  ]
};

const testimonials = {
  students: { name: "Lan P.", role: "Student", quote: "I met three universities and found a great program with scholarship opportunities." },
  agents: { name: "Mr. Tran", role: "Agent", quote: "Solid partnerships and clear intake information. Very productive day." },
  schools: { name: "Dr. Smith", role: "University Rep", quote: "Great quality of students. We secured 15 interviews in one day." }
};

export default function WhyAttend() {
  const [activeTab, setActiveTab] = React.useState("students");

  const icons = {
    students: GraduationCap,
    agents: Users,
    schools: Building2
  };

  const Icon = icons[activeTab];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B132B] mb-4">
            Why Attend GAIN FAIR?
          </h1>
          <p className="text-xl text-[#64748B] max-w-3xl mx-auto">
            Whether you're a student, education agent, or school representative, 
            GAIN FAIR offers unique opportunities tailored to your goals
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto p-1">
            <TabsTrigger value="students" className="py-3">
              <GraduationCap className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Students & Parents</span>
              <span className="sm:hidden">Students</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="py-3">
              <Users className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="schools" className="py-3">
              <Building2 className="w-4 h-4 mr-2" />
              Schools
            </TabsTrigger>
          </TabsList>

          {Object.keys(benefits).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-8">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0B132B] mb-6">
                      Benefits for {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </h2>
                    <ul className="space-y-4">
                      {benefits[tab].map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-[#22C55E]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-[#22C55E]" />
                          </div>
                          <span className="text-[#475569]">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div>
                  <div className="bg-gradient-to-br from-[#0EA5E9]/10 to-[#22C55E]/10 rounded-xl p-8 mb-6">
                    <h3 className="text-xl font-semibold text-[#0B132B] mb-4">
                      What to Expect
                    </h3>
                    <p className="text-[#475569] mb-4">
                      {tab === "students" && "Spend the day exploring your options. Visit booths, attend workshops, and speak directly with school representatives. Bring your transcripts and test scores for on-the-spot assessments."}
                      {tab === "agents" && "Connect with admissions officers in a professional setting. Attend agent-exclusive sessions to learn about commission structures, intake deadlines, and partnership opportunities."}
                      {tab === "schools" && "Set up your booth in our premium exhibition space. Conduct student interviews, meet agents, and participate in networking sessions. We handle logistics so you can focus on recruitment."}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#64748B]">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#0EA5E9] rounded-full" />
                        <span>Full day access</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
                        <span>Networking lunch</span>
                      </div>
                    </div>
                  </div>

                  <TestimonialCard testimonial={testimonials[tab]} />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-lg mb-6 text-blue-50">
            Choose your registration type and secure your spot at GAIN FAIR 2025
          </p>
          <a href="/register" className="inline-block bg-white text-[#0EA5E9] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            View Registration Options
          </a>
        </div>
      </div>
    </div>
  );
}