// src/pages/Home.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPageContent } from "@/api/db";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play } from "lucide-react";

const defaults = {
  brand: {
    name: "GAIN FAIR",
    date: "2025-10-25",
    venue: "Quảng Trị Convention Center, Vietnam",
    subtitle: "Meet students. Build your brand.",
  },
  hero: {
    title: "Global Academic & Immigration Network Fair",
    description: "A hybrid model of technology + offline fair for better outcomes.",
    cta_label: "Register Now",
    cta_link: "/register",
    poster: "",
  },
  videos: [], // e.g. [{ id:'hero', type:'mp4', src:'...' }]
  testimonials: [],
};

function HeroVideo({ videos, poster }) {
  const heroVid = (videos || []).find((v) => v.id === "hero");
  if (!heroVid) return null;

  if (heroVid.type === "mp4" && heroVid.src) {
    return (
      <video
        className="w-full rounded-2xl shadow"
        src={heroVid.src}
        poster={poster || ""}
        autoPlay
        muted
        loop
        playsInline
        controls={false}
      />
    );
  }

  if (heroVid.type === "youtube" && heroVid.src) {
    // naive YouTube embed
    const url = new URL(heroVid.src);
    const vid = url.searchParams.get("v") || heroVid.src.split("/").pop();
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}`}
          title="Hero"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return null;
}

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["page_home"],
    queryFn: () => getPageContent("home"),
  });

  const page = {
    ...defaults,
    ...(data || {}),
    brand: { ...defaults.brand, ...(data?.brand || {}) },
    hero: { ...defaults.hero, ...(data?.hero || {}) },
    videos: Array.isArray(data?.videos) ? data.videos : defaults.videos,
    testimonials: Array.isArray(data?.testimonials) ? data.testimonials : defaults.testimonials,
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* HERO */}
      <section className="container mx-auto pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge className="mb-2">{page.brand?.name || "GAIN FAIR"}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {page.hero?.title}
            </h1>
            <p className="text-gray-600">
              {page.hero?.description}
            </p>
            <div className="text-gray-700">
              <div><strong>Date:</strong> {page.brand?.date}</div>
              <div><strong>Venue:</strong> {page.brand?.venue}</div>
              {page.brand?.subtitle ? <div>{page.brand.subtitle}</div> : null}
            </div>
            {page.hero?.cta_link ? (
              <Button asChild size="lg">
                <Link to={page.hero.cta_link}>
                  <Play className="w-4 h-4 mr-2" />
                  {page.hero?.cta_label || "Register Now"}
                </Link>
              </Button>
            ) : null}
          </div>
          <div>
            <HeroVideo videos={page.videos} poster={page.hero?.poster} />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {page.testimonials && page.testimonials.length > 0 && (
        <section className="container mx-auto pb-16">
          <h2 className="text-2xl font-semibold mb-4">What people say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {page.testimonials.map((t, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <p className="text-gray-700 mb-3">“{t.text}”</p>
                  <div className="text-sm font-medium">{t.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
