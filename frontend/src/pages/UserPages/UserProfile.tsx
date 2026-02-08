import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Services/mainApi";
import { Mail, Phone, MapPin, CreditCard, User, Calendar, Users } from "lucide-react";
import toast from "react-hot-toast";

// Strong Types
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

const fields: {
  key:
    | keyof User
    | "address.city"
    | "address.pincode"
    | "emergencyContact.name"
    | "emergencyContact.number";
  label: string;
  icon?: any;
}[] = [
  { key: "fullName", label: "Full Name", icon: User },
  { key: "gender", label: "Gender", icon: Users },
  { key: "dob", label: "Date of Birth", icon: Calendar },
  { key: "email", label: "Email", icon: Mail },
  { key: "mobileNumber", label: "Mobile Number", icon: Phone },
  { key: "aadhar", label: "Aadhar Number", icon: CreditCard },
  { key: "address.city", label: "City", icon: MapPin },
  { key: "address.pincode", label: "Pincode", icon: MapPin },
  { key: "abhaId", label: "ABHA ID", icon: CreditCard },
  { key: "emergencyContact.name", label: "Emergency Contact Name", icon: User },
  { key: "emergencyContact.number", label: "Emergency Contact Number", icon: Phone },
];

// Value extractor
const getValue = (obj: any, path: string): string | number => {
  return (
    path
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), obj) || ""
  );
};

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { id } = useParams();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<UserResponse>(`/api/patient/${id}`);
        const fetchedUser = res.data.user;

        if (typeof fetchedUser.address === "string") {
          try {
            fetchedUser.address = JSON.parse(fetchedUser.address);
          } catch {
            fetchedUser.address = { city: "", pincode: 0 };
          }
        }

        if (typeof fetchedUser.emergencyContact === "string") {
          try {
            fetchedUser.emergencyContact = JSON.parse(fetchedUser.emergencyContact);
          } catch {
            fetchedUser.emergencyContact = { name: "", number: 0 };
          }
        }

        setUser(fetchedUser);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, id]);

  // Restrict numeric input strictly
  const restrictNumberInput = (value: string, maxLength: number): string => {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.slice(0, maxLength);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editData) return;

    const { name, value } = e.currentTarget;
    if (!name) return;

    // Strict numeric handling
    if (
      name === "mobileNumber" ||
      name === "aadhar" ||
      name === "address.pincode" ||
      name === "emergencyContact.number"
    ) {
      const maxLength =
        name === "mobileNumber" || name === "emergencyContact.number"
          ? 10
          : name === "aadhar"
          ? 12
          : 6;

      const cleanedValue = restrictNumberInput(value, maxLength);

      if (name.startsWith("address.")) {
        const key = name.split(".")[1] as keyof Address;
        setEditData({
          ...editData,
          address: {
            ...editData.address,
            [key]: Number(cleanedValue),
          },
        });
      } else if (name.startsWith("emergencyContact.")) {
        const key = name.split(".")[1] as keyof EmergencyContact;
        setEditData({
          ...editData,
          emergencyContact: {
            ...editData.emergencyContact,
            [key]: Number(cleanedValue),
          },
        });
      } else {
        setEditData({
          ...editData,
          [name]: Number(cleanedValue),
        });
      }

      return;
    }

    // Normal fields
    if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof Address;
      setEditData({
        ...editData,
        address: {
          ...editData.address,
          [key]: value,
        },
      });
    } else if (name.startsWith("emergencyContact.")) {
      const key = name.split(".")[1] as keyof EmergencyContact;
      setEditData({
        ...editData,
        emergencyContact: {
          ...editData.emergencyContact,
          [key]: value,
        },
      });
    } else {
      setEditData({
        ...editData,
        [name]: value,
      });
    }
  };

  // Strict validation
  const validateFields = (): boolean => {
    if (!editData) return false;

    const newErrors: Record<string, string> = {};

    if (!editData.fullName || editData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters.";
    }

    if (!editData.gender) {
      newErrors.gender = "Gender is required.";
    }

    if (!editData.dob) {
      newErrors.dob = "Date of birth is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!/^[0-9]{10}$/.test(String(editData.mobileNumber))) {
      newErrors.mobileNumber = "Mobile number must be exactly 10 digits.";
    }

    if (!/^[0-9]{12}$/.test(String(editData.aadhar))) {
      newErrors.aadhar = "Aadhar must be exactly 12 digits.";
    }

    if (!editData.address?.city || editData.address.city.trim().length < 2) {
      newErrors["address.city"] = "City is required.";
    }

    if (!/^[0-9]{6}$/.test(String(editData.address?.pincode))) {
      newErrors["address.pincode"] = "Pincode must be 6 digits.";
    }

    if (
      !editData.emergencyContact?.name ||
      editData.emergencyContact.name.trim().length < 3
    ) {
      newErrors["emergencyContact.name"] =
        "Emergency contact name must be at least 3 characters.";
    }

    if (!/^[0-9]{10}$/.test(String(editData.emergencyContact?.number))) {
      newErrors["emergencyContact.number"] =
        "Emergency contact number must be exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      toast.error("Please fill all input correctely.");
      return;
    }

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("profilePhoto", selectedFile);
      }

      if (editData) {
        Object.entries(editData).forEach(([key, value]) => {
          if (typeof value !== "object") {
            formData.append(key, String(value));
          }
        });

        formData.append("address", JSON.stringify(editData.address));
        formData.append(
          "emergencyContact",
          JSON.stringify(editData.emergencyContact)
        );
      }

      const res = await api.put<UserResponse>(
        `/api/patient/update/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const updatedUser = res.data.user;

      if (typeof updatedUser.address === "string") {
        updatedUser.address = JSON.parse(updatedUser.address);
      }

      if (typeof updatedUser.emergencyContact === "string") {
        updatedUser.emergencyContact = JSON.parse(updatedUser.emergencyContact);
      }

      toast.success("Profile updated successfully");
      setUser(updatedUser);
      setIsEditing(false);
      setErrors({});
      setSelectedFile(null);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User Not Found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {!isEditing && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                setEditData(user);
                setIsEditing(true);
              }}
              className="bg-[#0c213e] text-white py-3 px-6 rounded-xl"
            >
              Edit Profile
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fields.map(({ key, label, icon: Icon }) => {
              const value = isEditing
                ? getValue(editData!, key)
                : getValue(user!, key);

              const isNumericField =
                key === "mobileNumber" ||
                key === "aadhar" ||
                key === "address.pincode" ||
                key === "emergencyContact.number";

              return (
                <div key={key} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm font-medium text-gray-500">
                      {label}
                    </span>
                  </div>

                  {isEditing ? (
                    <>
                      <input
                        type={key === "dob" ? "date" : "text"}
                        name={key}
                        inputMode={isNumericField ? "numeric" : undefined}
                        value={
                          key === "dob"
                            ? new Date(String(value)).toISOString().split("T")[0]
                            : value ?? ""
                        }
                        onChange={handleChange}
                        className="w-full py-2 px-3 rounded-lg border-2"
                      />
                      {errors[key] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[key]}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="py-2 font-semibold">
                      {key === "dob"
                        ? new Date(String(value)).toLocaleDateString("en-GB")
                        : value || "-"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isEditing && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl"
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setErrors({});
                }}
                className="flex-1 bg-gray-400 text-white py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
