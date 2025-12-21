import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import api from "../../Services/mainApi";
import { Helmet } from "react-helmet";
// import { FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const PRIMARY = "#0C213E";

interface Clinic {
  _id: string;
  clinicName: string;
  clinicType: "Private" | "Government";
  operatingHours: string;
  specialities: string[];
  phone: string;
  email: string;
  address: string;
  state: string;
  district: string;
  pincode: number;
  clinicLicenseNumber: string;
  registrationCertificate?: string;
  aadharNumber: number;
  panNumber: string;
  staffName: string;
  staffEmail: string;
  staffId: string;
  staffPassword?: string;
  doctors: string[];

  // ✅ NEW FIELDS
  about?: string;
  mission?: string;
  vision?: string;
}

interface OutletContext {
  clinicId: string;
}

export default function ClinicProfile() {
  const { clinicId } = useOutletContext<OutletContext>();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState<Partial<Clinic>>({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClinicData = async () => {
    if (!clinicId) return;
    try {
      const res = await api.get<{ clinic: Clinic }>(
        `/api/clinic/getClinicById/${clinicId}`
      );
      setClinic(res.data.clinic);
      setFormData(res.data.clinic);
    } catch {
      toast.error("Failed to load clinic profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicData();
  }, [clinicId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "staffPassword") {
      setPasswordInput(value);
      return;
    }

    const updatedValue =
      name === "specialities"
        ? value.split(",").map((s) => s.trim())
        : value;

    setFormData({ ...formData, [name]: updatedValue });
  };

  const handleUpdate = async () => {
    if (!formData?._id) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        ...(passwordInput ? { staffPassword: passwordInput } : {}),
      };

      await api.put(`/api/clinic/update/${formData._id}`, payload);
      toast.success("Clinic profile updated successfully");
      setEditMode(false);
      setPasswordInput("");
      fetchClinicData();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!clinic) return;
    try {
      await api.delete(`/api/clinic/delete/${clinic._id}`);
      toast.success("Clinic deleted successfully");
      localStorage.removeItem("clinicId");
      navigate("/");
    } catch {
      toast.error("Failed to delete clinic");
    }
  };

  if (loading) return <p className="text-center p-8">Loading...</p>;

  const labelClass = "text-sm font-semibold text-gray-700";
  const inputClass =
    "w-full rounded-xl border border-gray-300 p-3 focus:border-[#0C213E] focus:ring-2 focus:ring-blue-200 transition";

  return (
    <>
      <Toaster position="top-right" />
      <Helmet>
        <title>{clinic?.clinicName} | Clinic Profile</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-10">
        <div className="mx-auto max-w-20xl">
          {/* HEADER */}
          <div className="rounded-2xl p-5 shadow-lg" style={{ backgroundColor: PRIMARY }}>
            <div className="flex justify-between items-center text-white">
              <div>
                <h3 className="text-2xl font-bold">{clinic?.clinicName}</h3>
                <p className="text-gray-300">{clinic?.clinicType} Clinic</p>
                <p className="text-gray-300 text-sm">{clinic?.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="bg-yellow-400 px-4 py-2 rounded-lg text-black"
                >
                  {editMode ? "Cancel" : "Edit"}
                </button>

                <button
                  onClick={() => setShowConfirm(true)}
                  className="bg-red-600 px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-8">
              {/* CLINIC DETAILS */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY }}>
                  Clinic Details
                </h3>

                {[
                  ["clinicName", "Clinic Name"],
                  ["clinicType", "Clinic Type"],
                  ["operatingHours", "Operating Hours"],
                  ["specialities", "Specialities"],
                ].map(([field, label]) => (
                  <div key={field} className="mb-4">
                    <label className={labelClass}>{label}</label>
                    {editMode ? (
                      <input
                        name={field}
                        value={
                          field === "specialities"
                            ? (formData.specialities || []).join(", ")
                            : (formData as any)[field] || ""
                        }
                        onChange={handleChange}
                        className={inputClass}
                      />
                    ) : (
                      <p className="p-2 text-gray-700">
                        {field === "specialities"
                          ? (formData.specialities || []).join(", ")
                          : (formData as any)[field] || "-"}
                      </p>
                    )}
                  </div>
                ))}

                {editMode && (
                  <button
                    onClick={handleUpdate}
                    className="mt-4 w-full text-white py-3 rounded-xl"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    Save Clinic Changes
                  </button>
                )}
              </div>

              {/* CLINIC OVERVIEW */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY }}>
                  Clinic Overview
                </h3>

                {["about", "mission", "vision"].map((field) => (
                  <div key={field} className="mb-4">
                    <label className={labelClass}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    {editMode ? (
                      <textarea
                        name={field}
                        rows={3}
                        value={(formData as any)[field] || ""}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    ) : (
                      <p className="p-2 text-gray-700 whitespace-pre-line">
                        {(formData as any)[field] || "-"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY }}>
                  Staff Credentials
                </h3>

                <label className={labelClass}>Staff Name</label>
                {editMode ? (
                  <input
                    name="staffName"
                    value={formData.staffName || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                ) : (
                  <p className="text-gray-700">{formData.staffName}</p>
                )}

                <label className={`${labelClass} mt-4 block`}>
                  New Password
                </label>
                {editMode ? (
                  <input
                    type="password"
                    name="staffPassword"
                    value={passwordInput}
                    onChange={handleChange}
                    className={inputClass}
                  />
                ) : (
                  <p>••••••••</p>
                )}

                {editMode && (
                  <button
                    onClick={handleUpdate}
                    className="mt-4 w-full text-white py-3 rounded-xl"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    Save Staff Changes
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DELETE CONFIRM */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <p className="font-semibold mb-4">
                  Delete this clinic permanently?
                </p>
                <div className="flex justify-between gap-4">
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
