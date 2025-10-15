// src/pages/cms-dashboard.jsx
import React, { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/firebase";

import AuthGuard from "@/components/admin/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, Save, Plus, Trash2, Edit2, AlertCircle, Loader2, User, Mail, Phone,
  MapPin, Building2, Search, CheckCircle2, Clock, XCircle, DollarSign, Upload,
  FileText, Image as ImageIcon, Video, Download, Send, Eye, X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/* -------------------------------------------------------------------------- */
/*                                 TEMPLATES                                  */
/* -------------------------------------------------------------------------- */

const PAGE_OPTIONS = [
  { value: "home", label: "Home Page" },
  { value: "why_attend", label: "Why Attend" },
  { value: "exhibitors", label: "Exhibitors" },
  { value: "schedule", label: "Schedule" },
  { value: "venue", label: "Venue & Travel" },
  { value: "faqs", label: "FAQs" },
  { value: "register", label: "Register" }
];

const CONTENT_TYPES = [
  { value: "text", label: "Text" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "image_url", label: "Image URL" },
  { value: "video_url", label: "Video URL" },
  { value: "pdf_url", label: "PDF URL" }
];

// === paste of your templates (unchanged) ===
const CONTENT_TEMPLATES = {
  home: [
    { key: "hero_title", type: "text", description: "Main hero title (first line)", example: "Your Future Starts at" },
    { key: "hero_subtitle", type: "text", description: "Hero subtitle (highlighted text)", example: "GAIN FAIR 2025" },
    { key: "hero_description", type: "text", description: "Hero description text", example: "Meet global schools, explore programs..." },
    { key: "hero_badge_session_text", type: "text", description: "Badge text in hero", example: "Free & Paid Sessions" },
    { key: "hero_button_register", type: "text", description: "Register button text", example: "Register Now" },
    { key: "hero_button_highlights", type: "text", description: "Watch highlights button text", example: "Watch Highlights" },
    { key: "hero_video_url", type: "video_url", description: "Hero background video URL", example: "URL to hero video" },
    
    { key: "what_is_title", type: "text", description: "What is GAIN FAIR section title", example: "What is GAIN FAIR?" },
    { key: "what_is_description", type: "text", description: "What is GAIN FAIR description", example: "GAIN FAIR is Vietnam's premier..." },
    
    { key: "what_is_benefit_1_title", type: "text", description: "First benefit title", example: "50+ Universities" },
    { key: "what_is_benefit_1_description", type: "text", description: "First benefit description", example: "Meet representatives from..." },
    { key: "what_is_benefit_2_title", type: "text", description: "Second benefit title", example: "Scholarships" },
    { key: "what_is_benefit_2_description", type: "text", description: "Second benefit description", example: "Discover funding opportunities..." },
    { key: "what_is_benefit_3_title", type: "text", description: "Third benefit title", example: "Test Prep" },
    { key: "what_is_benefit_3_description", type: "text", description: "Third benefit description", example: "IELTS, TOEFL workshops..." },
    { key: "what_is_benefit_4_title", type: "text", description: "Fourth benefit title", example: "Visa Desk" },
    { key: "what_is_benefit_4_description", type: "text", description: "Fourth benefit description", example: "Get expert guidance..." },
    
    { key: "workshop_cta_title", type: "text", description: "Workshop CTA title", example: "Limited Workshop Seats" },
    { key: "workshop_cta_description", type: "text", description: "Workshop CTA description", example: "IELTS and TOEFL prep..." },
    { key: "workshop_cta_button_text", type: "text", description: "Workshop CTA button text", example: "Reserve Your Seat" },
    
    { key: "videos_section_title", type: "text", description: "Videos section title", example: "See What Happens at GAIN FAIR" },
    { key: "videos_section_description", type: "text", description: "Videos section description", example: "Watch highlights from previous events" },
    { key: "videos", type: "json", description: "Video list (JSON array)", example: '[{"id":"v1","type":"youtube","src":"URL","title":"Title"}]' },
    
    { key: "testimonials_section_title", type: "text", description: "Testimonials section title", example: "What Attendees Say" },
    { key: "testimonials", type: "json", description: "Testimonials (JSON array)", example: '[{"name":"Name","role":"Role","quote":"Quote"}]' },
    
    { key: "final_cta_title", type: "text", description: "Final CTA title", example: "Ready to Shape Your Future?" },
    { key: "final_cta_description", type: "text", description: "Final CTA description", example: "Join hundreds of students..." },
    { key: "final_cta_button_text", type: "text", description: "Final CTA button text", example: "Register for Free" },
    
    { key: "brand_info", type: "json", description: "Brand information (JSON)", example: '{"name":"GAIN FAIR","date":"2025-10-25","venue":"Quảng Trị Convention Center, Vietnam"}' }
  ],
  why_attend: [
    { key: "page_title", type: "text", description: "Page title", example: "Why Attend GAIN FAIR?" },
    { key: "page_description", type: "text", description: "Page description", example: "Whether you're a student..." },
    
    { key: "students_benefits", type: "json", description: "Student benefits list (JSON array)", example: '["Benefit 1","Benefit 2"]' },
    { key: "agents_benefits", type: "json", description: "Agent benefits list (JSON array)", example: '["Benefit 1","Benefit 2"]' },
    { key: "schools_benefits", type: "json", description: "School benefits list (JSON array)", example: '["Benefit 1","Benefit 2"]' },
    
    { key: "students_what_to_expect", type: "text", description: "What students can expect", example: "Spend the day exploring..." },
    { key: "agents_what_to_expect", type: "text", description: "What agents can expect", example: "Connect with admissions officers..." },
    { key: "schools_what_to_expect", type: "text", description: "What schools can expect", example: "Set up your booth..." },
    
    { key: "cta_title", type: "text", description: "Bottom CTA title", example: "Ready to Take the Next Step?" },
    { key: "cta_description", type: "text", description: "Bottom CTA description", example: "Choose your registration type..." }
  ],
  exhibitors: [
    { key: "page_title", type: "text", description: "Page title", example: "Meet Our Exhibitors" },
    { key: "page_description", type: "text", description: "Page description", example: "Connect with 50+ universities..." },
    { key: "exhibitors_list", type: "json", description: "Exhibitors list (JSON array)", example: '[{"id":"u1","name":"University Name","type":"University","country":"USA","booth":"A12","logo":"","pitch":"Description"}]' }
  ],
  schedule: [
    { key: "page_title", type: "text", description: "Page title", example: "Event Schedule" },
    { key: "page_description", type: "text", description: "Page description", example: "Plan your day at GAIN FAIR..." },
    { key: "schedule_list", type: "json", description: "Schedule sessions (JSON array)", example: '[{"id":"s1","track":"Main Hall","title":"Session Title","start":"09:00","end":"09:30","speaker":"Speaker Name"}]' }
  ],
  venue: [
    { key: "page_title", type: "text", description: "Page title", example: "Venue & Travel" },
    { key: "page_description", type: "text", description: "Page description", example: "Everything you need to know..." },
    
    { key: "venue_name", type: "text", description: "Venue name", example: "Quảng Trị Convention Center" },
    { key: "venue_address_line1", type: "text", description: "Address line 1", example: "123 Lê Duẩn Street" },
    { key: "venue_address_line2", type: "text", description: "Address line 2", example: "Đông Hà City, Quảng Trị Province" },
    { key: "venue_address_line3", type: "text", description: "Address line 3", example: "Vietnam" },
    { key: "venue_phone", type: "text", description: "Venue phone", example: "+84 233 xxx xxxx" },
    { key: "venue_website", type: "text", description: "Venue website", example: "www.qtconventioncenter.vn" },
    
    { key: "getting_there_from_station", type: "text", description: "From station directions", example: "15-minute taxi ride..." },
    { key: "getting_there_from_airport", type: "text", description: "From airport directions", example: "90-minute drive via..." },
    { key: "getting_there_parking", type: "text", description: "Parking information", example: "Free parking available..." },
    
    { key: "map_embed_url", type: "text", description: "Google Maps embed URL", example: "https://www.google.com/maps/embed?pb=..." },
    { key: "hotels_list", type: "json", description: "Hotels list (JSON array)", example: '[{"name":"Hotel Name","distance":"0.5km","price":"$45-75/night","phone":"+84 xxx"}]' }
  ],
  faqs: [
    { key: "page_title", type: "text", description: "Page title", example: "Frequently Asked Questions" },
    { key: "page_description", type: "text", description: "Page description", example: "Everything you need to know..." },
    { key: "faqs_list", type: "json", description: "FAQs list (JSON array)", example: '[{"q":"Question?","a":"Answer text"}]' },
    
    { key: "contact_cta_title", type: "text", description: "Contact CTA title", example: "Still Have Questions?" },
    { key: "contact_cta_description", type: "text", description: "Contact CTA description", example: "Our team is here to help..." },
    { key: "contact_email", type: "text", description: "Contact email", example: "info@greenpassgroup.com" }
  ],
  register: [
    { key: "page_title", type: "text", description: "Page title", example: "Register for GAIN FAIR 2025" },
    { key: "page_description", type: "text", description: "Secure your spot at Vietnam's..." },
    { key: "registration_products", type: "json", description: "Registration products (JSON array)", example: '[{"id":"user_free","label":"User (Free)","amount":0,"currency":"USD","kind":"user"}]' },
    { key: "add_ons", type: "json", description: "Add-ons list (JSON array)", example: '[{"id":"workshop","name":"Workshop Pass","amountVND":150000,"amountUSD":6.25,"desc":"Description"}]' }
  ]
};

/* -------------------------------------------------------------------------- */
/*                             REGISTRATION HELPERS                           */
/* -------------------------------------------------------------------------- */

const registrationProducts = [
  { id: "user_free", label: "User (Free)" },
  { id: "exhibitor", label: "Exhibitor" },
  { id: "agent", label: "Agent" },
  { id: "sponsor_s", label: "Sponsor — Silver" },
  { id: "sponsor_g", label: "Sponsor — Gold" },
  { id: "sponsor_p", label: "Sponsor — Platinum" }
];

const attendeeTypeColors = {
  user: "bg-blue-100 text-blue-800",
  agent: "bg-purple-100 text-purple-800",
  exhibitor: "bg-green-100 text-green-800",
  sponsor: "bg-yellow-100 text-yellow-800"
};

const reviewStatusConfig = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  approved: { icon: CheckCircle2, color: "bg-green-100 text-green-800", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Rejected" }
};

/* -------------------------------------------------------------------------- */
/*                                  FIREBASE                                  */
/* -------------------------------------------------------------------------- */

async function listPageContent(selectedPage) {
  const q = query(collection(db, "page_content"), where("page_name", "==", selectedPage));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function createPageContent(payload) {
  await addDoc(collection(db, "page_content"), {
    ...payload,
    updated_at: serverTimestamp(),
  });
}

async function updatePageContent(id, data) {
  await updateDoc(doc(db, "page_content", id), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

async function deletePageContent(id) {
  await deleteDoc(doc(db, "page_content", id));
}

async function listRegistrations() {
  // Align with Register.jsx which writes `created_at`
  const q = query(collection(db, "registrations"), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function updateRegistration(id, data) {
  await updateDoc(doc(db, "registrations", id), data);
}

async function uploadPublicFile(file, path) {
  const r = storageRef(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}

/**
 * Trigger Email extension — Zoho-safe sender.
 * - Omit `from` to use Extension Default FROM (prevents spoofing)
 * - Add `replyTo` so replies land in your Zoho inbox
 */
async function sendInvoiceEmail({ to, subject, html, from, replyTo }) {
  const safeTo = Array.isArray(to) ? to : [to];
  const plainText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 10000);
  const fromAddress = from ?? import.meta.env.VITE_EMAIL_FROM ?? undefined;

  const payload = {
    to: safeTo,
    message: { subject, text: plainText, html },
    createdAt: serverTimestamp(),
  };
  if (fromAddress) payload.from = fromAddress; // omit if undefined to use Extension default
  if (replyTo) payload.replyTo = replyTo;

  await addDoc(collection(db, "mail"), payload);
}

/* -------------------------------------------------------------------------- */
/*                                UI COMPONENTS                               */
/* -------------------------------------------------------------------------- */

function RegistrationCard({ registration, onVerify }) {
  const productLabel = registrationProducts.find(p => p.id === registration.registration_product_id)?.label || "Unknown";
  const ReviewIcon = reviewStatusConfig[registration.review_status]?.icon || Clock;
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    await onVerify(registration);
    setIsVerifying(false);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-lg">
                {registration?.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-[#0B132B] text-lg">{registration.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={attendeeTypeColors[registration.attendee_type] || "bg-gray-100 text-gray-800"}>
                  {registration.attendee_type}
                </Badge>
                <Badge className={reviewStatusConfig[registration.review_status]?.color}>
                  <ReviewIcon className="w-3 h-3 mr-1" />
                  {reviewStatusConfig[registration.review_status]?.label || "Pending"}
                </Badge>
                {registration.payment_status === "paid" && (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Paid
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-[#0EA5E9]">
              {registration.amount === 0 ? "FREE" : `$${registration.amount}`}
            </div>
            <div className="text-xs text-gray-500">{productLabel}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2 text-[#64748B]">
            <Mail className="w-4 h-4 text-[#0EA5E9]" />
            <span className="truncate">{registration.email}</span>
          </div>
          <div className="flex items-center gap-2 text-[#64748B]">
            <Phone className="w-4 h-4 text-[#0EA5E9]" />
            <span>{registration.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-[#64748B]">
            <MapPin className="w-4 h-4 text-[#0EA5E9]" />
            <span>{registration.country}</span>
          </div>
          {registration.organization && (
            <div className="flex items-center gap-2 text-[#64748B]">
              <Building2 className="w-4 h-4 text-[#0EA5E9]" />
              <span className="truncate">{registration.organization}</span>
            </div>
          )}
        </div>

        {registration.paypal_order_id && (
          <div className="mb-3 pb-3 border-b text-xs text-gray-500">
            PayPal Order: {registration.paypal_order_id}
          </div>
        )}

        {registration.review_status === "pending" && (
          <Button
            size="sm"
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Verify & Send Invoice
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ContentEditor({ content, template, onSave, onCancel }) {
  const [editData, setEditData] = useState({
    content_value: content?.content_value || template?.example || "",
    content_type: content?.content_type || template?.type || "text",
    description: content?.description || template?.description || ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const path = `cms/${template.key}/${Date.now()}_${file.name}`;
      const url = await uploadPublicFile(file, path);
      setEditData((d) => ({ ...d, content_value: url }));
      toast({ title: "Success", description: "File uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const renderInput = () => {
    if (editData.content_type === "json") {
      return (
        <div className="space-y-3">
          <Textarea
            value={editData.content_value}
            onChange={(e) => setEditData({ ...editData, content_value: e.target.value })}
            rows={10}
            placeholder={template?.example || "Enter JSON..."}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500">Enter valid JSON format</p>
        </div>
      );
    }

    if (editData.content_type === "html") {
      return (
        <div className="space-y-3">
          <Textarea
            value={editData.content_value}
            onChange={(e) => setEditData({ ...editData, content_value: e.target.value })}
            rows={8}
            placeholder={template?.example || "Enter HTML..."}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500">Enter HTML markup</p>
        </div>
      );
    }

    if (["image_url", "video_url", "pdf_url"].includes(editData.content_type)) {
      return (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0EA5E9] transition-colors">
            <Input
              type="file"
              accept={
                editData.content_type === "image_url" ? "image/*" :
                editData.content_type === "video_url" ? "video/*" :
                "application/pdf"
              }
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id={`file-upload-${template.key}`}
            />
            <label htmlFor={`file-upload-${template.key}`} className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                {editData.content_type === "image_url" && <ImageIcon className="w-12 h-12 text-gray-400" />}
                {editData.content_type === "video_url" && <Video className="w-12 h-12 text-gray-400" />}
                {editData.content_type === "pdf_url" && <FileText className="w-12 h-12 text-gray-400" />}
                
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0EA5E9]" />
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#0EA5E9]" />
                      <span className="text-sm font-medium text-[#0EA5E9]">
                        Click to upload {editData.content_type.replace('_url', '')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      or enter URL manually below
                    </span>
                  </>
                )}
              </div>
            </label>
          </div>

          <div>
            <Label>Or enter URL manually</Label>
            <Input
              value={editData.content_value}
              onChange={(e) => setEditData({ ...editData, content_value: e.target.value })}
              placeholder={template?.example || "https://example.com/file.jpg"}
              disabled={isUploading}
            />
          </div>

          {editData.content_value && editData.content_type === "image_url" && (
            <div className="mt-4">
              <Label>Preview</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img 
                  src={editData.content_value} 
                  alt="Preview" 
                  className="max-w-full h-48 object-cover mx-auto"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <Textarea
          value={editData.content_value}
          onChange={(e) => setEditData({ ...editData, content_value: e.target.value })}
          rows={4}
          placeholder={template?.example || "Enter content..."}
        />
        <p className="text-xs text-gray-500">Enter plain text content</p>
      </div>
    );
  };

  return (
    <div className="space-y-4 border-l-4 border-[#0EA5E9] pl-4">
      <div>
        <Label>Content Type</Label>
        <Select
          value={editData.content_type}
          onValueChange={(value) => setEditData({ ...editData, content_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  {type.value === "image_url" && <ImageIcon className="w-4 h-4" />}
                  {type.value === "video_url" && <Video className="w-4 h-4" />}
                  {type.value === "pdf_url" && <FileText className="w-4 h-4" />}
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Content Value</Label>
        {renderInput()}
      </div>

      <div>
        <Label>Description (Optional)</Label>
        <Input
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          placeholder="What is this content for?"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSave(editData)} className="bg-[#22C55E] hover:bg-[#16A34A]" disabled={isUploading}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function CMSDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedPage, setSelectedPage] = useState("home");
  const [editingContentKey, setEditingContentKey] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("content");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendeeTypeFilter, setAttendeeTypeFilter] = useState("all");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
  const [activeRegTab, setActiveRegTab] = useState("free");

  // Queries
  const { data: allContent = [], isLoading: isLoadingContent } = useQuery({
    queryKey: ["page-content", selectedPage],
    queryFn: () => listPageContent(selectedPage),
  });

  const { data: registrations = [], isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ["registrations"],
    queryFn: () => listRegistrations(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createPageContent(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["page-content", selectedPage] });
      setEditingContentKey(null);
      toast({ title: "Success", description: "Content created successfully" });
    },
    onError: (e) => toast({ title: "Error", description: String(e), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePageContent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["page-content", selectedPage] });
      setEditingContentKey(null);
      toast({ title: "Success", description: "Content updated successfully" });
    },
    onError: (e) => toast({ title: "Error", description: String(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePageContent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["page-content", selectedPage] });
      toast({ title: "Deleted", description: "Content deleted successfully" });
    },
    onError: (e) => toast({ title: "Error", description: String(e), variant: "destructive" }),
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: ({ id, data }) => updateRegistration(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registrations"] });
    },
    onError: (e) => toast({ title: "Error", description: String(e), variant: "destructive" }),
  });

  // Derived
  const pageContent = useMemo(() => allContent || [], [allContent]);
  const pageTemplates = CONTENT_TEMPLATES[selectedPage] || [];

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveContent = async (contentKey, editData) => {
    const existingContent = pageContent.find((c) => c.content_key === contentKey);
    const payload = {
      page_name: selectedPage,
      content_key: contentKey,
      content_type: editData.content_type,
      content_value: editData.content_value,
      description: editData.description || "",
    };
    if (existingContent) {
      updateMutation.mutate({ id: existingContent.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownloadCSV = (registrationType /* 'free' | 'paid' */) => {
    const dataToExport = registrations.filter((r) => r.payment_status === registrationType);
    if (dataToExport.length === 0) {
      toast({ title: "No Data", description: `No ${registrationType} registrations to export`, variant: "destructive" });
      return;
    }

    const headers = [
      "Name","Email","Phone","Country","Organization","Attendee Type",
      "Registration Type","Amount","Currency","Payment Status","Review Status",
      "PayPal Order ID","Add-ons","Created Date"
    ];

    const safeDateString = (reg) => {
      // Handle Firestore Timestamp, ISO string, or millis
      const ts = reg.created_at;
      if (ts && typeof ts.toDate === "function") return ts.toDate().toLocaleString();
      if (ts) return new Date(ts).toLocaleString();
      if (reg.created_date) return new Date(reg.created_date).toLocaleString();
      return "";
    };

    const rows = dataToExport.map(reg => {
      const product = registrationProducts.find(p => p.id === reg.registration_product_id);
      return [
        reg.name, reg.email, reg.phone, reg.country, reg.organization || "",
        reg.attendee_type, product?.label || reg.registration_product_id,
        reg.amount, reg.currency, reg.payment_status, reg.review_status,
        reg.paypal_order_id || "", (reg.add_ons || []).join("; "),
        safeDateString(reg)
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell ?? "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `GAIN_FAIR_${registrationType}_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "Success", description: `Exported ${dataToExport.length} ${registrationType} registrations` });
  };

  const handleVerifyRegistration = async (registration) => {
    try {
      const invoiceDate = new Date().toISOString();
      const invoiceNumber = `INV-${Date.now()}-${registration.id.substring(0, 8)}`;
      const product = registrationProducts.find(p => p.id === registration.registration_product_id);

      const addOnsDetails = (registration.add_ons || []).length > 0 
        ? `<tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Add-ons:</td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${registration.add_ons.join(', ')}</td></tr>`
        : '';

      const emailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:30px;">
      <div style="width:60px;height:60px;background:linear-gradient(135deg,#0EA5E9 0%,#22C55E 100%);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="color:white;font-size:32px;font-weight:bold;">G</span>
      </div>
      <h1 style="margin:0;font-size:28px;font-weight:bold;color:#0B132B;">Registration Confirmed!</h1>
      <p style="margin:8px 0 0 0;color:#64748B;font-size:16px;">GAIN FAIR 2025</p>
    </div>

    <p style="font-size:16px;color:#475569;margin-bottom:24px;">Dear ${registration.name},</p>
    <p style="font-size:16px;color:#475569;margin-bottom:32px;">Your registration for GAIN FAIR 2025 has been confirmed! Below are your invoice details.</p>

    <div style="background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden;margin-bottom:24px;">
      <div style="background:linear-gradient(135deg,#0EA5E9 0%,#22C55E 100%);padding:20px;text-align:center;">
        <h2 style="margin:0;color:white;font-size:20px;font-weight:bold;">Invoice #${invoiceNumber}</h2>
        <p style="margin:8px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px;">
          ${new Date(invoiceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style="padding:24px;border-bottom:2px solid #f1f5f9;">
        <h3 style="margin:0 0 16px 0;font-size:16px;font-weight:bold;color:#0B132B;">Event Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;width:40%;">Event:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;font-weight:600;">GAIN FAIR 2025</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;">Date:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">October 25, 2025</td></tr>
          <tr><td style="padding:12px;color:#6b7280;font-weight:500;">Venue:</td><td style="padding:12px;color:#1f2937;">Quảng Trị Convention Center, Vietnam</td></tr>
        </table>
      </div>

      <div style="padding:24px;border-bottom:2px solid #f1f5f9;">
        <h3 style="margin:0 0 16px 0;font-size:16px;font-weight:bold;color:#0B132B;">Registration Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;width:40%;">Name:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${registration.name}</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;">Email:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${registration.email}</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;">Phone:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${registration.phone}</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;">Country:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${registration.country}</td></tr>
          ${registration.organization ? `<tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;">Organization:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${registration.organization}</td></tr>` : ""}
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;">Registration Type:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;font-weight:600;">${product?.label || registration.registration_product_id}</td></tr>
          <tr><td style="padding:12px;color:#6b7280;font-weight:500;">Attendee Type:</td><td style="padding:12px;color:#1f2937;text-transform:capitalize;">${registration.attendee_type}</td></tr>
        </table>
      </div>

      <div style="padding:24px;">
        <h3 style="margin:0 0 16px 0;font-size:16px;font-weight:bold;color:#0B132B;">Payment Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;width:40%;">Amount:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;font-weight:600;font-size:18px;">${registration.amount === 0 ? 'FREE' : `$${registration.amount} ${registration.currency}`}</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;">Payment Status:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;text-transform:capitalize;">${registration.payment_status}</td></tr>
          ${registration.paypal_order_id ? `<tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;">PayPal Order ID:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#1f2937;font-family:monospace;font-size:12px;">${registration.paypal_order_id}</td></tr>` : ""}
          ${addOnsDetails}
        </table>
      </div>

      <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:16px;text-align:center;">
        <p style="margin:0;color:white;font-weight:600;font-size:14px;">✓ Registration Confirmed</p>
      </div>
    </div>

    <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #0EA5E9;">
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
        Your registration is now confirmed. We look forward to seeing you at GAIN FAIR 2025!
      </p>
    </div>

    <p style="font-size:14px;color:#64748B;text-align:center;margin-bottom:8px;">
      For any questions, please contact us at <a href="mailto:info@greenpassgroup.com" style="color:#0EA5E9;text-decoration:none;">info@greenpassgroup.com</a>
    </p>
    <p style="font-size:14px;color:#64748B;text-align:center;margin:0;">
      Best regards,<br><strong style="color:#0B132B;">GAIN FAIR Team</strong>
    </p>
  </div>
</body>
</html>`;

      await sendInvoiceEmail({
        to: registration.email,
        subject: `GAIN FAIR 2025 - Registration Confirmed - Invoice ${invoiceNumber}`,
        html: emailBody,
        replyTo: "GAIN FAIR <itmanager@greenpassgroup.com>"
      });

      await updateRegistrationMutation.mutateAsync({
        id: registration.id,
        data: { review_status: "approved" }
      });

      toast({ title: "Invoice sent", description: "Registration approved & email queued." });
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to verify & send invoice", variant: "destructive" });
    }
  };

  const filteredRegistrations = useMemo(() => {
    const st = searchTerm.toLowerCase();
    return (registrations || []).filter((reg) => {
      // ✅ Use payment_status to split tabs
      if (activeRegTab === "free" && reg.payment_status !== "free") return false;
      if (activeRegTab === "paid" && reg.payment_status !== "paid") return false;

      const matches =
        (reg.name || "").toLowerCase().includes(st) ||
        (reg.email || "").toLowerCase().includes(st) ||
        (reg.organization || "").toLowerCase().includes(st);

      if (!matches) return false;
      if (attendeeTypeFilter !== "all" && reg.attendee_type !== attendeeTypeFilter) return false;
      if (reviewStatusFilter !== "all" && reg.review_status !== reviewStatusFilter) return false;
      return true;
    });
  }, [registrations, searchTerm, attendeeTypeFilter, reviewStatusFilter, activeRegTab]);

  // ✅ Counts based on payment_status
  const freeCount = (registrations || []).filter(r => r.payment_status === "free").length;
  const paidCount = (registrations || []).filter(r => r.payment_status === "paid").length;
  const pendingCount = (registrations || []).filter(r => r.review_status === "pending").length;

  return (
    <AuthGuard requiredRole="admin">
      <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">GAIN FAIR CMS</h1>
                <p className="text-xs text-gray-500">Content Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.displayName || "Admin"}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={async () => await signOut(auth)}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="content">Page Content</TabsTrigger>
              <TabsTrigger value="registrations">Registrations ({registrations.length})</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content">
              <div className="mb-6">
                <Label>Select Page to Edit</Label>
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_OPTIONS.map(page => (
                      <SelectItem key={page.value} value={page.value}>{page.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0EA5E9]" />
                </div>
              ) : (
                <div className="space-y-4">
                  {pageTemplates.map((template) => {
                    const existingContent = pageContent.find(c => c.content_key === template.key);
                    const isEditing = editingContentKey === template.key;

                    return (
                      <Card key={template.key} className={isEditing ? "ring-2 ring-[#0EA5E9] ring-offset-2" : ""}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{template.key}</CardTitle>
                              <CardDescription>{template.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                {template.type === "image_url" && <ImageIcon className="w-3 h-3" />}
                                {template.type === "video_url" && <Video className="w-3 h-3" />}
                                {template.type === "pdf_url" && <FileText className="w-3 h-3" />}
                                {template.type}
                              </Badge>
                              {existingContent && (
                                <Badge className="bg-[#22C55E] text-white">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Set
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                            <ContentEditor
                              content={existingContent}
                              template={template}
                              onSave={(data) => handleSaveContent(template.key, data)}
                              onCancel={() => setEditingContentKey(null)}
                            />
                          ) : (
                            <div>
                              {existingContent ? (
                                <div className="space-y-3">
                                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                                    {existingContent.content_type === "image_url" && existingContent.content_value ? (
                                      <div className="space-y-2">
                                        <img 
                                          src={existingContent.content_value} 
                                          alt={template.key} 
                                          className="max-w-full h-32 object-cover rounded"
                                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                        <p className="text-xs text-gray-500 truncate">{existingContent.content_value}</p>
                                      </div>
                                    ) : existingContent.content_type === "video_url" && existingContent.content_value ? (
                                      <div className="flex items-center gap-2">
                                        <Video className="w-5 h-5 text-[#0EA5E9]" />
                                        <p className="text-sm text-gray-700 truncate">{existingContent.content_value}</p>
                                      </div>
                                    ) : existingContent.content_type === "pdf_url" && existingContent.content_value ? (
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-[#0EA5E9]" />
                                        <p className="text-sm text-gray-700 truncate">{existingContent.content_value}</p>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{existingContent.content_value}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setEditingContentKey(template.key)}>
                                      <Edit2 className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDelete(existingContent.id)}
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Delete
                                    </Button>
                                    {["image_url", "video_url", "pdf_url"].includes(existingContent.content_type) && existingContent.content_value && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => window.open(existingContent.content_value, '_blank')}
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View File
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                  <div className="flex flex-col items-center gap-2 mb-4">
                                    {template.type === "image_url" && <ImageIcon className="w-12 h-12 text-gray-400" />}
                                    {template.type === "video_url" && <Video className="w-12 h-12 text-gray-400" />}
                                    {template.type === "pdf_url" && <FileText className="w-12 h-12 text-gray-400" />}
                                    {!["image_url", "video_url", "pdf_url"].includes(template.type) && (
                                      <AlertCircle className="w-12 h-12 text-gray-400" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mb-3">No content set for this field</p>
                                  <p className="text-xs text-gray-400 mb-4">Type: {template.type}</p>
                                  <Button size="sm" onClick={() => setEditingContentKey(template.key)} className="bg-[#0EA5E9] hover:bg-[#0284C7]">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Content
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Registrations Tab */}
            <TabsContent value="registrations">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#64748B] mb-1">Total</p>
                          <p className="text-3xl font-bold text-[#0B132B]">{registrations.length}</p>
                        </div>
                        <User className="w-8 h-8 text-[#0EA5E9]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#64748B] mb-1">Free</p>
                          <p className="text-3xl font-bold text-[#22C55E]">{freeCount}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#64748B] mb-1">Paid</p>
                          <p className="text-3xl font-bold text-[#0EA5E9]">{paidCount}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-[#0EA5E9]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#64748B] mb-1">Pending Review</p>
                          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <CardTitle>Filters</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCSV("free")}
                          disabled={freeCount === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Free ({freeCount})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCSV("paid")}
                          disabled={paidCount === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Paid ({paidCount})
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by name, email, or organization..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <Select value={attendeeTypeFilter} onValueChange={setAttendeeTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Attendee Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="exhibitor">Exhibitor</SelectItem>
                          <SelectItem value="sponsor">Sponsor</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Review Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Tabs value={activeRegTab} onValueChange={setActiveRegTab}>
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="free">
                      Free Registrations ({freeCount})
                    </TabsTrigger>
                    <TabsTrigger value="paid">
                      Paid Registrations ({paidCount})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="free" className="mt-6">
                    {isLoadingRegistrations ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0EA5E9]" />
                      </div>
                    ) : filteredRegistrations.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-[#64748B] text-lg">No free registrations found</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {filteredRegistrations.map(registration => (
                          <RegistrationCard 
                            key={registration.id} 
                            registration={registration}
                            onVerify={handleVerifyRegistration}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="paid" className="mt-6">
                    {isLoadingRegistrations ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0EA5E9]" />
                      </div>
                    ) : filteredRegistrations.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-[#64748B] text-lg">No paid registrations found</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {filteredRegistrations.map(registration => (
                          <RegistrationCard 
                            key={registration.id} 
                            registration={registration}
                            onVerify={handleVerifyRegistration}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="text-center text-sm text-[#64748B]">
                  Showing {filteredRegistrations.length} of {activeRegTab === "free" ? freeCount : paidCount} {activeRegTab} registrations
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
