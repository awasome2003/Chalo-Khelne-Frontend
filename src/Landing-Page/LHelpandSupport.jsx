import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MessageCircle, ChevronDown, ChevronUp, ArrowLeft, HelpCircle, Send } from "lucide-react";

const FAQS = [
  { q: "How do I book a turf?", a: "Go to Venues, select a turf, pick your date and time slot, and confirm your booking. You'll get an instant confirmation." },
  { q: "How do I register for a tournament?", a: "Navigate to Tournaments, find one you're interested in, and click Register. You may need to pay an entry fee to confirm." },
  { q: "Can I cancel a booking?", a: "Yes, you can cancel from your bookings page. Refund policies depend on the venue's cancellation window." },
  { q: "How do I become a trainer?", a: "Register as a Trainer role. Once approved, you can set up your profile, certifications, and accept training requests." },
  { q: "Is there a mobile app?", a: "Yes! Chalo Khelne is available on Google Play. Search for 'Chalo Khelne' or scan the QR code on our home page." },
  { q: "How do I contact a venue owner?", a: "Each venue listing has contact details. You can also message them through the Group Chat feature after booking." },
];

const LHelpandSupport = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-gray-950 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 w-auto">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Help & Support</h1>
          </div>
          <p className="text-gray-400">Find answers or reach out to our team</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: "Email Us", value: "support@chalokhelne.com", color: "bg-orange-50 text-orange-500" },
            { icon: Phone, label: "Call Us", value: "+91 9272090926", color: "bg-emerald-50 text-emerald-600" },
            { icon: MessageCircle, label: "Live Chat", value: "Available 9am - 9pm", color: "bg-amber-50 text-amber-600" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{item.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {FAQS.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-4 hover:bg-gray-50/50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
                {openFaq === i && (
                  <p className="text-sm text-gray-500 mt-2 pr-8">{faq.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-1">Still need help?</h3>
          <p className="text-sm text-gray-500 mb-4">Our support team typically responds within 2 hours</p>
          <a
            href="mailto:support@chalokhelne.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition active:scale-[0.98]"
          >
            <Send className="w-4 h-4" /> Send a Message
          </a>
        </div>
      </div>
    </div>
  );
};

export default LHelpandSupport;
