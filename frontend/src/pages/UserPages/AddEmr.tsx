import React, { useState, useEffect, useContext } from "react";
import { FileText, Pill, Stethoscope, AlertCircle, Calendar, User, Plus, Eye, Clock, Activity } from "lucide-react";
import { createEMR } from "../../Services/emrApi";
import { AuthContext } from "../../Context/AuthContext";
import api from "../../Services/mainApi";
import toast from "react-hot-toast";

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
    date: ""
  });

  const [emrRecords, setEmrRecords] = useState<EMRRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"add" | "view">("view");

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
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, reports: Array.from(e.target.files!) }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (
      !formData.allergies.trim() ||
      !formData.diseases.trim() ||
      !formData.pastSurgeries.trim() ||
      !formData.currentMedications.trim()
    ) {
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

    fd.append("allergies", JSON.stringify(formData.allergies.split(",").map(s=>s.trim())));
    fd.append("diseases", JSON.stringify(formData.diseases.split(",").map(s=>s.trim())));
    fd.append("pastSurgeries", JSON.stringify(formData.pastSurgeries.split(",").map(s=>s.trim())));
    fd.append("currentMedications", JSON.stringify(formData.currentMedications.split(",").map(s=>s.trim())));
    
    formData.reports.forEach(file => fd.append("reports", file));

    try {
      await createEMR(fd);
      toast.success("EMR added successfully!");

      setFormData({ allergies:"", diseases:"", pastSurgeries:"", currentMedications:"", reports:[], date:"" });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchEMRRecords();
    } catch (err) {
      toast.error("Failed to add EMR");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#0c213e] rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0c213e]">Electronic Medical Records</h1>
              <p className="text-gray-600 text-sm">Manage and view your health information securely</p>
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0c213e] to-[#16345b] rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Patient ID</p>
                <p className="text-lg font-semibold text-[#0c213e]">{aadhar}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Total Records</p>
              <p className="text-2xl font-bold text-[#0c213e]">{emrRecords.length}</p>
            </div>
          </div>
        </div> */}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setActiveTab("view")}
              className={`py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200
                ${activeTab === "view" 
                  ? "bg-[#0c213e] text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-50"}`}
            >
              <Eye className="w-5 h-5" />
              <span>View Records</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                ${activeTab === "view" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                {emrRecords.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("add")}
              className={`py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200
                ${activeTab === "add" 
                  ? "bg-[#0c213e] text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-50"}`}
            >
              <Plus className="w-5 h-5" />
              <span>Add New Record</span>
            </button>
          </div>
        </div>

        {/* ADD FORM */}
        {activeTab === "add" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0c213e] to-[#16345b] p-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Add New Medical Record</h2>
              </div>
              <p className="text-blue-100 text-sm mt-1">Enter patient health information below</p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">

                {/* Allergies */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-700">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Allergies
                    <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0c213e] focus:border-transparent transition-all outline-none"
                    placeholder="e.g., Dust, Pollen, Penicillin"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Separate multiple items with commas</p>
                </div>

                {/* Diseases */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-700">
                    <Stethoscope className="w-4 h-4 text-blue-500" />
                    Diseases
                    <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0c213e] focus:border-transparent transition-all outline-none"
                    placeholder="e.g., Diabetes Type 2, Hypertension"
                    value={formData.diseases}
                    onChange={(e) => handleInputChange("diseases", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Separate multiple items with commas</p>
                </div>

                {/* Past Surgeries */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-700">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Past Surgeries
                    <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0c213e] focus:border-transparent transition-all outline-none"
                    placeholder="e.g., Knee Replacement, Appendectomy"
                    value={formData.pastSurgeries}
                    onChange={(e) => handleInputChange("pastSurgeries", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Separate multiple items with commas</p>
                </div>

                {/* Current Medications */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-700">
                    <Pill className="w-4 h-4 text-green-500" />
                    Current Medications
                    <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0c213e] focus:border-transparent transition-all outline-none"
                    placeholder="e.g., Metformin 500mg, Aspirin 75mg"
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Separate multiple items with commas</p>
                </div>

                {/* Record Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-700">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Record Date
                    <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0c213e] focus:border-transparent transition-all outline-none"
                    value={formData.date} 
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>

                {/* Upload Reports */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Upload Reports
                    <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                  </label>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0c213e] file:text-white file:font-semibold file:cursor-pointer hover:file:bg-[#16345b] transition-all"
                  />
                  {formData.reports.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">{formData.reports.length} file{formData.reports.length > 1 ? 's' : ''} selected</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center gap-3 shadow-lg
                    ${loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-[#0c213e] to-[#16345b] text-white hover:shadow-xl hover:scale-105"}`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding Record...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add Medical Record</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW EMR */}
        {activeTab === "view" && (
          <div className="space-y-5">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-12 h-12 border-4 border-[#0c213e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading medical records...</p>
              </div>
            ) : emrRecords.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Medical Records Found</h3>
                <p className="text-gray-500 mb-6">Start by adding your first medical record</p>
                <button 
                  onClick={() => setActiveTab("add")}
                  className="px-6 py-3 bg-[#0c213e] text-white rounded-xl font-semibold hover:bg-[#16345b] transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add First Record
                </button>
              </div>
            ) : (
              emrRecords.map(r => (
                <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  
                  {/* Record Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0c213e] rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Patient Aadhar</p>
                          <p className="text-lg font-bold text-[#0c213e]">{r.aadhar}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatDate(r.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Record Content */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Section title="Allergies" items={r.allergies} icon={<AlertCircle className="w-4 h-4 text-red-500" />} color="red" />
                      <Section title="Diseases" items={r.diseases} icon={<Stethoscope className="w-4 h-4 text-blue-500" />} color="blue" />
                      <Section title="Past Surgeries" items={r.pastSurgeries} icon={<Activity className="w-4 h-4 text-purple-500" />} color="purple" />
                      <Section title="Current Medications" items={r.currentMedications} icon={<Pill className="w-4 h-4 text-green-500" />} color="green" />
                    </div>

                    {/* Reports Section */}
                    {r.reports.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-indigo-500" />
                          <p className="font-semibold text-gray-700">Attached Reports</p>
                          <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                            {r.reports.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {r.reports.map((f, i) => (
                            <a 
                              key={i} 
                              href={f} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#0c213e] hover:text-white hover:border-[#0c213e] transition-all flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              Report {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// Reusable section component with enhanced styling
const Section = ({ title, items, icon, color }: { title: string; items: string[]; icon: React.ReactNode; color: string }) => {
  const colorClasses = {
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-green-50 text-green-700 border-green-200"
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="font-semibold text-gray-700">{title}</p>
      </div>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((t, i) => (
            <span 
              key={i} 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${colorClasses[color]}`}
            >
              {t}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic text-sm bg-gray-50 px-3 py-2 rounded-lg">No records available</p>
      )}
    </div>
  );
};

export default AddEmr;