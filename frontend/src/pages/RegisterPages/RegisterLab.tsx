import { useState } from "react";
import { registerLab } from "../../Services/labApi";

// ✅ Toastify
import { toast, Toaster } from "react-hot-toast";

interface Timings {
  open: string;
  close: string;
}

interface Lab {
  name: string;
  email: string;
  password: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  timings: Timings;
}

export default function RegisterLab() {
  const [pincodeError, setPincodeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [lab, setLab] = useState<Lab & { certificateNumber?: string }>({
    name: "",
    email: "",
    password: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    timings: { open: "", close: "" },
    certificateNumber: "",
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
    
    if (name === "open" || name === "close") {
      setLab((prev) => ({
        ...prev,
        timings: { ...prev.timings, [name]: value },
      }));
    } else {
      setLab((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Lab Name validation
    if (!lab.name.trim()) {
      newErrors.name = "Lab name is required";
    } else if (lab.name.trim().length < 3) {
      newErrors.name = "Lab name must be at least 3 characters";
    } else if (!/^[A-Za-z0-9\s.,'-]+$/.test(lab.name)) {
      newErrors.name = "Lab name contains invalid characters";
    }

    // Email validation
    if (!lab.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lab.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Password validation
    if (!lab.password) {
      newErrors.password = "Password is required";
    } else if (lab.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(lab.password)
    ) {
      newErrors.password =
        "Password must include uppercase, lowercase, number and special character";
    }

    // Certificate Number validation
    if (!lab.certificateNumber?.trim()) {
      newErrors.certificateNumber = "Certificate number is required";
    } else if (lab.certificateNumber.trim().length < 5) {
      newErrors.certificateNumber =
        "Certificate number must be at least 5 characters";
    }

    // State validation
    if (!lab.state.trim()) {
      newErrors.state = "State is required";
    }

    // City validation
    if (!lab.city.trim()) {
      newErrors.city = "City is required";
    } else if (!/^[A-Za-z\s]+$/.test(lab.city)) {
      newErrors.city = "City must contain only letters";
    }

    // Address validation
    if (!lab.address.trim()) {
      newErrors.address = "Address is required";
    } else if (lab.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }

    // Pincode validation
    if (!lab.pincode) {
      newErrors.pincode = "Pincode is required";
      setPincodeError("Pincode is required");
    } else if (!/^[0-9]{6}$/.test(lab.pincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
      setPincodeError("Pincode must be exactly 6 digits");
    }

    // Opening Time validation
    if (!lab.timings.open) {
      newErrors.open = "Opening time is required";
    }

    // Closing Time validation
    if (!lab.timings.close) {
      newErrors.close = "Closing time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistration = async () => {
    if (!validateForm()) {
      toast.error("Please fill the required fields correctly", { duration: 3500 });
      return;
    }

    setLoading(true);
    setPincodeError("");

    const cleanedData = {
      ...lab,
      email: lab.email.trim().toLowerCase(),
    };

    try {
      const response = await registerLab(cleanedData);
      if (response.status === 201) {
        toast.success(
          "Registration Successful! Your lab details have been submitted for admin approval.",
          { duration: 3500 }
        );

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error: any) {
      // console.log(error)
      // toast.error(error?.response?.data?.message || "Error registering lab", {
      //   duration: 3500,
      // });
      console.log(error);

let errorMessage = "Error registering lab";

if (error?.response?.data?.message) {
  const rawMessage = error.response.data.message;

  if (rawMessage.includes("E11000") && rawMessage.includes("email")) {
    errorMessage = "A lab with this email already exists.";
  } else if (rawMessage.includes("E11000") && rawMessage.includes("certificateNumber")) {
    errorMessage = "This certificate number is already registered.";
  } else {
    errorMessage = rawMessage;
  }
}

toast.error(errorMessage, {
  duration: 3500,
});

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Toastify Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3400,
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      {/* SEO */}
      <head>
        <title>Register Your Diagnostic Lab | HealthCare Platform</title>
        <meta
          name="description"
          content="Register your diagnostic lab easily on our platform. Get verified and reach patients in your area."
        />
        <meta
          name="keywords"
          content="lab registration, diagnostic center, healthcare platform"
        />
      </head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center px-6 py-16">
        <section
          className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-10 animate-fade-in"
          aria-label="Lab registration form"
        >
          <h1 className="text-3xl font-extrabold text-[#0c213e] text-center mb-8 tracking-tight">
            🧪 Register Your Laboratory
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Join our trusted network of diagnostic centers. Fill in your lab
            details below.
          </p>
          <p className="text-center text-red-500 text-sm mb-10">
            ( <span className="text-red-500">*</span> Shows required field )
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegistration();
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Input
              label="Lab Name"
              name="name"
              value={lab.name}
              onChange={handleOnChange}
              error={errors.name}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={lab.email}
              onChange={handleOnChange}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={lab.password}
              onChange={handleOnChange}
              error={errors.password}
              required
            />
            <Input
              label="Certificate Number"
              name="certificateNumber"
              value={lab.certificateNumber}
              onChange={handleOnChange}
              error={errors.certificateNumber}
              required
            />
            <div className="flex flex-col space-y-1">
              <label htmlFor="state" className="text-sm font-medium text-gray-700">
                State
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="state"
                name="state"
                value={lab.state}
                onChange={handleOnChange}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 bg-white"
              >
                <option value="">Select State</option>
                <option>Andhra Pradesh</option>
                <option>Arunachal Pradesh</option>
                <option>Assam</option>
                <option>Bihar</option>
                <option>Chhattisgarh</option>
                <option>Goa</option>
                <option>Gujarat</option>
                <option>Haryana</option>
                <option>Himachal Pradesh</option>
                <option>Jharkhand</option>
                <option>Karnataka</option>
                <option>Kerala</option>
                <option>Madhya Pradesh</option>
                <option>Maharashtra</option>
                <option>Manipur</option>
                <option>Meghalaya</option>
                <option>Mizoram</option>
                <option>Nagaland</option>
                <option>Odisha</option>
                <option>Punjab</option>
                <option>Rajasthan</option>
                <option>Sikkim</option>
                <option>Tamil Nadu</option>
                <option>Telangana</option>
                <option>Tripura</option>
                <option>Uttar Pradesh</option>
                <option>Uttarakhand</option>
                <option>West Bengal</option>
                <option>Andaman and Nicobar Islands</option>
                <option>Chandigarh</option>
                <option>Dadra and Nagar Haveli and Daman and Diu</option>
                <option>Delhi</option>
                <option>Jammu and Kashmir</option>
                <option>Ladakh</option>
                <option>Lakshadweep</option>
                <option>Puducherry</option>
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            <Input
              label="City"
              name="city"
              value={lab.city}
              onChange={handleOnChange}
              error={errors.city}
              required
            />
            <Input
              label="Address"
              name="address"
              value={lab.address}
              onChange={handleOnChange}
              error={errors.address}
              required
            />

            <div>
              <Input
                label="Pincode"
                name="pincode"
                value={lab.pincode}
                onChange={(e) => {
                  setPincodeError("");
                  setErrors((prev) => ({ ...prev, pincode: "" }));
                  handleOnChange(e);
                }}
                placeholder="Enter 6-digit pincode"
                error={errors.pincode}
                required
              />
            </div>

            <Input
              label="Opening Time"
              name="open"
              value={lab.timings.open}
              onChange={handleOnChange}
              placeholder="e.g. 9:00 AM"
              error={errors.open}
              required
            />
            <Input
              label="Closing Time"
              name="close"
              value={lab.timings.close}
              onChange={handleOnChange}
              placeholder="e.g. 7:00 PM"
              error={errors.close}
              required
            />

            <div className="md:col-span-2 text-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-2.5 text-white text-lg font-semibold rounded-lg 
                  bg-[#0c213e] hover:bg-[#1f2775] shadow-md transition 
                  ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? "Submitting..." : "Register Lab"}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Already registered?{" "}
            <a
              href="/lab-login"
              className="cursor-pointer text-blue-600 font-semibold hover:underline"
            >
              Login Here
            </a>
          </p>
        </section>
      </main>
    </>
  );
}

/* Reusable Input Component */
function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder || label}
        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 bg-white"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}