import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  { q: "Is registration free?", a: "General entry to the expo floor and main talks is completely free. Some specialized workshops (IELTS/TOEFL prep) and VIP advising sessions have a fee." },
  { q: "Do I get a confirmation?", a: "Yes! You'll receive an email confirmation immediately after registration with all event details. Your status will show as 'Pending for review' until our team approves your registration." },
  { q: "What should I bring to the event?", a: "Bring your ID, copies of your transcripts, test scores (if available), and business cards if you're an agent or school representative. Students should prepare questions about programs and scholarships." },
  { q: "Can I register on the day of the event?", a: "Yes, walk-ins are welcome for free general admission. However, paid workshops may be sold out, so we recommend pre-registering online." },
  { q: "Are there scholarships available?", a: "Many exhibiting universities offer scholarships. Visit their booths to learn about opportunities and application requirements." },
  { q: "What's the refund policy for paid registrations?", a: "Paid workshop and VIP advising fees are non-refundable but transferable. You may transfer your ticket to another person by contacting us at least 48 hours before the event." },
  { q: "Will there be food available?", a: "Yes, a networking lunch is included for all attendees. Light refreshments will be available throughout the day." },
  { q: "How do I become an exhibitor or sponsor?", a: "Select the Exhibitor or Sponsor registration option during signup. Our team will contact you within 24 hours to discuss booth setup and sponsorship packages." }
];

export default function FAQs() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B132B] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-[#64748B]">
            Everything you need to know about GAIN FAIR
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-[#0B132B] hover:text-[#0EA5E9] transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#475569] pt-2 pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Still Have Questions?</h2>
          <p className="mb-6 text-blue-50">
            Our team is here to help. Reach out and we'll get back to you within 24 hours.
          </p>
          <a 
            href="mailto:info@gainfair.vn" 
            className="inline-block bg-white text-[#0EA5E9] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}