import React, { useEffect, useMemo, useState, useRef } from "react";
import { X, Video, Phone, ChevronLeft, ChevronRight, CheckCircle, Calendar, Hash, MapPin, User } from "lucide-react";
import { formatDayShort, formatDateNumber } from "../utils/date.js";
import api from "../Services/mainApi.js";
import AppointmentFormModal from "./AppointmentFormModal.js";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

interface Slot {
  _id: string;
  time: string;
  isActive: boolean;
}

interface DoctorForBooking {
  _id: string;
  fullName: string;
  photo?: string;
  specialization?: string;
  fees: number;
  clinicAddress?: string;
}

interface Props {
  doctor: DoctorForBooking | null;
  open: boolean;
  onClose: () => void;
  onBooked?: (bookingInfo: unknown) => void;
}

interface MonthDataEntry {
  date: string;
  slots: Slot[];
}

interface SlotsAPIResponse {
  availableMonths: {
    [key: string]: Array<{ date: string; slots: Slot[] }>;
  };
}

interface TokenBookingResponse {
  message: string;
  tokenNumber: number;
  booking: unknown;
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
interface ConfirmationModalProps {
  open: boolean;
  tokenNumber: number;
  date: string;
  doctor: DoctorForBooking;
  patientName: string;
  onClose: () => void; // hides modal only (backdrop click)
  onDone: () => void;  // closes modal then drawer
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 text-[#0c213e]/50">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
    </div>
  </div>
);

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open, tokenNumber, date, doctor, patientName, onClose, onDone,
}) => {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)));
    } else {
      setAnimateIn(false);
      const t = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 transition-all duration-300 ${animateIn ? "opacity-100" : "opacity-0"}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${animateIn ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${animateIn ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Dark header strip */}
        <div className="bg-gradient-to-r from-[#0c213e] to-[#1a3a6b] px-6 pt-8 pb-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Animated check */}
          <div className={`mx-auto mb-4 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center transition-all duration-500 delay-150 ${animateIn ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
            <CheckCircle className="w-9 h-9 text-green-300" />
          </div>

          <h2 className={`text-xl font-bold transition-all duration-500 delay-200 ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            Booking Confirmed!
          </h2>
          <p className={`text-white/70 text-sm mt-1 transition-all duration-500 delay-250 ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            Your in-clinic token has been reserved
          </p>
        </div>

        {/* Token badge — floats out of header */}
        <div className={`mx-6 -mt-5 bg-white rounded-xl shadow-lg border border-gray-100 px-6 py-4 text-center transition-all duration-500 delay-300 ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-medium">Token Number</p>
          <p className="text-6xl font-extrabold text-[#0c213e] leading-none">#{tokenNumber}</p>
        </div>

        {/* Details list */}
        <div className={`px-6 py-5 space-y-3 transition-all duration-500 delay-[350ms] ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <DetailRow icon={<User className="w-4 h-4" />} label="Patient" value={patientName} />
          <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date" value={formattedDate} />
          <DetailRow icon={<Hash className="w-4 h-4" />} label="Doctor" value={`Dr. ${doctor.fullName}`} />
          {doctor.clinicAddress && (
            <DetailRow icon={<MapPin className="w-4 h-4" />} label="Clinic" value={doctor.clinicAddress} />
          )}
        </div>

        {/* Info note */}
        <div className={`mx-6 mb-5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 transition-all duration-500 delay-[400ms] ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <p className="text-xs text-amber-700 text-center leading-relaxed">
            Please visit the clinic and show this token number to the receptionist. Tokens are served in order.
          </p>
        </div>

        {/* CTA */}
        <div className={`px-6 pb-6 transition-all duration-500 delay-[450ms] ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <button
            onClick={onDone}
            className="w-full bg-[#0c213e] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#0f2a55] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
const BookingDrawer: React.FC<Props> = ({ doctor, open, onClose, onBooked }) => {
  const [mode, setMode] = useState<"online" | "offline">("offline");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableMonthKeys, setAvailableMonthKeys] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [allMonthsData, setAllMonthsData] = useState<{ [key: string]: MonthDataEntry[] }>({});
  const [confirmationData, setConfirmationData] = useState<{ tokenNumber: number; date: string; patientName: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const offlineDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Date[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date >= today) days.push(date);
    }
    return days;
  }, [currentMonth]);

  const days = useMemo(() => {
    if (!availableDates || availableDates.length === 0) return [];
    return availableDates.map((dateStr) => new Date(dateStr));
  }, [availableDates]);

  useEffect(() => {
    if (!doctor) return;
    setMode("offline");
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
    setShowForm(false);
    setFetchError(null);
    setAvailableMonthKeys([]);
    setAvailableDates([]);
    setAllMonthsData({});
    setConfirmationData(null);
    setShowConfirmation(false);
  }, [doctor]);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
    setFetchError(null);
    setAvailableMonthKeys([]);
    setAvailableDates([]);
    setAllMonthsData({});
    setCurrentMonth(new Date());
    setConfirmationData(null);
    setShowConfirmation(false);
  }, [mode]);

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  // Fetch slots (online only)
  useEffect(() => {
    if (mode !== "online") return;
    const fetchSlots = async () => {
      if (!doctor) return;
      setLoadingSlots(true);
      setFetchError(null);
      try {
        const res = await api.get<SlotsAPIResponse>(`/api/patient/slots/${doctor._id}`, {
          params: { mode },
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });

        if (!res.data?.availableMonths || Object.keys(res.data.availableMonths).length === 0) {
          setSlots([]); setAvailableMonthKeys([]); setAvailableDates([]); setAllMonthsData({});
          setFetchError("No slots available for online consultations");
          return;
        }

        setAllMonthsData(res.data.availableMonths);
        const keys = Object.keys(res.data.availableMonths).sort();
        setAvailableMonthKeys(keys);

        const monthData: MonthDataEntry[] = res.data.availableMonths[monthKey] ?? [];
        const todayStr = formatDate(new Date());
        const futureDates = monthData.map((e) => e.date.slice(0, 10)).filter((d) => d >= todayStr);
        setAvailableDates(futureDates);

        if (futureDates.length === 0 && keys.length > 0) {
          const first = keys.find((key) => {
            const md = res.data.availableMonths[key] ?? [];
            return md.map((e) => e.date.slice(0, 10)).some((d) => d >= todayStr);
          });
          if (first) {
            const [y, m] = first.split("-");
            setCurrentMonth(new Date(Number(y), Number(m) - 1));
          }
        }
      } catch (err: any) {
        setSlots([]); setAvailableMonthKeys([]); setAvailableDates([]); setAllMonthsData({});
        setFetchError(err.response?.data?.message || "Failed to load slots. Please try again.");
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [doctor, mode, monthKey]);

  useEffect(() => {
    if (mode !== "online") return;
    if (!selectedDate || !allMonthsData[monthKey]) { setSlots([]); return; }
    const dateEntry = allMonthsData[monthKey].find((e) => e.date.slice(0, 10) === formatDate(selectedDate));
    setSlots(dateEntry?.slots ?? []);
    setSelectedTime(null);
  }, [selectedDate, allMonthsData, monthKey, mode]);

  // ── Offline booking ──
  const handleOfflineBook = async (formData: {
    name: string; age: number; gender: "Male" | "Female" | "Other";
    aadhar: string; contact: string; allergies?: string[]; diseases?: string[];
    pastSurgeries?: string[]; currentMedications?: string[]; reports?: FileList | null;
  }) => {
    const token = document.cookie.split("; ").find((r) => r.startsWith("patientToken="))?.split("=")[1];
    if (!token) { toast.info("Please login to book an appointment."); setTimeout(() => { window.location.href = "/patient-login"; }, 1200); return; }
    if (!doctor || !selectedDate) { toast.warn("Please select a date."); return; }

    setBookingLoading(true);
    try {
      const pay = token.split(".")[1] ? JSON.parse(atob(token.split(".")[1])) : null;
      const userId = pay?.id;
      if (!userId) { toast.error("Invalid session. Please login again."); setTimeout(() => { window.location.href = "/patient-login"; }, 1200); return; }

      // const res = await api.post<TokenBookingResponse>("/api/bookOffline/bookToken", {
      //   doctorId: doctor._id,
      //   userId,
      //   date: formatDate(selectedDate),
      //   fees: doctor.fees ?? 0,
      //   patient: { name: formData.name, age: formData.age, gender: formData.gender, aadhar: formData.aadhar, contact: formData.contact },
      // });

      const res = await api.post<TokenBookingResponse>(
  "/api/bookOffline/bookToken",
  {
    doctorId: doctor._id,
    fullName: formData.name,
    gender: formData.gender,

    // convert age to DOB if backend strictly requires dob
    dob: new Date(
      new Date().getFullYear() - formData.age,
      0,
      1
    ).toISOString(),

    mobileNumber: formData.contact,
    aadhar: formData.aadhar,

    date: formatDate(selectedDate),

    paid: true,
  }
);

      setShowForm(false);
      setConfirmationData({ tokenNumber: res.data.tokenNumber, date: formatDate(selectedDate), patientName: formData.name });
      setTimeout(() => setShowConfirmation(true), 150);
      onBooked?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Online booking ──
  const handleBook = async (formData: {
    name: string; age: number; gender: "Male" | "Female" | "Other";
    aadhar: string; contact: string; allergies?: string[]; diseases?: string[];
    pastSurgeries?: string[]; currentMedications?: string[]; reports?: FileList | null;
  }) => {
    if (mode === "offline") return handleOfflineBook(formData);

    const token = document.cookie.split("; ").find((r) => r.startsWith("patientToken="))?.split("=")[1];
    if (!token) { toast.info("Please login to book an appointment."); setTimeout(() => { window.location.href = "/patient-login"; }, 1200); return; }
    if (!doctor || !selectedDate || !selectedTime) { toast.warn("Please select date & time."); return; }

    const selectedSlotId = slots.find((s) => s.time === selectedTime)?._id;
    if (!selectedSlotId) { toast.error("Invalid slot selected. Please try again."); return; }

    setBookingLoading(true);
    try {
      const data = new FormData();
      const pay = token.split(".")[1] ? JSON.parse(atob(token.split(".")[1])) : null;
      const userId = pay?.id;
      if (!userId) { toast.error("Invalid session. Please login again."); setTimeout(() => { window.location.href = "/patient-login"; }, 1200); return; }

      data.append("doctorId", doctor._id);
      data.append("userId", userId);
      data.append("mode", mode);
      const [hour, minute] = selectedTime.split(":");
      data.append("dateTime", new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Number(hour), Number(minute), 0).toISOString());
      data.append("fees", String(doctor.fees ?? 0));
      data.append("slot", selectedTime);
      data.append("slotId", selectedSlotId);
      data.append("patient", JSON.stringify({ name: formData.name, age: formData.age, gender: formData.gender, aadhar: formData.aadhar, contact: formData.contact }));
      data.append("emr", JSON.stringify({ allergies: formData.allergies, diseases: formData.diseases, pastSurgeries: formData.pastSurgeries, currentMedications: formData.currentMedications }));
      if (formData.reports) Array.from(formData.reports).forEach((f) => data.append("reports", f));

      await api.post("/api/booking/book", data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Appointment booked successfully with Dr. ${doctor.fullName}!`);
      onBooked?.(formData);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!doctor) return null;

  const today = new Date();
  const isCurrentMonth = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
  const maxOfflineMonth = new Date(today.getFullYear(), today.getMonth() + 2);
  const isMaxOfflineMonth = currentMonth.getFullYear() === maxOfflineMonth.getFullYear() && currentMonth.getMonth() === maxOfflineMonth.getMonth();

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{`{"@context":"https://schema.org","@type":"Physician","name":"${doctor.fullName}","medicalSpecialty":"${doctor.specialization ?? "General"}","image":"${doctor.photo ? `http://localhost:3000/uploads/${doctor.photo}` : ""}","priceRange":"${doctor.fees ?? "0"}"}`}</script>
      </Helmet>

      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop" />

        <aside
          ref={sidebarRef}
          className={`relative bg-white w-full sm:w-[480px] h-full shadow-2xl transform transition-transform duration-500 ease-in-out ${open ? "translate-x-0" : "translate-x-full"} rounded-l-2xl overflow-hidden`}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              {doctor.photo ? (
                <img src={`${doctor.photo}`} alt={doctor.fullName} className="h-14 w-14 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-[#0c213e] text-white text-lg font-semibold">{doctor.fullName.charAt(0)}</div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Dr. {doctor.fullName}</h2>
                <p className="text-sm text-gray-500">{doctor.specialization}</p>
                <p className="text-md text-gray-800 font-bold">₹{doctor.fees}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:bg-gray-200 rounded-full p-2 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Content */}
          <div className="p-5 space-y-5 overflow-y-auto h-[calc(100%-4rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setMode("offline")} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${mode === "offline" ? "bg-[#0c213e] text-white shadow" : "bg-white text-gray-700 hover:border-[#0c213e]/40"}`}>
                <Phone className="w-4 h-4" /> Visit Doctor
              </button>
              <button onClick={() => setMode("online")} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${mode === "online" ? "bg-[#0c213e] text-white shadow" : "bg-white text-gray-700 hover:border-[#0c213e]/40"}`}>
                <Video className="w-4 h-4" /> Consult Online
              </button>
            </div>

            {/* ── OFFLINE ── */}
            {mode === "offline" && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
                  <p className="font-medium mb-0.5">Walk-in Token Booking</p>
                  <p className="text-xs text-blue-500">Select a date and get your token number for an in-person visit</p>
                </div>

                <div className="flex justify-between items-center">
                  <button className={`p-2 rounded ${isCurrentMonth ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`} disabled={isCurrentMonth} onClick={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)); setSelectedDate(null); }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-gray-800">{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
                  <button className={`p-2 rounded ${isMaxOfflineMonth ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`} disabled={isMaxOfflineMonth} onClick={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); setSelectedDate(null); }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {offlineDays.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {offlineDays.map((d) => {
                      const key = formatDate(d);
                      const active = selectedDate && formatDate(selectedDate) === key;
                      return (
                        <button key={key} onClick={() => setSelectedDate(d)} className={`min-w-[72px] p-3 text-center rounded-lg border transition-all ${active ? "bg-[#0c213e] text-white shadow" : "bg-white text-gray-800 hover:shadow-sm"}`}>
                          <div className="text-xs opacity-80">{formatDayShort(d)}</div>
                          <div className="text-lg font-semibold">{formatDateNumber(d)}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">No available dates in this month</p>
                  </div>
                )}

                {selectedDate && (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <p className="font-medium">Selected Date</p>
                    <p className="text-[#0c213e] font-semibold mt-0.5">{selectedDate.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    <p className="text-xs text-gray-400 mt-1">Your token number will be assigned after booking</p>
                  </div>
                )}
              </>
            )}

            {/* ── ONLINE ── */}
            {mode === "online" && (
              <>
                {loadingSlots && availableMonthKeys.length === 0 && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0c213e]" />
                    <p className="text-gray-500 text-sm mt-3">Loading slots...</p>
                  </div>
                )}
                {!loadingSlots && fetchError && (
                  <div className="text-center py-6 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-red-600 text-sm font-medium">{fetchError}</p>
                  </div>
                )}
                {!loadingSlots && !fetchError && availableMonthKeys.length === 0 && (
                  <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">No Slots Available</h2>
                    <p className="text-gray-500 text-sm">This doctor hasn't added any appointment slots yet for online consultations.</p>
                  </div>
                )}
                {!loadingSlots && !fetchError && availableMonthKeys.length > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <button className={`p-2 rounded ${availableMonthKeys.indexOf(monthKey) <= 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`} disabled={availableMonthKeys.indexOf(monthKey) <= 0} onClick={() => { const idx = availableMonthKeys.indexOf(monthKey); if (idx > 0) { const [y, m] = availableMonthKeys[idx - 1].split("-"); setCurrentMonth(new Date(Number(y), Number(m) - 1)); setSelectedDate(null); } }}>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-gray-800">{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
                      <button className={`p-2 rounded ${availableMonthKeys.indexOf(monthKey) >= availableMonthKeys.length - 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`} disabled={availableMonthKeys.indexOf(monthKey) >= availableMonthKeys.length - 1} onClick={() => { const idx = availableMonthKeys.indexOf(monthKey); if (idx < availableMonthKeys.length - 1) { const [y, m] = availableMonthKeys[idx + 1].split("-"); setCurrentMonth(new Date(Number(y), Number(m) - 1)); setSelectedDate(null); } }}>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {days.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300">
                        {days.map((d) => {
                          const key = formatDate(d);
                          const active = selectedDate && formatDate(selectedDate) === key;
                          return (
                            <button key={key} onClick={() => setSelectedDate(d)} className={`min-w-[72px] p-3 text-center rounded-lg border transition-all ${active ? "bg-[#0c213e] text-white shadow" : "bg-white text-gray-800 hover:shadow-sm"}`}>
                              <div className="text-xs opacity-80">{formatDayShort(d)}</div>
                              <div className="text-lg font-semibold">{formatDateNumber(d)}</div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">No available dates in this month</p>
                      </div>
                    )}

                    {selectedDate && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">Available Slots</h4>
                        {slots.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-600 text-sm font-medium">No slots available for this date</p>
                            <p className="text-gray-500 text-xs mt-1">Please select another date</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {slots.map((slot) => {
                              const isBooked = !slot.isActive;
                              const selected = selectedTime === slot.time;
                              return (
                                <button key={slot._id} onClick={() => { if (isBooked) return; setSelectedTime(selectedTime === slot.time ? null : slot.time); }} disabled={isBooked} className={`p-2 rounded border text-sm transition-all ${selected ? "bg-[#0c213e] text-white shadow" : "bg-white border-green-600 border-2 text-gray-600 hover:shadow-sm"} ${isBooked ? "!bg-gray-300 !text-white !border-white cursor-not-allowed" : ""}`}>
                                  {slot.time}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Sticky CTA */}
          {((mode === "offline" && selectedDate) || (mode === "online" && selectedTime)) && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
              <button onClick={() => setShowForm(true)} disabled={bookingLoading} className="w-full bg-[#0c213e] text-white py-2 rounded-lg font-medium hover:bg-[#0f1650] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {bookingLoading ? "Processing..." : mode === "offline" ? "Book Token" : "Continue"}
              </button>
            </div>
          )}

          <AppointmentFormModal open={showForm} onClose={() => setShowForm(false)} onSubmit={handleBook} loading={bookingLoading} />
        </aside>
      </div>

      {/* Confirmation modal — sits above everything at z-60 */}
      {confirmationData && doctor && (
        <ConfirmationModal
          open={showConfirmation}
          tokenNumber={confirmationData.tokenNumber}
          date={confirmationData.date}
          doctor={doctor}
          patientName={confirmationData.patientName}
          onClose={() => setShowConfirmation(false)}
          onDone={() => {
            setShowConfirmation(false);
            setTimeout(onClose, 50);
          }}
        />
      )}
    </>
  );
};

export default BookingDrawer;