import React, { useEffect, useMemo, useState, useRef } from "react";
import { X, Video, Phone, ChevronLeft, ChevronRight } from "lucide-react";
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
    [key: string]: Array<{
      date: string;
      slots: Slot[];
    }>;
  };
}

const BookingDrawer: React.FC<Props> = ({
  doctor,
  open,
  onClose,
  onBooked,
}) => {
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
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  const days = useMemo(() => {
    if (!availableDates || availableDates.length === 0) return [];
    return availableDates.map((dateStr) => new Date(dateStr));
  }, [availableDates]);

  // Reset when doctor changes
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
  }, [doctor]);

  // Reset when mode changes - IMPORTANT: Clear all state
  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
    setFetchError(null);
    setAvailableMonthKeys([]);
    setAvailableDates([]);
    setAllMonthsData({});
    setCurrentMonth(new Date()); // Reset to current month
  }, [mode]);

  const monthKey = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  // 🔥 FETCH SLOTS WITH MODE FILTERING
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor) return;

      setLoadingSlots(true);
      setFetchError(null);

      try {
        console.log(`[BookingDrawer] Fetching slots for mode: ${mode}`);
        const res = await api.get<SlotsAPIResponse>(
          `/api/patient/slots/${doctor._id}`,
          {
            params: { mode },
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );
        console.log(`[BookingDrawer] API Response for mode ${mode}:`, res.data);

        if (
          !res.data ||
          !res.data.availableMonths ||
          Object.keys(res.data.availableMonths).length === 0
        ) {
          setSlots([]);
          setAvailableMonthKeys([]);
          setAvailableDates([]);
          setAllMonthsData({});
          setFetchError(
            `No slots available for ${
              mode === "online" ? "online consultations" : "in-person visits"
            }`
          );
          return;
        }

        // Store all months data
        setAllMonthsData(res.data.availableMonths);

        const keys = Object.keys(res.data.availableMonths).sort();
        console.log(`[BookingDrawer] Available month keys for ${mode}:`, keys);
        setAvailableMonthKeys(keys);

        const monthData: MonthDataEntry[] =
          res.data.availableMonths[monthKey] ?? [];

        const todayStr = formatDate(new Date());

        const futureDates = monthData
          .map((entry) => entry.date.slice(0, 10))
          .filter((dateStr) => dateStr >= todayStr);

        console.log(`[BookingDrawer] Future dates for ${monthKey} in ${mode} mode:`, futureDates);
        setAvailableDates(futureDates);

        // If no dates available for current month, try to set first available month
        if (futureDates.length === 0 && keys.length > 0) {
          const firstAvailableMonth = keys.find((key) => {
            const monthData = res.data.availableMonths[key] ?? [];
            const dates = monthData
              .map((entry) => entry.date.slice(0, 10))
              .filter((dateStr) => dateStr >= todayStr);
            return dates.length > 0;
          });

          if (firstAvailableMonth) {
            const [y, m] = firstAvailableMonth.split("-");
            const newMonth = new Date(Number(y), Number(m) - 1);
            console.log(`[BookingDrawer] Switching to first available month: ${firstAvailableMonth}`);
            setCurrentMonth(newMonth);
            return;
          }
        }

        // Set slots for the selected date if it exists in current month data
        if (selectedDate) {
          const dateEntry = monthData.find(
            (entry) => entry.date.slice(0, 10) === formatDate(selectedDate)
          );
          setSlots(dateEntry?.slots ?? []);
        }
      } catch (err: any) {
        console.error("[BookingDrawer] Failed to fetch slots", err);
        setSlots([]);
        setAvailableMonthKeys([]);
        setAvailableDates([]);
        setAllMonthsData({});
        setFetchError(
          err.response?.data?.message ||
            "Failed to load slots. Please try again."
        );
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctor, mode, monthKey]);

  // Update slots when selectedDate changes
  useEffect(() => {
    if (!selectedDate || !allMonthsData[monthKey]) {
      setSlots([]);
      return;
    }

    const monthData = allMonthsData[monthKey];
    const dateEntry = monthData.find(
      (entry) => entry.date.slice(0, 10) === formatDate(selectedDate)
    );

    console.log(`[BookingDrawer] Selected date: ${formatDate(selectedDate)}, Found slots:`, dateEntry?.slots.length ?? 0);
    setSlots(dateEntry?.slots ?? []);
    setSelectedTime(null); // Reset selected time when date changes
  }, [selectedDate, allMonthsData, monthKey]);

  // BOOKING
  const handleBook = async (formData: {
    name: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    aadhar: string;
    contact: string;
    allergies?: string[];
    diseases?: string[];
    pastSurgeries?: string[];
    currentMedications?: string[];
    reports?: FileList | null;
  }) => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("patientToken="))
      ?.split("=")[1];

    // ⛔ Not logged in
    if (!token) {
      toast.info("Please login to book an appointment.");
      setTimeout(() => {
        window.location.href = "/patient-login";
      }, 1200);
      return;
    }

    // ⛔ Missing data
    if (!doctor || !selectedDate || !selectedTime) {
      toast.warn("Please select date & time.");
      return;
    }

    const selectedSlotId = slots.find((s) => s.time === selectedTime)?._id;

    if (!selectedSlotId) {
      toast.error("Invalid slot selected. Please try again.");
      return;
    }

    setBookingLoading(true);

    try {
      const data = new FormData();

      const payloadBase64 = token.split(".")[1];
      const pay = payloadBase64 ? JSON.parse(atob(payloadBase64)) : null;
      const userId = pay?.id;

      if (!userId) {
        toast.error("Invalid session. Please login again.");
        setTimeout(() => {
          window.location.href = "/patient-login";
        }, 1200);
        return;
      }

      data.append("doctorId", doctor._id);
      data.append("userId", userId);
      data.append("mode", mode);

      const [hour, minute] = selectedTime.split(":");

      const localDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        Number(hour),
        Number(minute),
        0
      ).toISOString();

      data.append("dateTime", localDateTime);
      data.append("fees", String(doctor.fees ?? 0));
      data.append("slot", selectedTime);
      data.append("slotId", selectedSlotId ?? "");

      data.append(
        "patient",
        JSON.stringify({
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          aadhar: formData.aadhar,
          contact: formData.contact,
        })
      );

      data.append(
        "emr",
        JSON.stringify({
          allergies: formData.allergies,
          diseases: formData.diseases,
          pastSurgeries: formData.pastSurgeries,
          currentMedications: formData.currentMedications,
        })
      );

      if (formData.reports) {
        Array.from(formData.reports).forEach((file) => {
          data.append("reports", file);
        });
      }

      await api.post("/api/booking/book", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        `Appointment booked successfully with Dr. ${doctor.fullName}!`
      );

      onBooked?.(formData);
      onClose();
    } catch (err: any) {
      console.error("Booking error", err);
      const msg =
        err.response?.data?.message || err.message || "Something went wrong.";

      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Physician",
            "name": "${doctor.fullName}",
            "medicalSpecialty": "${doctor.specialization ?? "General"}",
            "image": "${
              doctor.photo
                ? `http://localhost:3000/uploads/${doctor.photo}`
                : ""
            }",
            "priceRange": "${doctor.fees ?? "0"}"
          }
        `}</script>
      </Helmet>

      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop"
        />

        <aside
          ref={sidebarRef}
          className={`relative bg-white w-full sm:w-[480px] h-full shadow-2xl transform transition-transform duration-500 ease-in-out ${
            open ? "translate-x-0" : "translate-x-full"
          } rounded-l-2xl overflow-hidden`}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              {doctor.photo ? (
                <img
                  src={`http://localhost:3000/uploads/${doctor.photo}`}
                  alt={doctor.fullName}
                  className="h-14 w-14 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-[#0c213e] text-white text-lg font-semibold">
                  {doctor.fullName.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {doctor.fullName}
                </h2>
                <p className="text-sm text-gray-500">{doctor.specialization}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Content */}
          <div className="p-5 space-y-5 overflow-y-auto h-[calc(100%-4rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Mode buttons - Always show at top */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("offline")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  mode === "offline"
                    ? "bg-[#0c213e] text-white shadow"
                    : "bg-white text-gray-700 hover:border-[#0c213e]/40"
                }`}
              >
                <Phone className="w-4 h-4" /> Visit Doctor
              </button>
              <button
                onClick={() => setMode("online")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  mode === "online"
                    ? "bg-[#0c213e] text-white shadow"
                    : "bg-white text-gray-700 hover:border-[#0c213e]/40"
                }`}
              >
                <Video className="w-4 h-4" /> Consult Online
              </button>
            </div>

            {/* Loading State */}
            {loadingSlots && availableMonthKeys.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0c213e]"></div>
                <p className="text-gray-500 text-sm mt-3">Loading slots...</p>
              </div>
            )}

            {/* Error Message */}
            {!loadingSlots && fetchError && (
              <div className="text-center py-6 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 text-sm font-medium">{fetchError}</p>
              </div>
            )}

            {/* If no slots */}
            {!loadingSlots && !fetchError && availableMonthKeys.length === 0 && (
              <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  No Slots Available
                </h2>
                <p className="text-gray-500 text-sm">
                  This doctor hasn't added any appointment slots yet for{" "}
                  {mode === "online"
                    ? "online consultations"
                    : "in-person visits"}
                  .
                </p>
              </div>
            )}

            {/* Content when slots are available */}
            {!loadingSlots && !fetchError && availableMonthKeys.length > 0 && (
              <>
                {/* Month navigation */}
                <div className="flex justify-between items-center mb-3">
                  <button
                    className={`p-2 rounded ${
                      availableMonthKeys.indexOf(monthKey) <= 0
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                    disabled={availableMonthKeys.indexOf(monthKey) <= 0}
                    onClick={() => {
                      const idx = availableMonthKeys.indexOf(monthKey);
                      if (idx > 0) {
                        const prevKey = availableMonthKeys[idx - 1];
                        const [y, m] = prevKey.split("-");
                        const newMonth = new Date(Number(y), Number(m) - 1);
                        setCurrentMonth(newMonth);
                        setSelectedDate(null);
                      }
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-sm font-semibold text-gray-800">
                    {currentMonth.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                  <button
                    className={`p-2 rounded ${
                      availableMonthKeys.indexOf(monthKey) >=
                      availableMonthKeys.length - 1
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                    disabled={
                      availableMonthKeys.indexOf(monthKey) >=
                      availableMonthKeys.length - 1
                    }
                    onClick={() => {
                      const idx = availableMonthKeys.indexOf(monthKey);
                      if (idx < availableMonthKeys.length - 1) {
                        const nextKey = availableMonthKeys[idx + 1];
                        const [y, m] = nextKey.split("-");
                        const newMonth = new Date(Number(y), Number(m) - 1);
                        setCurrentMonth(newMonth);
                        setSelectedDate(null);
                      }
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Date selection */}
                {days.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {days.map((d) => {
                      const key = formatDate(d);
                      const active =
                        selectedDate && formatDate(selectedDate) === key;

                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedDate(d)}
                          className={`min-w-[72px] p-3 text-center rounded-lg border transition-all
                          ${
                            active
                              ? "bg-[#0c213e] text-white shadow"
                              : "bg-white text-gray-800 hover:shadow-sm"
                          }`}
                        >
                          <div className="text-xs opacity-80">
                            {formatDayShort(d)}
                          </div>
                          <div className="text-lg font-semibold">
                            {formatDateNumber(d)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">
                      No available dates in this month
                    </p>
                  </div>
                )}

                {/* Slots */}
                {selectedDate && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-700">
                      Available Slots
                    </h4>

                    {slots.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-sm font-medium">
                          No slots available for this date
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Please select another date
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => {
                          const isBooked = !slot.isActive;
                          const selected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot._id}
                              onClick={() => {
                                if (isBooked) return;
                                setSelectedTime(
                                  selectedTime === slot.time ? null : slot.time
                                );
                              }}
                              disabled={isBooked}
                              className={`p-2 rounded border text-sm transition-all ${
                                selected
                                  ? "bg-[#0c213e] text-white shadow"
                                  : "bg-white border-green-600 border-2 text-gray-600 hover:shadow-sm"
                              } ${
                                isBooked
                                  ? "!bg-gray-300 !text-white !border-white cursor-not-allowed"
                                  : ""
                              }`}
                            >
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
          </div>

          {selectedTime && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
              <button
                onClick={() => setShowForm(true)}
                disabled={bookingLoading}
                className="w-full bg-[#0c213e] text-white py-2 rounded-lg font-medium hover:bg-[#0f1650] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? "Processing..." : "Continue"}
              </button>
            </div>
          )}

          <AppointmentFormModal
            open={showForm}
            onClose={() => setShowForm(false)}
            onSubmit={handleBook}
            loading={bookingLoading}
          />
        </aside>
      </div>
    </>
  );
};

export default BookingDrawer;