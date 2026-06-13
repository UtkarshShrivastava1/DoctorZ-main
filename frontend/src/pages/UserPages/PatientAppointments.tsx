import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Phone,
  Star,
  Wifi,
  MapPin,
  Hash,
  User,
  Stethoscope,
  Calendar,
  Clock,
  MessageSquare,
  X,
  IndianRupee,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../Services/mainApi";
import { toast } from "react-toastify";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Doctor {
  _id: string;
  fullName: string;
  gender: string;
  MobileNo: string;
  specialization: string;
}

interface OnlineBooking {
  type: "online";
  doctor: Doctor;
  bookingDate: string;
  slot: string;
  roomId: string;
  meetingLink: string;
  fees: number;
  status: string;
}

interface OfflineBooking {
  type: "offline";
  doctor: Doctor;
  bookingDate: string;
  tokenNumber: number;
  fees: number;
  status: string;
  paid: boolean;
}

interface ApiResponse {
  data: {
    online: OnlineBooking[];
    offline: OfflineBooking[];
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── InfoChip ──────────────────────────────────────────────────────────────────

const InfoChip: React.FC<{ icon: React.ReactNode; label: string; value: string; subtle?: boolean }> = ({
  icon,
  label,
  value,
  subtle,
}) => (
  <div className="flex items-start gap-2.5">
    <div className="w-8 h-8 bg-[#0c213e]/8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${subtle ? "text-gray-400 italic" : "text-gray-700"}`}>{value}</p>
    </div>
  </div>
);

// ─── Doctor Avatar ─────────────────────────────────────────────────────────────

const DoctorAvatar: React.FC<{ name: string }> = ({ name }) => (
  <div className="w-11 h-11 bg-[#0c213e] rounded-xl flex items-center justify-center flex-shrink-0">
    <span className="text-xs font-bold text-[#a8c4e0] tracking-wide">{getInitials(name)}</span>
  </div>
);

// ─── Empty State ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
    <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
    <p className="text-base text-gray-400">{subtitle}</p>
  </div>
);

// ─── Online Booking Card ───────────────────────────────────────────────────────

const OnlineCard: React.FC<{
  booking: OnlineBooking;
  onReview: (id: string) => void;
  onChat: (roomId: string) => void;
}> = ({ booking, onReview, onChat }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    {/* Card header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/60">
      <div className="flex items-center gap-4">
        <DoctorAvatar name={booking.doctor.fullName} />
        <div>
          <p className="text-base font-bold text-[#0c213e]">Dr. {booking.doctor.fullName}</p>
          <p className="text-sm text-gray-400 mt-0.5">{booking.doctor.specialization}</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold">
        <Wifi size={12} /> Online
      </span>
    </div>

    {/* Card body */}
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5 mb-6">
        <InfoChip
          icon={<User size={14} className="text-[#0c213e]/60" />}
          label="Gender"
          value={booking.doctor.gender}
        />
        <InfoChip
          icon={<Phone size={14} className="text-[#0c213e]/60" />}
          label="Contact"
          value={booking.doctor.MobileNo}
        />
        <InfoChip
          icon={<Calendar size={14} className="text-[#0c213e]/60" />}
          label="Date"
          value={formatDate(booking.bookingDate)}
        />
        <InfoChip
          icon={<Clock size={14} className="text-[#0c213e]/60" />}
          label="Slot"
          value={booking.slot}
        />
        <InfoChip
          icon={<IndianRupee size={14} className="text-[#0c213e]/60" />}
          label="Fees"
          value={`₹${booking.fees}`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
        <button
          onClick={() => onChat(booking.roomId)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0c213e] hover:bg-[#132d54] text-white text-sm font-semibold rounded-xl transition-colors duration-150"
        >
          <MessageSquare size={15} />
          Chat with Doctor
        </button>
        <button
          onClick={() => onReview(booking.doctor._id)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors duration-150"
        >
          <Star size={15} />
          Leave Review
        </button>
      </div>
    </div>
  </div>
);

// ─── Offline Booking Card ──────────────────────────────────────────────────────

const OfflineCard: React.FC<{
  booking: OfflineBooking;
  onReview: (id: string) => void;
}> = ({ booking, onReview }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    {/* Card header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/60">
      <div className="flex items-center gap-4">
        <DoctorAvatar name={booking.doctor.fullName} />
        <div>
          <p className="text-base font-bold text-[#0c213e]">Dr. {booking.doctor.fullName}</p>
          <p className="text-sm text-gray-400 mt-0.5">{booking.doctor.specialization}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {booking.paid ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-semibold">
            <CheckCircle2 size={12} /> Paid
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-semibold">
            <XCircle size={12} /> Unpaid
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
          <MapPin size={12} /> Clinic
        </span>
      </div>
    </div>

    {/* Card body */}
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5 mb-6">
        <InfoChip
          icon={<User size={14} className="text-[#0c213e]/60" />}
          label="Gender"
          value={booking.doctor.gender}
        />
        <InfoChip
          icon={<Phone size={14} className="text-[#0c213e]/60" />}
          label="Contact"
          value={booking.doctor.MobileNo}
        />
        <InfoChip
          icon={<Calendar size={14} className="text-[#0c213e]/60" />}
          label="Date"
          value={formatDate(booking.bookingDate)}
        />
        <InfoChip
          icon={<Hash size={14} className="text-[#0c213e]/60" />}
          label="Token No."
          value={`Token ${booking.tokenNumber}`}
        />
        <InfoChip
          icon={<IndianRupee size={14} className="text-[#0c213e]/60" />}
          label="Fees"
          value={`₹${booking.fees}`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
        <button
          onClick={() => onReview(booking.doctor._id)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0c213e] hover:bg-[#132d54] text-white text-sm font-semibold rounded-xl transition-colors duration-150"
        >
          <Star size={15} />
          Leave Review
        </button>
      </div>
    </div>
  </div>
);

// ─── Review Modal ──────────────────────────────────────────────────────────────

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const ReviewModal: React.FC<{
  onClose: () => void;
  onSubmit: () => void;
  feedback: string;
  setFeedback: (v: string) => void;
  rating: number;
  setRating: (v: number) => void;
}> = ({ onClose, onSubmit, feedback, setFeedback, rating, setRating }) => {
  const [hover, setHover] = useState(0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleIn 0.25s ease-out" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0c213e] rounded-xl flex items-center justify-center">
              <Star size={18} className="text-[#a8c4e0]" />
            </div>
            <div>
              <p className="text-base font-bold text-[#0c213e]">Share Your Experience</p>
              <p className="text-xs text-gray-400 mt-0.5">Your feedback helps improve our services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6">
          {/* Star rating */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Rate Your Experience
            </p>
            <div className="flex gap-3 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    size={36}
                    strokeWidth={1.5}
                    className={`transition-all duration-150 ${
                      star <= (hover || rating)
                        ? "fill-[#0c213e] text-[#0c213e]"
                        : "text-gray-200 fill-gray-100"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm font-medium text-[#0c213e] mt-2">
                {RATING_LABELS[rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Comments <span className="text-gray-300 normal-case tracking-normal font-normal">(optional)</span>
            </p>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience with the doctor…"
              className="w-full bg-[#0c213e]/5 border border-[#0c213e]/15 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#0c213e]/40 focus:ring-2 focus:ring-[#0c213e]/10 transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={rating === 0}
              className="flex-1 py-2.5 rounded-xl bg-[#0c213e] hover:bg-[#132d54] text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93) translateY(-12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const PatientAppointments: React.FC = () => {
  const navigate = useNavigate();
  const patientId = useParams().id;

  const [onlineBookings, setOnlineBookings] = useState<OnlineBooking[]>([]);
  const [offlineBookings, setOfflineBookings] = useState<OfflineBooking[]>([]);
  const [activeTab, setActiveTab] = useState<"online" | "offline">("online");
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse>(
          `/api/patient/appointments/doctors/${patientId}`
        );
        setOnlineBookings(res.data.data.online || []);
        setOfflineBookings(res.data.data.offline || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [patientId]);

  const openReviewModal = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setFeedback("");
    setRating(0);
    setShowModal(true);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    try {
      await api.post(`/api/doctor/review/${selectedDoctorId}`, {
        userId: patientId,
        comment: feedback,
        rating,
      });
      toast.success("Review added successfully!");
      setShowModal(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#0c213e]/20 border-t-[#0c213e] rounded-full animate-spin" />
          <p className="text-base text-gray-400 font-medium">Loading appointments…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-[#0c213e] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Stethoscope size={26} className="text-[#a8c4e0]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[#0c213e] leading-tight">
                My Appointments
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                View and manage your doctor consultations
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                  <Wifi size={10} /> {onlineBookings.length} Online
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                  <MapPin size={10} /> {offlineBookings.length} Clinic
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("online")}
              className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "online"
                  ? "bg-[#0c213e] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Wifi size={16} />
              Online Consultations
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "online"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {onlineBookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("offline")}
              className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "offline"
                  ? "bg-[#0c213e] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <MapPin size={16} />
              Clinic Visits
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "offline"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {offlineBookings.length}
              </span>
            </button>
          </div>
        </div>

        {/* ── Online Tab ───────────────────────────────────────────────────── */}
        {activeTab === "online" && (
          <>
            {onlineBookings.length === 0 ? (
              <EmptyState
                icon={<Wifi size={30} className="text-gray-200" />}
                title="No online appointments"
                subtitle="Your upcoming online consultations will appear here"
              />
            ) : (
              <div className="space-y-4">
                {onlineBookings.map((booking, idx) => (
                  <OnlineCard
                    key={idx}
                    booking={booking}
                    onReview={openReviewModal}
                    onChat={(roomId) => navigate(`/doctor-chat/${roomId}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Offline Tab ──────────────────────────────────────────────────── */}
        {activeTab === "offline" && (
          <>
            {offlineBookings.length === 0 ? (
              <EmptyState
                icon={<MapPin size={30} className="text-gray-200" />}
                title="No clinic appointments"
                subtitle="Your upcoming clinic visits will appear here"
              />
            ) : (
              <div className="space-y-4">
                {offlineBookings.map((booking, idx) => (
                  <OfflineCard
                    key={idx}
                    booking={booking}
                    onReview={openReviewModal}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {/* ── Review Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <ReviewModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitReview}
          feedback={feedback}
          setFeedback={setFeedback}
          rating={rating}
          setRating={setRating}
        />
      )}
    </div>
  );
};

export default PatientAppointments;