import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Services/mainApi";
import packageIcon from "../assets/package.webp";
import kidneyIcon from "../assets/kidneyIcon.png";
import vitaminIcon from "../assets/vitaminIcon.jpg";
import heartIcon from "../assets/heartIcon.jpg";
import pregnancyIcon from "../assets/pregnancy.png";
import {
  Clock,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Thermometer,
  Pill,
  TestTube,
} from "lucide-react";
import toast from "react-hot-toast";

// --- Types ---
interface Test {
  _id: string;
  testName: string;
  price: number;
  category: string;
  description: string;
}

interface PackageDetailsType {
  _id: string;
  labId: string | { _id: string; labName?: string; name?: string };
  packageName: string;
  description: string;
  totalPrice: number;
  tests: Test[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  packageDetails: PackageDetailsType;
}

type TestCategory =
  | "Liver"
  | "Kidney"
  | "Diabetes"
  | "Fever"
  | "Vitamin"
  | "Pregnancy"
  | "Heart"
  | "Other";

// --- Category Icons ---
const categoryIcons: Record<TestCategory, React.ReactElement> = {
  Liver: <FlaskConical size={22} className="text-[#004b63]" />,
  Kidney: (
    <img src={kidneyIcon} alt="Kidney" className="w-6 h-6 object-contain -mt-[2px]" />
  ),
  Diabetes: <Pill size={22} className="text-[#004b63]" />,
  Fever: <Thermometer size={22} className="text-[#004b63]" />,
  Vitamin: (
    <img src={vitaminIcon} alt="Vitamin" className="w-6 h-6 object-contain -mt-[2px]" />
  ),
  Pregnancy: (
    <img src={pregnancyIcon} alt="Pregnancy" className="w-6 h-6 object-contain -mt-[2px]" />
  ),
  Heart: <img src={heartIcon} alt="Heart" className="w-6 h-6 object-contain -mt-[2px]" />,
  Other: <TestTube size={22} className="text-[#004b63]" />,
};

// ─── Booking Confirmation Modal ────────────────────────────────────────────────
interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: string;
  labName: string;
  bookingDate: string;
  price: number;
  testCount: number;
}

function BookingConfirmationModal({
  isOpen,
  onClose,
  packageName,
  labName,
  bookingDate,
  price,
  testCount,
}: BookingConfirmationModalProps) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  const formattedDate = bookingDate
    ? new Date(bookingDate + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: animate ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        backdropFilter: animate ? "blur(4px)" : "blur(0px)",
        transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "1.25rem",
          boxShadow:
            "0 25px 60px rgba(12,33,62,0.22), 0 4px 16px rgba(12,33,62,0.1)",
          maxWidth: "480px",
          width: "100%",
          overflow: "hidden",
          transform: animate
            ? "scale(1) translateY(0)"
            : "scale(0.92) translateY(24px)",
          opacity: animate ? 1 : 0,
          transition:
            "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: "5px",
            background:
              "linear-gradient(90deg, #0c213e 0%, #2a4a7f 60%, #4f7dc2 100%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0c213e 0%, #1a3a6e 100%)",
            padding: "2rem 2rem 1.5rem",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Animated checkmark */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: animate ? 0 : 60,
                transition: "stroke-dashoffset 0.6s ease 0.25s",
              }}
            >
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                fill="none"
              />
              <polyline
                points="8,16 13,21 24,10"
                stroke="#4ade80"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <h2
            style={{
              color: "#ffffff",
              fontSize: "1.35rem",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Package Booked!
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "0.85rem",
              marginTop: "0.35rem",
            }}
          >
            Your health package has been successfully scheduled
          </p>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.1rem",
              lineHeight: 1,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.1)")
            }
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.75rem 2rem" }}>
          {/* Summary card */}
          <div
            style={{
              background: "#f8faff",
              border: "1px solid #dde8f8",
              borderRadius: "0.875rem",
              padding: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1rem",
              }}
            >
              Booking Summary
            </p>

            <DetailRow label="Package" value={packageName} bold />
            <DetailRow label="Tests Included" value={`${testCount} tests`} />
            <DetailRow label="Lab / Clinic" value={labName} />
            <DetailRow label="Scheduled Date" value={formattedDate} />
            <DetailRow
              label="Amount Paid"
              value={`₹${price}`}
              valueStyle={{
                color: "#0c213e",
                fontWeight: 700,
                fontSize: "1.05rem",
              }}
              isLast
            />
          </div>

          {/* Info note */}
          {/* <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "0.625rem",
              padding: "0.75rem 1rem",
              display: "flex",
              gap: "0.6rem",
              alignItems: "flex-start",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "1px" }}>
              ℹ️
            </span>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#92400e",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Our team will contact you to confirm the sample collection time.
              Please keep your phone accessible.
            </p>
          </div> */}

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "0.625rem",
                border: "1.5px solid #d1d5db",
                background: "#ffffff",
                color: "#374151",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#0c213e";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f8faff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#d1d5db";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#ffffff";
              }}
            >
              Close
            </button>
            {/* <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "0.625rem",
                border: "none",
                background:
                  "linear-gradient(135deg, #0c213e 0%, #1a3a6e 100%)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
              }
            >
              View My Bookings
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable detail row inside the summary card
function DetailRow({
  label,
  value,
  bold,
  isLast,
  valueStyle,
}: {
  label: string;
  value: string;
  bold?: boolean;
  isLast?: boolean;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
        paddingBottom: isLast ? 0 : "0.75rem",
        marginBottom: isLast ? 0 : "0.75rem",
        borderBottom: isLast ? "none" : "1px solid #e9eef8",
      }}
    >
      <span style={{ fontSize: "0.82rem", color: "#6b7280", flexShrink: 0 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "0.875rem",
          color: "#111827",
          fontWeight: bold ? 600 : 500,
          textAlign: "right",
          ...valueStyle,
        }}
      >
        {value}
      </span>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

// --- Main Component ---
export const PackageDetails: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const [packageDetails, setPackageDetails] = useState<PackageDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [bookingDate, setBookingDate] = useState<string>("");

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState<string>("");

  const todayDateString = useMemo(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
    return localISO;
  }, []);

  const isPastDate = (dateStr: string) => {
    if (!dateStr) return false;
    const selected = new Date(dateStr);
    const s = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
    const today = new Date();
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return s < t;
  };

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const response = await api.get<ApiResponse>(`/api/lab/packages/${packageId}`);
        setPackageDetails(response.data.packageDetails);
      } catch (error) {
        console.error("Error fetching package details:", error);
      }
    };
    fetchPackageDetails();
  }, [packageId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Helper: extract lab name from labId (object or string)
  const getLabName = (labId: PackageDetailsType["labId"]): string => {
    if (typeof labId === "object" && labId !== null) {
      return (labId as any).labName || (labId as any).name || "Lab";
    }
    return "Lab";
  };

  const handlePackageBooking = async (pkgId: string, labId: string) => {
    // Validate date first
    if (!bookingDate) {
      toast.error("Please select a booking date before continuing.");
      return;
    }
    if (isPastDate(bookingDate)) {
      toast.error("Selected booking date cannot be in the past.");
      return;
    }

    try {
      setLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row: string) => row.startsWith("patientToken="))
        ?.split("=")[1];

      if (!token) {
        toast.error("Please login to book the package.");
        setLoading(false);
        return;
      }

      let patientId: string | null = null;
      try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        patientId = payload.id;
      } catch {
        toast.error("Invalid session. Please login again.");
        setLoading(false);
        return;
      }

      await api.post(
        `/api/lab/packages/book`,
        { packageId: pkgId, patientId, labId, bookingDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ── Show confirmation modal ──
      setConfirmedDate(bookingDate);
      setBookingDate("");
      setModalOpen(true);
    } catch (error) {
      console.error("Error booking package:", error);
      toast.error("Failed to book package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!packageDetails) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-gray-600">
        Loading Package Details...
      </div>
    );
  }

  // --- Group tests by category ---
  const groupedTests = packageDetails.tests.reduce((groups, test) => {
    const cat = test.category && test.category.trim() !== "" ? test.category : "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(test);
    return groups;
  }, {} as Record<string, Test[]>);

  const labName = getLabName(packageDetails.labId);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-6 justify-center items-start">

      {/* ── Booking Confirmation Modal ── */}
      <BookingConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        packageName={packageDetails.packageName}
        labName={labName}
        bookingDate={confirmedDate}
        price={packageDetails.totalPrice}
        testCount={packageDetails.tests.length}
      />

      {/* LEFT SECTION */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full md:w-1/3">
        <div className="flex gap-2.5">
          <img src={packageIcon} alt="Package" className="w-20 h-20 mb-4" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{packageDetails.packageName}</h2>
            <p className="text-gray-600 leading-relaxed">{packageDetails.description}</p>
          </div>
        </div>

        <div className="text-md border-t border-gray-200 pt-4 space-y-3 text-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="text-indigo-600" size={18} />
            <span>Sample collection within <strong>2 hours</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="text-indigo-600" size={18} />
            <span>Reports available within <strong>10 hours</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="text-indigo-600" size={18} />
            <span>10–12 hr fasting is required</span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-600 line-through text-sm">
            MRP ₹{Math.round(packageDetails.totalPrice * 1.6)}
          </p>
          <p className="text-2xl font-bold text-[#0c213e]">₹{packageDetails.totalPrice}</p>
          <p className="text-green-600 font-medium text-sm">60% off</p>
        </div>

        {/* Date picker */}
        <div className="mt-4 mb-3 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Choose booking date
          </label>
          <input
            type="date"
            value={bookingDate}
            min={todayDateString}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          {bookingDate && isPastDate(bookingDate) && (
            <p className="text-xs text-red-600 mt-1">Selected date is in the past.</p>
          )}
        </div>

        <button
          onClick={() =>
            handlePackageBooking(
              packageDetails._id,
              typeof packageDetails.labId === "string"
                ? packageDetails.labId
                : packageDetails.labId._id
            )
          }
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-xl transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-[#0c213e] hover:bg-[#1a3557] text-white"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            "Book Now"
          )}
        </button>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-col gap-6 w-full md:w-2/3">
        {/* TESTS INCLUDED */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Test(s) Included ({packageDetails.tests.length})
          </h3>

          {packageDetails.tests.length > 0 ? (
            <div className="space-y-3">
              {Object.entries(groupedTests).map(([category, tests]) => (
                <div
                  key={category}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      {categoryIcons[category as TestCategory] || categoryIcons["Other"]}
                      <span className="font-semibold text-gray-800">{category}</span>
                      <span className="text-gray-500 text-sm">({tests.length})</span>
                    </div>
                    <span className="text-gray-500">
                      {openCategories[category] ? (
                        <ChevronUp size={20} className="text-[#004b63]" />
                      ) : (
                        <ChevronDown size={20} className="text-[#004b63]" />
                      )}
                    </span>
                  </button>

                  {openCategories[category] && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {tests.map((test) => (
                        <div key={test._id} className="p-3 pl-6 border-b last:border-b-0">
                          <p className="font-medium text-indigo-700">{test.testName}</p>
                          {test.description && (
                            <p className="text-gray-600 text-sm mt-1">{test.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tests available for this package.</p>
          )}
        </div>

        {/* FAQ SECTION */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">FAQs</h3>

          <div className="divide-y divide-gray-200">
            {[
              {
                question: "Why is a blood test important?",
                answer:
                  "Blood tests help evaluate your overall health and detect a wide range of disorders such as anemia, infection, and diabetes.",
              },
              {
                question: "Do I need to fast before a blood test?",
                answer:
                  "Yes, fasting for 8–12 hours is required for certain tests like lipid profile or blood glucose tests for accurate results.",
              },
              {
                question: "How long does it take to get blood test results?",
                answer:
                  "Most basic test results are available within 6–12 hours. However, some specialized tests may take up to 24–48 hours.",
              },
              {
                question: "Is blood sample collection painful?",
                answer:
                  "No, only a small prick is felt during sample collection. The process is quick and safe.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group py-3 cursor-pointer transition-all duration-300"
              >
                <summary className="flex justify-between items-center text-gray-800 font-medium text-base list-none">
                  {faq.question}
                  <span className="ml-2 text-indigo-600 group-open:rotate-180 transition-transform">
                    <ChevronDown size={20} />
                  </span>
                </summary>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed pl-1">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};