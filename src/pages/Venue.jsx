import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Hotel, Car, Phone, Globe } from "lucide-react";

const hotels = [
  { name: "Quảng Trị Grand Hotel", distance: "0.5km from venue", price: "$45-75/night", phone: "+84 xxx xxx xxx" },
  { name: "Riverside Inn", distance: "1.2km from venue", price: "$30-50/night", phone: "+84 xxx xxx xxx" },
  { name: "Heritage Boutique Hotel", distance: "0.8km from venue", price: "$60-90/night", phone: "+84 xxx xxx xxx" }
];

export default function Venue() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B132B] mb-4">
            Venue & Travel
          </h1>
          <p className="text-xl text-[#64748B]">
            Everything you need to know about getting to GAIN FAIR
          </p>
        </div>

        {/* Venue Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B132B] mb-4">
                Quảng Trị Convention Center
              </h2>
              <div className="space-y-3 text-[#475569]">
                <p>123 Lê Duẩn Street</p>
                <p>Đông Hà City, Quảng Trị Province</p>
                <p>Vietnam</p>
                <div className="pt-4 border-t mt-4">
                  <p className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-[#0EA5E9]" />
                    <span>+84 233 xxx xxxx</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#0EA5E9]" />
                    <span>www.qtconventioncenter.vn</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B132B] mb-4">
                Getting There
              </h2>
              <div className="space-y-4 text-[#475569]">
                <div>
                  <h3 className="font-semibold mb-1">From Đông Hà Station</h3>
                  <p className="text-sm">15-minute taxi ride (approximately 50,000 VND)</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">From Huế Airport</h3>
                  <p className="text-sm">90-minute drive via QL1A highway</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Parking</h3>
                  <p className="text-sm">Free parking available for all attendees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#0B132B] mb-6">Location Map</h2>
          <div className="rounded-xl overflow-hidden shadow-lg h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.234!2d107.0975!3d16.8197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDQ5JzExLjAiTiAxMDfCsDA1JzUxLjAiRQ!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        {/* Hotels */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Hotel className="w-6 h-6 text-[#0EA5E9]" />
            <h2 className="text-2xl font-bold text-[#0B132B]">
              Recommended Hotels
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 flex items-center justify-center">
                    <Hotel className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-[#0B132B] mb-2">{hotel.name}</h3>
                  <p className="text-sm text-[#64748B] mb-1">{hotel.distance}</p>
                  <p className="text-sm font-medium text-[#0EA5E9] mb-2">{hotel.price}</p>
                  <p className="text-xs text-[#64748B] flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {hotel.phone}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}