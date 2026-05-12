import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Phone,
  Shield,
  CreditCard,
  Video,
  Pill,
} from "lucide-react";

const faqs = [
  {
    category: "Consultations",
    icon: Video,
    color: "from-blue-500 to-blue-600",
    questions: [
      {
        id: 1,
        question: "How does a video consultation work?",
        answer:
          "Once you book an appointment and it's time for your consultation, you'll receive a link to join a secure video call. Our platform supports HD video, screen sharing for reports, and chat — all within your browser. No downloads required. After the call, you'll receive a digital prescription and follow-up notes within minutes.",
      },
      {
        id: 2,
        question: "Can I consult a doctor immediately without prior booking?",
        answer:
          "Yes! Our 'Consult Now' feature connects you with an available doctor in under 60 seconds. Available 24/7, this is ideal for urgent queries, minor illnesses, or when you need quick medical advice. Simply choose your specialty and we'll match you with a doctor instantly.",
      },
      {
        id: 3,
        question: "Are video consultations legally valid in India?",
        answer:
          "Absolutely. Video consultations conducted on our platform fully comply with MCI (Medical Council of India) telemedicine guidelines issued in 2020. All prescriptions generated are digitally signed by licensed doctors, making them legally valid across India at all pharmacies.",
      },
    ],
  },
  {
    category: "Doctors & Trust",
    icon: Shield,
    color: "from-emerald-500 to-emerald-600",
    questions: [
      {
        id: 4,
        question: "How are doctors verified on your platform?",
        answer:
          "Every doctor undergoes a strict 3-step verification: (1) Medical degree & license verification with MCI/State Medical Councils, (2) Identity verification via Aadhaar, and (3) Background check and peer review. We display each doctor's license number so you can independently verify it. Only ~20% of applicants pass our screening.",
      },
      {
        id: 5,
        question: "Can I see doctor reviews and ratings before booking?",
        answer:
          "Yes. Every doctor's profile shows their verified patient ratings, number of consultations completed, years of experience, and detailed written reviews. Reviews can only be left by patients who completed a consultation — no fake reviews. Look for our 'Verified Review' badge.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    icon: CreditCard,
    color: "from-purple-500 to-purple-600",
    questions: [
      {
        id: 6,
        question: "What payment methods are accepted?",
        answer:
          "We accept all major UPI apps (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking from 50+ banks, and cash at partner clinics. All online payments are secured with 256-bit SSL encryption and are PCI-DSS compliant.",
      },
      {
        id: 7,
        question: "What is your refund policy?",
        answer:
          "If a doctor doesn't join within 10 minutes of the appointment, you get an automatic 100% refund within 24 hours. For cancellations made 2+ hours before the appointment, full refund. For technical issues on our end, full refund always. Refunds are processed to the original payment method within 3–5 business days.",
      },
    ],
  },
  {
    category: "Lab Tests & Medicines",
    icon: Pill,
    color: "from-orange-500 to-orange-600",
    questions: [
      {
        id: 8,
        question: "How do home lab test collections work?",
        answer:
          "Book a test and choose 'Home Collection'. A certified phlebotomist will arrive at your location within your chosen 1-hour slot. All collection kits are sterile and single-use. Samples are transported in temperature-controlled containers to NABL/CAP-accredited labs. Results are shared digitally within the committed turnaround time.",
      },
      {
        id: 9,
        question: "Can I upload a prescription to order medicines?",
        answer:
          "Yes. Upload a photo or PDF of your prescription (from any doctor, not just from our platform). Our pharmacist team verifies it within 30 minutes. For medicines requiring Schedule H/H1 prescriptions, verification is mandatory. Delivery is done through our trusted pharmacy partners within 2–4 hours in most cities.",
      },
    ],
  },
];



interface Question {
  id: number;
  question: string;
  answer: string;
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: Question;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`faq-item group rounded-2xl border transition-all duration-300 ${
        isOpen
          ? "border-[#0c213e] shadow-lg shadow-[#0c213e]/10 bg-white"
          : "border-gray-200 bg-white hover:border-[#0c213e]/40 hover:shadow-md"
      }`}
      style={{
        transitionDelay: `${index * 30}ms`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-5 sm:p-6 flex items-start gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0c213e] rounded-2xl"
        aria-expanded={isOpen}
      >
        {/* Numbered badge */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            isOpen
              ? "bg-[#0c213e] text-white scale-110"
              : "bg-gray-100 text-gray-500 group-hover:bg-[#0c213e]/10 group-hover:text-[#0c213e]"
          }`}
        >
          {question.id}
        </div>

        <div className="flex-1 min-w-0">
          <span
            className={`font-semibold text-base sm:text-lg leading-snug transition-colors duration-200 ${
              isOpen ? "text-[#0c213e]" : "text-gray-800 group-hover:text-[#0c213e]"
            }`}
          >
            {question.question}
          </span>
        </div>

        {/* Chevron */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-400 ${
            isOpen
              ? "bg-[#0c213e] rotate-180"
              : "bg-gray-100 group-hover:bg-[#0c213e]/10"
          }`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-colors duration-200 ${
              isOpen ? "text-white" : "text-gray-500 group-hover:text-[#0c213e]"
            }`}
          />
        </div>
      </button>

      {/* Animated answer panel */}
      <div
        style={{ height: `${height}px` }}
        className="overflow-hidden transition-[height] duration-400 ease-in-out"
      >
        <div ref={contentRef}>
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[4.5rem]">
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-[#0c213e]/20 to-transparent mb-4" />
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Category {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  questions: Question[];
}

function CategoryTab({
  category,
  isActive,
  onClick,
  color,
}: {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  color: string;
}) {
  const Icon = category.icon;
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-250 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0c213e] ${
        isActive
          ? "bg-[#0c213e] text-white shadow-lg shadow-[#0c213e]/30"
          : "bg-white text-gray-600 border border-gray-200 hover:border-[#0c213e]/40 hover:text-[#0c213e] hover:shadow-sm"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
          isActive ? "bg-white/20" : `bg-gradient-to-br ${color} group-hover:scale-110`
        }`}
      >
        <Icon className={`w-3 h-3 ${isActive ? "text-white" : "text-white"}`} />
      </div>
      {category.category}
      <span
        className={`ml-1 text-xs rounded-full px-1.5 py-0.5 font-bold transition-all ${
          isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        {category.questions.length}
      </span>
    </button>
  );
}

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 1: true });
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (id: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Search across all categories
  const searchResults = searchQuery.trim()
    ? faqs.flatMap((cat) =>
        cat.questions
          .filter(
            (q) =>
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((q) => ({ ...q, categoryName: cat.category }))
      )
    : null;

  const activeQuestions = searchResults
    ? null
    : faqs[activeCategory].questions;

  // Stats data for potential future use
  // const stats = [
  //   { value: "50000", suffix: "+", label: "Questions Answered" },
  //   { value: "4", suffix: ".9★", label: "Support Rating" },
  //   { value: "2", suffix: " min", label: "Avg Response Time" },
  // ];

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0c213e]/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
        {/* Subtle grid */}
        {/* <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#0c213e 1px, transparent 1px), linear-gradient(90deg, #0c213e 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        /> */}
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#0c213e]/8 border border-[#0c213e]/15 text-[#0c213e] px-4 py-2 rounded-full mb-6 text-sm font-semibold">
            <HelpCircle className="w-4 h-4" />
            Got Questions? We Have Answers
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Frequently Asked
            <span className="relative ml-3">
              <span className="relative z-10 text-[#0c213e]">Questions</span>
              {/* Underline accent */}
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#0c213e] to-blue-400 rounded-full" />
            </span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about booking appointments, consultations,
            lab tests, and medicines — answered clearly.
          </p>
        </div>

        {/* Stats strip */}
        {/* <div className="flex justify-center gap-8 sm:gap-16 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#0c213e]">
                <AnimatedNumber value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div> */}

        {/* Search bar */}
        {/* <div className="mb-10">
          <div
            className={`relative mx-auto max-w-xl transition-all duration-300 ${
              isSearchFocused ? "max-w-2xl" : ""
            }`}
          >
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                isSearchFocused
                  ? "bg-[#0c213e]/8 blur-sm scale-105"
                  : "bg-transparent"
              }`}
            />
            <div
              className={`relative flex items-center bg-white border-2 rounded-2xl transition-all duration-300 shadow-sm ${
                isSearchFocused
                  ? "border-[#0c213e] shadow-lg shadow-[#0c213e]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="pl-4 pr-2 text-gray-400 flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search your question..."
                className="flex-1 py-4 px-2 text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div> */}

        {/* Category tabs — only shown when not searching */}
        {!searchQuery && (
          <div className="flex gap-2 sm:gap-3 flex-wrap justify-center mb-8">
            {faqs.map((cat, i) => (
              <CategoryTab
                key={i}
                category={cat}
                isActive={activeCategory === i}
                onClick={() => {
                  setActiveCategory(i);
                  setOpenItems({} as Record<number, boolean>);
                }}
                color={cat.color}
              />
            ))}
          </div>
        )}

        {/* FAQ list */}
        <div className="space-y-3">
          {/* Search results */}
          {searchResults && (
            <>
              {searchResults.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">
                    No results for "{searchQuery}"
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try different keywords or browse by category below
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-[#0c213e] font-semibold text-sm hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Found{" "}
                    <span className="font-semibold text-[#0c213e]">
                      {searchResults.length}
                    </span>{" "}
                    result{searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {searchResults.map((q, i) => (
                    <div key={q.id}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-xs font-semibold text-[#0c213e]/60 uppercase tracking-wider">
                          {q.categoryName}
                        </span>
                      </div>
                      <FAQItem
                        question={q}
                        answer={q.answer}
                        isOpen={!!openItems[q.id]}
                        onToggle={() => toggleItem(q.id)}
                        index={i}
                      />
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* Category questions */}
          {!searchResults &&
            activeQuestions &&
            activeQuestions.map((q, i) => (
              <FAQItem
                key={q.id}
                question={q}
                answer={q.answer}
                isOpen={!!openItems[q.id]}
                onToggle={() => toggleItem(q.id)}
                index={i}
              />
            ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 relative">
          <div className="bg-gradient-to-br from-[#0c213e] to-[#1a3557] rounded-3xl p-8 sm:p-10 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
                  <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/70 text-sm font-medium">
                    Still have questions?
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  We're here to help
                </h3>
                <p className="text-blue-200 text-sm sm:text-base max-w-sm">
                  Our support team is available 24/7 to answer any questions
                  you might have.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <a href="tel:18001234567">
                  <button className="flex items-center gap-2 bg-white text-[#0c213e] hover:bg-gray-100 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                    <Phone className="w-4 h-4" />
                    Call Us Now
                  </button>
                </a>
                <a href="mailto:support@healthcare.com">
                  <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 cursor-pointer">
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smooth animation style */}
      <style>{`
        .faq-item {
          will-change: transform, box-shadow;
        }
        .transition-\\[height\\] {
          transition-property: height;
        }
        .duration-400 {
          transition-duration: 400ms;
        }
        .ease-in-out {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        .faq-item:hover {
          transform: translateY(-1px);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .faq-item {
          animation: fadeInUp 0.35s ease both;
        }
      `}</style>
    </section>
  );
}