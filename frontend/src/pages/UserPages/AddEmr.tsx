import React, { useState, useEffect, useContext } from "react";
import {
  FileText,
  Pill,
  Stethoscope,
  AlertCircle,
  Calendar,
  Plus,
  Eye,
  Clock,
  Activity,
  Upload,
  ChevronRight,
  X,
} from "lucide-react";
import { createEMR } from "../../Services/emrApi";
import { AuthContext } from "../../Context/AuthContext";
import api from "../../Services/mainApi";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type EMRInputs = {
  allergies: string;
  diseases: string;
  pastSurgeries: string;
  currentMedications: string;
  reports: File[];
  date?: string;
};

type EMRRecord = {
  _id: string;
  aadhar: string;
  allergies: string[];
  diseases: string[];
  pastSurgeries: string[];
  currentMedications: string[];
  reports: string[];
  createdAt: string;
  updatedAt: string;
};

// ─── Field config ──────────────────────────────────────────────────────────────

const FORM_FIELDS: {
  key: keyof Omit<EMRInputs, "reports" | "date">;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  accentColor: string;
}[] = [
  {
    key: "allergies",
    label: "Allergies",
    placeholder: "e.g., Dust, Pollen, Penicillin",
    icon: <AlertCircle size={15} className="text-red-400" />,
    required: true,
    accentColor: "text-red-400",
  },
  {
    key: "diseases",
    label: "Diseases",
    placeholder: "e.g., Diabetes Type 2, Hypertension",
    icon: <Stethoscope size={15} className="text-blue-400" />,
    accentColor: "text-blue-400",
  },
  {
    key: "pastSurgeries",
    label: "Past Surgeries",
    placeholder: "e.g., Knee Replacement, Appendectomy",
    icon: <Activity size={15} className="text-purple-400" />,
    accentColor: "text-purple-400",
  },
  {
    key: "currentMedications",
    label: "Current Medications",
    placeholder: "e.g., Metformin 500mg, Aspirin 75mg",
    icon: <Pill size={15} className="text-green-400" />,
    required: true,
    accentColor: "text-green-400",
  },
];

// ─── Badge colors for view mode ────────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
  allergies: "bg-red-50 text-red-700 border border-red-100",
  diseases: "bg-blue-50 text-blue-700 border border-blue-100",
  pastSurgeries: "bg-purple-50 text-purple-700 border border-purple-100",
  currentMedications: "bg-green-50 text-green-700 border border-green-100",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Sub-components ────────────────────────────────────────────────────────────

interface TagListProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  badgeClass: string;
}

const TagList: React.FC<TagListProps> = ({ title, items, icon, badgeClass }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-3">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </span>
    </div>
    {items.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${badgeClass}`}>
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-xs text-gray-300 italic">None recorded</p>
    )}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const AddEmr: React.FC = () => {
  const { user } = useContext(AuthContext);
  const aadhar = Number(user?.aadhar);
  const patientId = user?.id || "patient123";

  const [formData, setFormData] = useState<EMRInputs>({
    allergies: "",
    diseases: "",
    pastSurgeries: "",
    currentMedications: "",
    reports: [],
    date: "",
  });

  const [emrRecords, setEmrRecords] = useState<EMRRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"add" | "view">("view");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  useEffect(() => {
    if (aadhar) fetchEMRRecords();
  }, [aadhar]);

  const fetchEMRRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ emr: EMRRecord[] }>(`/api/emr/${aadhar}`);
      setEmrRecords(response.data?.emr || []);
    } catch (error) {
      console.error("Error loading EMR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof EMRInputs, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, reports: Array.from(e.target.files!) }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reports: prev.reports.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!formData.allergies.trim() || !formData.currentMedications.trim()) {
      toast.error("Please fill all required fields before submitting.");
      return;
    }

    if (!patientId) {
      toast.error("Session expired, please login.");
      return;
    }

    setLoading(true);

    const fd = new FormData();
    fd.append("patientId", patientId);
    fd.append("aadhar", aadhar.toString());
    fd.append("date", formData.date || "");
    fd.append("allergies", JSON.stringify(formData.allergies.split(",").map((s) => s.trim())));
    fd.append("diseases", JSON.stringify(formData.diseases.split(",").map((s) => s.trim())));
    fd.append("pastSurgeries", JSON.stringify(formData.pastSurgeries.split(",").map((s) => s.trim())));
    fd.append("currentMedications", JSON.stringify(formData.currentMedications.split(",").map((s) => s.trim())));
    formData.reports.forEach((file) => fd.append("reports", file));

    try {
      await createEMR(fd);
      toast.success("EMR added successfully!");
      setFormData({ allergies: "", diseases: "", pastSurgeries: "", currentMedications: "", reports: [], date: "" });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      await fetchEMRRecords();
      setActiveTab("view");
    } catch (err) {
      toast.error("Failed to add EMR");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-[#0c213e] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Activity size={26} className="text-[#a8c4e0]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#0c213e] leading-tight">
                Electronic Medical Records
              </h1>
              <p className="text-md text-gray-400 mt-0.5">
                Manage and view your health information securely
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0c213e]/8 text-[#0c213e] text-[12px] font-semibold">
                  <FileText size={10} /> {emrRecords.length} Record{emrRecords.length !== 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[12px] font-semibold">
                  Aadhar: {aadhar}
                </span>
              </div>
            </div>
          </div>

          {/* Tab switcher inside header */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab("view")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeTab === "view"
                  ? "bg-[#0c213e] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Eye size={15} />
              View
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "view" ? "bg-white/20 text-white" : "bg-white text-gray-500"
              }`}>
                {emrRecords.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeTab === "add"
                  ? "bg-[#0c213e] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Plus size={15} />
              Add New
            </button>
          </div>
        </div>

        {/* ── ADD FORM ─────────────────────────────────────────────────────── */}
        {activeTab === "add" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Form header strip */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <FileText size={14} className="text-[#0c213e] opacity-70" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                New Medical Record
              </h3>
            </div>

            <div className="p-6">
              {/* Medical info fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {FORM_FIELDS.map(({ key, label, placeholder, icon, required, accentColor }) => (
                  <div key={key}>
                    <label className="flex items-center gap-1.5 mb-1.5">
                      {icon}
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {label}
                      </span>
                      {required && <span className="text-red-400 text-[10px] font-bold ml-0.5">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-[#0c213e]/5 border border-[#0c213e]/15 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none placeholder-gray-300 focus:border-[#0c213e]/40 focus:ring-2 focus:ring-[#0c213e]/10 transition"
                    />
                    <p className="text-[10px] text-gray-300 mt-1 ml-0.5">Separate multiple entries with commas</p>
                  </div>
                ))}

                {/* Date picker */}
                <div>
                  <label className="flex items-center gap-1.5 mb-1.5">
                    <Calendar size={15} className="text-orange-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Record Date
                    </span>
                    <span className="text-gray-300 text-[10px] ml-1">optional</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full bg-[#0c213e]/5 border border-[#0c213e]/15 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0c213e]/40 focus:ring-2 focus:ring-[#0c213e]/10 transition"
                  />
                </div>

                {/* File upload */}
                <div>
                  <label className="flex items-center gap-1.5 mb-1.5">
                    <Upload size={15} className="text-indigo-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Upload Reports
                    </span>
                    <span className="text-gray-300 text-[10px] ml-1">optional</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full border border-dashed border-[#0c213e]/20 bg-[#0c213e]/3 rounded-xl px-4 py-5 cursor-pointer hover:border-[#0c213e]/40 hover:bg-[#0c213e]/6 transition group">
                    <Upload size={20} className="text-[#0c213e]/30 group-hover:text-[#0c213e]/50 mb-1.5 transition" />
                    <span className="text-xs text-gray-400 group-hover:text-gray-500 transition">
                      Click to browse files
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formData.reports.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {formData.reports.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={12} className="text-green-500 flex-shrink-0" />
                            <span className="text-xs text-green-700 font-medium truncate">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(i)}
                            className="text-green-400 hover:text-red-400 transition ml-2 flex-shrink-0"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setActiveTab("view")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    loading
                      ? "bg-gray-300 cursor-not-allowed text-white"
                      : "bg-[#0c213e] hover:bg-[#132d54] text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      Add Record
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW RECORDS ─────────────────────────────────────────────────── */}
        {activeTab === "view" && (
          <div className="space-y-3">

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-10 h-10 border-4 border-[#0c213e]/20 border-t-[#0c213e] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">Loading medical records…</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && emrRecords.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={26} className="text-gray-200" />
                </div>
                <h3 className="text-base font-semibold text-gray-600 mb-1">No records yet</h3>
                <p className="text-sm text-gray-400 mb-5">Start by adding your first medical record</p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c213e] hover:bg-[#132d54] text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Plus size={15} />
                  Add First Record
                </button>
              </div>
            )}

            {/* Records */}
            {!loading &&
              emrRecords.map((r) => {
                const isExpanded = expandedRecord === r._id;
                return (
                  <div
                    key={r._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Record header — always visible, clickable to expand */}
                    <button
                      onClick={() => setExpandedRecord(isExpanded ? null : r._id)}
                      className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0c213e] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-[#a8c4e0]" />
                        </div>
                        <div>
                          <p className="text-md font-semibold text-[#0c213e]">
                            EMR — {r.aadhar}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} className="text-gray-300" />
                            <span className="text-[12px] text-gray-400">{formatDate(r.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pill summary + chevron */}
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex gap-1.5">
                          {r.allergies.length > 0 && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-semibold rounded-full border border-red-100">
                              {r.allergies.length} allerg.
                            </span>
                          )}
                          {r.currentMedications.length > 0 && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-semibold rounded-full border border-green-100">
                              {r.currentMedications.length} med.
                            </span>
                          )}
                          {r.reports.length > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-semibold rounded-full border border-indigo-100">
                              {r.reports.length} report{r.reports.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          size={16}
                          className={`text-gray-300 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                          <TagList
                            title="Allergies"
                            items={r.allergies}
                            icon={<AlertCircle size={13} className="text-red-400" />}
                            badgeClass={BADGE_STYLES.allergies}
                          />
                          <TagList
                            title="Diseases"
                            items={r.diseases}
                            icon={<Stethoscope size={13} className="text-blue-400" />}
                            badgeClass={BADGE_STYLES.diseases}
                          />
                          <TagList
                            title="Past Surgeries"
                            items={r.pastSurgeries}
                            icon={<Activity size={13} className="text-purple-400" />}
                            badgeClass={BADGE_STYLES.pastSurgeries}
                          />
                          <TagList
                            title="Current Medications"
                            items={r.currentMedications}
                            icon={<Pill size={13} className="text-green-400" />}
                            badgeClass={BADGE_STYLES.currentMedications}
                          />
                        </div>

                        {/* Reports */}
                        {r.reports.length > 0 && (
                          <div className="mt-5 pt-5 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 mb-3">
                              <FileText size={13} className="text-indigo-400" />
                              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Attached Reports
                              </span>
                              <span className="ml-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100">
                                {r.reports.length}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {r.reports.map((f, i) => (
                                <a
                                  key={i}
                                  href={f}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#0c213e] hover:text-white hover:border-[#0c213e] transition-all duration-150"
                                >
                                  <FileText size={12} />
                                  Report {i + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEmr;