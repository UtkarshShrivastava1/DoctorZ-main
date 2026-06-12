import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Services/mainApi";
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  User,
  Calendar,
  Users,
  Edit3,
  Check,
  X,
  ShieldCheck,
  PhoneCall,
  AlertCircle,
  Map,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  city?: string;
  pincode?: number;
}

interface EmergencyContact {
  name?: string;
  number?: number;
}

export interface User {
  fullName: string;
  gender: string;
  dob: string;
  email: string;
  mobileNumber: number;
  aadhar: number;
  address: Address;
  abhaId?: string;
  emergencyContact: EmergencyContact;
  profilePhoto: string;
}

interface UserResponse {
  message: string;
  user: User;
}

// ─── Field Groups ─────────────────────────────────────────────────────────────

const personalFields = [
  { key: "fullName", label: "Full Name", icon: User },
  { key: "gender",   label: "Gender",    icon: Users },
  { key: "dob",      label: "Date of Birth", icon: Calendar },
];

const contactFields = [
  { key: "email",        label: "Email Address",  icon: Mail },
  { key: "mobileNumber", label: "Mobile Number",  icon: Phone,   numeric: true, maxLen: 10 },
  { key: "address.city", label: "City",           icon: MapPin },
  { key: "address.pincode", label: "Pincode",     icon: Map,     numeric: true, maxLen: 6  },
];

const emergencyFields = [
  { key: "aadhar",                  label: "Aadhar Number",          icon: CreditCard, numeric: true, maxLen: 12 },
  { key: "abhaId",                  label: "ABHA ID",                icon: CreditCard },
  { key: "emergencyContact.name",   label: "Emergency Contact Name", icon: User },
  { key: "emergencyContact.number", label: "Emergency Contact No.",  icon: PhoneCall, numeric: true, maxLen: 10 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getValue = (obj: any, path: string): string | number => {
  return (
    path.split(".").reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""),
      obj
    ) || ""
  );
};

const getInitials = (name: string): string =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDob = (dob: string): string => {
  try {
    return new Date(dob).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dob;
  }
};

const maskAadhar = (val: string | number): string => {
  const s = String(val);
  if (!s || s.length < 4) return s || "—";
  return "xxxx xxxx " + s.slice(-4);
};

const formatMobile = (val: string | number): string =>
  val ? "+91 " + String(val).replace(/(\d{5})(\d{5})/, "$1 $2") : "—";

const displayValue = (key: string, val: string | number): string => {
  if (!val && val !== 0) return "—";
  if (key === "dob") return formatDob(String(val));
  if (key === "aadhar") return maskAadhar(val);
  if (key === "mobileNumber" || key === "emergencyContact.number")
    return formatMobile(val);
  return String(val);
};

const restrictNumber = (value: string, maxLen: number): string =>
  value.replace(/\D/g, "").slice(0, maxLen);

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50/70">
      <span className="text-[#0c213e] opacity-70">{icon}</span>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
      {children}
    </div>
  </div>
);

interface FieldCellProps {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isEditing: boolean;
  fieldKey: string;
  value: string | number;
  error?: string;
  numeric?: boolean;
  maxLen?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FieldCell: React.FC<FieldCellProps> = ({
  label,
  icon: Icon,
  isEditing,
  fieldKey,
  value,
  error,
  numeric,
  maxLen,
  onChange,
}) => {
  const isGender = fieldKey === "gender";
  const isDob = fieldKey === "dob";

  const dobValue = isDob && value
    ? (() => { try { return new Date(String(value)).toISOString().split("T")[0]; } catch { return ""; } })()
    : "";

  return (
    <div className="p-5 hover:bg-gray-50/60 transition-colors duration-150 group">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={13} className="text-gray-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </span>
      </div>

      {isEditing ? (
        <div>
          {isGender ? (
            <select
              name={fieldKey}
              value={String(value)}
              onChange={onChange}
              className="w-full bg-[#0c213e]/5 border border-[#0c213e]/15 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#0c213e]/40 focus:ring-2 focus:ring-[#0c213e]/10 transition"
            >
              <option value="">Select gender</option>
              {["Male", "Female", "Other", "Prefer not to say"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              type={isDob ? "date" : "text"}
              name={fieldKey}
              value={isDob ? dobValue : (value ?? "")}
              inputMode={numeric ? "numeric" : undefined}
              maxLength={maxLen}
              onChange={onChange}
              className="w-full bg-[#0c213e]/5 border border-[#0c213e]/15 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#0c213e]/40 focus:ring-2 focus:ring-[#0c213e]/10 transition"
            />
          )}
          {error && (
            <p className="flex items-center gap-1 text-red-500 text-[11px] mt-1.5">
              <AlertCircle size={11} />
              {error}
            </p>
          )}
        </div>
      ) : (
        <p className={`text-sm font-medium ${value ? "text-gray-800" : "text-gray-300 italic"}`}>
          {value ? displayValue(fieldKey, value) : "Not provided"}
        </p>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { id } = useParams();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<UserResponse>(`/api/patient/${id}`);
        const fetchedUser = res.data.user;

        if (typeof fetchedUser.address === "string") {
          try { fetchedUser.address = JSON.parse(fetchedUser.address); }
          catch { fetchedUser.address = { city: "", pincode: 0 }; }
        }
        if (typeof fetchedUser.emergencyContact === "string") {
          try { fetchedUser.emergencyContact = JSON.parse(fetchedUser.emergencyContact); }
          catch { fetchedUser.emergencyContact = { name: "", number: 0 }; }
        }

        setUser(fetchedUser);
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, id]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editData) return;
    const { name, value } = e.currentTarget;
    if (!name) return;

    const allFields = [...personalFields, ...contactFields, ...emergencyFields];
    const fieldDef = allFields.find((f) => f.key === name);
    let v: string | number = value;

    if (fieldDef && (fieldDef as any).numeric) {
      v = restrictNumber(value, (fieldDef as any).maxLen || 20);
      (e.currentTarget as HTMLInputElement).value = String(v);
    }

    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof Address;
      setEditData({
        ...editData,
        address: {
          ...editData.address,
          [key]: (fieldDef as any)?.numeric ? Number(v) : v,
        },
      });
    } else if (name.startsWith("emergencyContact.")) {
      const key = name.split(".")[1] as keyof EmergencyContact;
      setEditData({
        ...editData,
        emergencyContact: {
          ...editData.emergencyContact,
          [key]: (fieldDef as any)?.numeric ? Number(v) : v,
        },
      });
    } else {
      setEditData({
        ...editData,
        [name]: (fieldDef as any)?.numeric ? Number(v) : v,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editData) return false;
    if (!editData.fullName || editData.fullName.trim().length < 3)
      newErrors.fullName = "At least 3 characters required.";
    if (!editData.gender)
      newErrors.gender = "Please select a gender.";
    if (!editData.dob)
      newErrors.dob = "Date of birth is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email))
      newErrors.email = "Enter a valid email address.";
    if (!/^[0-9]{10}$/.test(String(editData.mobileNumber)))
      newErrors.mobileNumber = "Must be exactly 10 digits.";
    if (!/^[0-9]{12}$/.test(String(editData.aadhar)))
      newErrors.aadhar = "Must be exactly 12 digits.";
    if (!editData.address?.city || editData.address.city.trim().length < 2)
      newErrors["address.city"] = "Enter a valid city name.";
    if (!/^[0-9]{6}$/.test(String(editData.address?.pincode)))
      newErrors["address.pincode"] = "Must be exactly 6 digits.";
    if (!editData.emergencyContact?.name || editData.emergencyContact.name.trim().length < 3)
      newErrors["emergencyContact.name"] = "At least 3 characters required.";
    if (!/^[0-9]{10}$/.test(String(editData.emergencyContact?.number)))
      newErrors["emergencyContact.number"] = "Must be exactly 10 digits.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    try {
      const formData = new FormData();
      if (selectedFile) formData.append("profilePhoto", selectedFile);
      if (editData) {
        Object.entries(editData).forEach(([key, value]) => {
          if (typeof value !== "object") formData.append(key, String(value));
        });
        formData.append("address", JSON.stringify(editData.address));
        formData.append("emergencyContact", JSON.stringify(editData.emergencyContact));
      }

      const res = await api.put<UserResponse>(`/api/patient/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.user;
      if (typeof updatedUser.address === "string")
        updatedUser.address = JSON.parse(updatedUser.address);
      if (typeof updatedUser.emergencyContact === "string")
        updatedUser.emergencyContact = JSON.parse(updatedUser.emergencyContact);

      toast.success("Profile updated successfully.");
      setUser(updatedUser);
      setIsEditing(false);
      setErrors({});
      setSelectedFile(null);
      setPhotoPreview(null);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const startEdit = () => {
    setEditData(user);
    setIsEditing(true);
    setErrors({});
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setSelectedFile(null);
    setPhotoPreview(null);
  };

  // ── Render helpers ───────────────────────────────────────────────────────────

  const renderFields = (
    fields: typeof personalFields,
    source: User
  ) =>
    fields.map(({ key, label, icon, ...rest }) => (
      <FieldCell
        key={key}
        fieldKey={key}
        label={label}
        icon={icon}
        isEditing={isEditing}
        value={getValue(isEditing ? editData! : source, key)}
        error={errors[key]}
        onChange={handleChange}
        {...rest}
      />
    ));

  // ── Loading / error states ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0c213e]/20 border-t-[#0c213e] rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">User not found.</p>
        </div>
      </div>
    );
  }

  const avatarSrc = photoPreview || user.profilePhoto;

  // ── Main Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#0c213e]/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#0c213e] flex items-center justify-center border-4 border-[#0c213e]/10">
                <span className="text-2xl font-semibold text-[#a8c4e0] tracking-wide">
                  {getInitials(user.fullName)}
                </span>
              </div>
            )}
            {/* Online badge */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />

            {/* Photo upload in edit mode */}
            {isEditing && (
              <label className="absolute inset-0 rounded-full cursor-pointer flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-medium text-center leading-tight px-1">
                  Change<br />Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#0c213e] leading-tight truncate">
              {user.fullName}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
                <ShieldCheck size={11} /> Verified
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0c213e]/8 text-[#0c213e] text-[11px] font-semibold">
                <User size={11} /> Patient
              </span>
              {user.abhaId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                  <CreditCard size={11} /> ABHA Linked
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0">
            {!isEditing ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-2 bg-[#0c213e] hover:bg-[#132d54] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors duration-150"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#0c213e] hover:bg-[#132d54] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150"
                >
                  <Check size={15} />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150"
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Personal Information ──────────────────────────────────────────── */}
        <SectionCard title="Personal Information" icon={<User size={14} />}>
          {renderFields(personalFields, user)}
        </SectionCard>

        {/* ── Contact & Location ───────────────────────────────────────────── */}
        <SectionCard title="Contact & Location" icon={<MapPin size={14} />}>
          {renderFields(contactFields, user)}
        </SectionCard>

        {/* ── Emergency Contact & IDs ──────────────────────────────────────── */}
        <SectionCard title="Emergency Contact & IDs" icon={<PhoneCall size={14} />}>
          {renderFields(emergencyFields, user)}
        </SectionCard>

      </div>
    </div>
  );
}

export default UserProfile;