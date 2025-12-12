import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import api from "../Services/mainApi";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

type SelectionType = "single" | "multiple" | "month";

interface WorkingHours {
  start: string;
  end: string;
}

interface Slot {
  time: string;
  isActive: boolean;
}

interface SavedSlot {
  _id: string;
  date: string;
  slots: Slot[];
}

interface CreateSlotResponse {
  success: boolean;
  createdDates: string[];
  alreadyExistDates: string[];
  message: string;
}

const TimeSlots: React.FC = () => {
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { drId } = useParams();
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const [step, setStep] = useState<number>(1);
  const [selectionType, setSelectionType] = useState<SelectionType | "">("");
  const [selectedSingleDate, setSelectedSingleDate] = useState<Date | undefined>(undefined);
  const [selectedMultipleDates, setSelectedMultipleDates] = useState<Date[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: "",
    end: "",
  });

  const [savedSlots, setSavedSlots] = useState<SavedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const doctorId = drId;

  // Fetch saved slots
  const fetchSavedSlots = async () => {
    if (!doctorId) return;
    try {
      const res = await api.get<SavedSlot[]>(
        `/api/availability/getTimeSlots/${doctorId}`
      );
      setSavedSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSavedSlots();
  }, [doctorId]);

  const handleSelectionType = (type: SelectionType) => {
    setSelectionType(type);
    setStep(2);
    setSelectedSingleDate(undefined);
    setSelectedMultipleDates([]);
  };

  const disabledDatesForCalendar = selectedSingleDate
    ? savedSlots
        .map((s) => new Date(s.date))
        .filter((d) => d.toDateString() !== selectedSingleDate.toDateString())
    : savedSlots.map((s) => new Date(s.date));

  const handleMonthSelect = (selected: Date[] | undefined) => {
    if (!selected) return;

    const firstDate = selected[0];
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    const today = new Date();

    const dates: Date[] = [];
    const d = new Date(year, month, 1);

    while (d.getMonth() === month) {
      if (
        d >= today &&
        !disabledDatesForCalendar.some(
          (dd) => dd.toDateString() === d.toDateString()
        )
      ) {
        dates.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }

    setSelectedMultipleDates(dates);
  };

  const handleSave = async () => {
    const dates =
      selectionType === "single"
        ? selectedSingleDate
          ? [selectedSingleDate.toLocaleDateString("en-CA")]
          : []
        : selectedMultipleDates.map((d) => d.toLocaleDateString("en-CA"));

    if (!dates.length) {
      Swal.fire({
        icon: "warning",
        title: "No dates selected",
        text: "Please select at least one date",
        confirmButtonColor: "#0c213e",
      });
      return;
    }
    if (!workingHours.start || !workingHours.end) {
      Swal.fire({
        icon: "warning",
        title: "Missing hours",
        text: "Please enter working hours",
        confirmButtonColor: "#0c213e",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingSlotId && selectedSingleDate) {
        const payload = {
          doctorId,
          date: selectedSingleDate.toLocaleDateString("en-CA"),
          workingHours,
        };

        await api.put("/api/availability/editTimeSlot", payload);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Time slots updated successfully",
          confirmButtonColor: "#0c213e",
        });

        setEditingSlotId(null);
      } else {
        const payload = { doctorId, dates, workingHours };
        const res = await api.post<CreateSlotResponse>(
          "/api/availability/createTimeSlot",
          payload
        );
        const data = res.data;

        if (data.createdDates.length > 0) {
          Swal.fire({
            icon: "success",
            title: "Slots Created",
            html: `Successfully created slots for <strong>${data.createdDates.length}</strong> date(s)`,
            confirmButtonColor: "#0c213e",
          });
        }

        if (data.alreadyExistDates.length > 0) {
          Swal.fire({
            icon: "info",
            title: "Already Exist",
            html: `Slots already exist for <strong>${data.alreadyExistDates.length}</strong> date(s)`,
            confirmButtonColor: "#0c213e",
          });
        }
      }

      setStep(1);
      setSelectionType("");
      setSelectedSingleDate(undefined);
      setSelectedMultipleDates([]);
      setWorkingHours({ start: "", end: "" });

      fetchSavedSlots();
    } catch (err: unknown) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#0c213e",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSlots = (slotItem: SavedSlot) => {
    setEditingSlotId(slotItem._id);
    setStep(2);
    setSelectionType("single");
    const slotDate = new Date(slotItem.date);
    setSelectedSingleDate(slotDate);
    setCurrentMonth(slotDate);

    setWorkingHours({
      start: slotItem.slots[0]?.time || "",
      end: slotItem.slots[slotItem.slots.length - 1]?.time || "",
    });
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const toggleSlot = async (slotId: string, time: string, isActive: boolean) => {
    try {
      await api.patch(`/api/availability/updateSlot/${slotId}`, {
        time,
        isActive,
      });
      fetchSavedSlots();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Availability Management
        </h1>
        <p className="text-gray-600">
          Manage your appointment slots and working hours
        </p>
      </div>

      {/* Step 1 - Selection Type */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              How would you like to set availability?
            </h2>
            <p className="text-gray-600">Choose your preferred method</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button
              className="group p-6 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-[#0c213e] hover:bg-[#0c213e]/5 transition-all duration-300"
              onClick={() => handleSelectionType("single")}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-600 transition-colors">
                <svg
                  className="w-7 h-7 text-blue-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Single Day</h3>
              <p className="text-sm text-gray-600 text-center">
                Set availability for one specific date
              </p>
            </button>

            <button
              className="group p-6 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-[#0c213e] hover:bg-[#0c213e]/5 transition-all duration-300"
              onClick={() => handleSelectionType("multiple")}
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-emerald-600 transition-colors">
                <svg
                  className="w-7 h-7 text-emerald-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Multiple Days</h3>
              <p className="text-sm text-gray-600 text-center">
                Select multiple specific dates
              </p>
            </button>

            <button
              className="group p-6 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-[#0c213e] hover:bg-[#0c213e]/5 transition-all duration-300"
              onClick={() => handleSelectionType("month")}
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-purple-600 transition-colors">
                <svg
                  className="w-7 h-7 text-purple-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Full Month</h3>
              <p className="text-sm text-gray-600 text-center">
                Set availability for an entire month
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - Date Selection */}
      <div ref={step2Ref}>
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectionType("");
                  setEditingSlotId(null);
                }}
                className="flex items-center text-gray-600 hover:text-[#0c213e] transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                <span className="text-sm font-medium text-gray-700">
                  {selectionType === "single" && "Single Day"}
                  {selectionType === "multiple" && "Multiple Days"}
                  {selectionType === "month" && "Full Month"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0c213e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select Dates
                </h3>
                <div className="flex justify-center">
                  {selectionType === "single" && (
                    <DayPicker
                      mode="single"
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      selected={selectedSingleDate}
                      onSelect={setSelectedSingleDate}
                      modifiersClassNames={{
                        selected: "bg-[#0c213e] text-white rounded-lg font-semibold",
                        today: "border-2 border-[#0c213e] bg-blue-50 rounded-lg",
                      }}
                      showOutsideDays
                      disabled={[{ before: new Date() }, ...disabledDatesForCalendar]}
                      className="border-0"
                    />
                  )}
                  {selectionType === "multiple" && (
                    <DayPicker
                      mode="multiple"
                      selected={selectedMultipleDates}
                      onSelect={(dates) => setSelectedMultipleDates(dates || [])}
                      modifiersClassNames={{
                        selected: "bg-emerald-600 text-white rounded-lg font-semibold",
                        today: "border-2 border-emerald-600 bg-emerald-50 rounded-lg",
                      }}
                      showOutsideDays
                      disabled={[{ before: new Date() }, ...disabledDatesForCalendar]}
                      className="border-0"
                    />
                  )}
                  {selectionType === "month" && (
                    <DayPicker
                      mode="multiple"
                      selected={selectedMultipleDates}
                      onSelect={handleMonthSelect}
                      captionLayout="dropdown"
                      disabled={[{ before: new Date() }, ...disabledDatesForCalendar]}
                      modifiersClassNames={{
                        selected: "bg-purple-600 text-white rounded-lg font-semibold",
                        today: "border-2 border-purple-600 bg-purple-50 rounded-lg",
                      }}
                      className="border-0"
                    />
                  )}
                </div>
              </div>

              {/* Working Hours & Preview Section */}
              <div className="space-y-6">
                {/* Working Hours */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0c213e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Working Hours
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c213e] focus:border-[#0c213e] transition-colors"
                        value={workingHours.start}
                        onChange={(e) =>
                          setWorkingHours({ ...workingHours, start: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c213e] focus:border-[#0c213e] transition-colors"
                        value={workingHours.end}
                        onChange={(e) =>
                          setWorkingHours({ ...workingHours, end: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Selected Dates Preview */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Selected Dates</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectionType === "single" && selectedSingleDate ? (
                      <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                        {selectedSingleDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    ) : selectionType !== "single" && selectedMultipleDates.length > 0 ? (
                      <>
                        {selectedMultipleDates.slice(0, 5).map((date, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200"
                          >
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        ))}
                        {selectedMultipleDates.length > 5 && (
                          <div className="text-sm text-gray-500 text-center py-2">
                            +{selectedMultipleDates.length - 5} more dates
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-400 text-center py-4">
                        No dates selected yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  className="w-full bg-[#0c213e] hover:bg-[#0a1a32] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-[#0c213e]/20"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Availability
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Slots */}
      {savedSlots.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Availability Schedule
            </h2>
            <span className="bg-[#0c213e] text-white text-sm font-medium px-4 py-2 rounded-full">
              {savedSlots.length} date{savedSlots.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSlots.map((slotItem) => (
              <div
                key={slotItem._id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0c213e] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {new Date(slotItem.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(slotItem.date).getFullYear()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditSlots(slotItem)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      slotItem.slots.filter((s) => s.isActive).length > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {slotItem.slots.filter((s) => s.isActive).length} / {slotItem.slots.length} active
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {slotItem.slots.map((s) => (
                    <button
                      key={s.time}
                      className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        s.isActive
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                      onClick={() => toggleSlot(slotItem._id, s.time, !s.isActive)}
                    >
                      {formatTime(s.time)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;