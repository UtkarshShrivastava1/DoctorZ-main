import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  MapPin,
  Calendar,
  Stethoscope,
  Search as SearchIcon,
  Menu,
  X,
  Hospital,
} from "lucide-react";
import { Helmet } from "react-helmet";
import api from "../Services/mainApi";
import ClinicCard from "../components/ClinicCard";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type SearchState = {
  location?: string;
  specialty?: string;
  date?: string;
};

interface Clinic {
  _id: string;
  clinicName: string;
  clinicType: string;
  specialities: string[];
  address: string;
  district: string;
  state: string;
  phone: string;
  email: string;
  doctors: unknown[];
  clinicLicenseNumber: string;
  clinicImage?: string;
  operatingHours?: string;
  staffName?: string;
  staffEmail?: string;
  aadharNumber?: number;
  rating?: number;
  patientCount?: number;
  establishedYear?: number;
  isFavourite?: boolean;
}
interface DecodedToken {
  id: string;
}

const token = Cookies.get("patientToken");
const patientId = token ? (jwtDecode<DecodedToken>(token)?.id ?? null) : null;
const API = `/api/clinic/getClinic/${patientId}`;

const ClinicSearchResults: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const searchState = (state || {}) as SearchState;

  // Data + loading
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const clinicsPerPage = 6;

  // Search inputs
  const [specialty, setSpecialty] = useState(searchState.specialty || "");
  const [locationValue, setLocationValue] = useState(searchState.location || "");
  const [date, setDate] = useState(searchState.date || "");

  // Autocomplete states
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const specialtyInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const specialtyDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Filters
  const [specialtyFilters, setSpecialtyFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [expFilters, setExpFilters] = useState<string[]>([]);
    const [name, setName] = useState("");

  // Misc UI
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get unique specialties from clinics
  // const availableSpecialties = useMemo(() => {
  //   const specialties = new Set<string>();
  //   clinics.forEach((clinic) => {
  //     if (clinic.specialities && Array.isArray(clinic.specialities)) {
  //       clinic.specialities.forEach((spec) => {
  //         if (spec) specialties.add(spec.trim());
  //       });
  //     }
  //   });
  //   return Array.from(specialties).sort();
  // }, [clinics]);

  const availableSpecialties = useMemo(() => {
  const specialties = new Set<string>();

  const cleanSpec = (value: string) =>
    value.length > 4 ? value.slice(2, -2).trim() : "";

  clinics.forEach((clinic) => {
    if (clinic.specialities && Array.isArray(clinic.specialities)) {
      clinic.specialities.forEach((spec) => {
        const cleaned = cleanSpec(spec);
        if (cleaned) specialties.add(cleaned);
      });
    }
  });

  return Array.from(specialties).sort();
}, [clinics]);


  // Get unique locations from clinics
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    clinics.forEach((clinic) => {
      if (clinic.district) locations.add(clinic.district.trim());
      if (clinic.state) locations.add(clinic.state.trim());
      if (clinic.address) locations.add(clinic.address.trim());
    });
    return Array.from(locations).sort();
  }, [clinics]);

  // Filter specialties based on input
  // const filteredSpecialties = useMemo(() => {
  //   if (!specialty) return availableSpecialties.slice(0, 8);
  //   return availableSpecialties
  //     .filter((s) => s.toLowerCase().includes(specialty.toLowerCase()))
  //     .slice(0, 8);
  // }, [specialty, availableSpecialties]);

  const filteredSpecialties = useMemo(() => {
  if (!specialty) return availableSpecialties.slice(0, 8);

  const cleanedSpecialty =
    typeof specialty === "string"
      ? specialty.slice(2, -2)
      : "";
      // console.log(cleanedSpecialty)

  return availableSpecialties
    .filter((s) =>
      s.toLowerCase().includes(cleanedSpecialty.toLowerCase())
    )
    .slice(0, 8);
}, [specialty, availableSpecialties]);

// console.log(availableSpecialties)




  // Filter locations based on input
  const filteredLocations = useMemo(() => {
    if (!locationValue) return availableLocations.slice(0, 8);
    return availableLocations
      .filter((l) => l.toLowerCase().includes(locationValue.toLowerCase()))
      .slice(0, 8);
  }, [locationValue, availableLocations]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        specialtyDropdownRef.current &&
        !specialtyDropdownRef.current.contains(event.target as Node) &&
        !specialtyInputRef.current?.contains(event.target as Node)
      ) {
        setShowSpecialtyDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper: add mock fields so experience filter can work
  const enhanceClinicsWithMockData = (clinics: Clinic[]): Clinic[] =>
    clinics.map((clinic) => ({
      ...clinic,
      rating: clinic.rating ?? Math.random() * 2 + 3,
      patientCount: clinic.patientCount ?? Math.floor(Math.random() * 5000) + 1000,
      establishedYear: clinic.establishedYear ?? Math.floor(Math.random() * 30) + 1995,
    }));

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      setLocationValue(savedLocation);
    }

    const fetchClinics = async () => {
      setLoading(true);
      try {
        const response = await api.get(API);
        const responseData = response.data as any;
        const data: Clinic[] =
          responseData?.clinics || responseData?.clinic || responseData || [];
        const enhanced = enhanceClinicsWithMockData(data);
        setClinics(enhanced);
      } catch (err) {
        console.error("Error fetching clinics:", err);
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  useEffect(() => {
    localStorage.setItem("userLocation", locationValue);
  }, [locationValue]);

  // Toggle helper for multi-select filters
  const toggleMulti = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setter((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));
    setCurrentPage(1);
  };

  // Main filtering logic
  const filtered = useMemo(() => {
    const loc = locationValue.trim().toLowerCase();
    const specText = specialty.trim().toLowerCase();
    const nameText = name.trim().toLowerCase();


    return clinics.filter((clinic) => {
      const clinicName = (clinic.clinicName || "").toLowerCase();
      const district = (clinic.district || "").toLowerCase();
      const state = (clinic.state || "").toLowerCase();
      const cType = (clinic.clinicType || "").toLowerCase();
      const specialities = (clinic.specialities || []).map((s) => s.toLowerCase());


      if (nameText && !clinicName.includes(nameText)) {
  return false;
}
      // Specialty match
      let matchesSpec = true;
      if (specText) {
        matchesSpec = clinicName.includes(specText) || specialities.some((s) => s.includes(specText));
      }
      if (specialtyFilters.length > 0) {
        const sfLower = specialtyFilters.map((s) => s.toLowerCase());
        const matchesSidebarSpec = specialities.some((s) => sfLower.some((f) => s.includes(f)));
        matchesSpec = matchesSpec && matchesSidebarSpec;
      }
      if (!matchesSpec) return false;

      // Location filter
      if (loc) {
        if (!district.includes(loc) && !state.includes(loc) && !clinicName.includes(loc)) return false;
      }

      // Experience filter
      if (expFilters.length > 0) {
        const established = clinic.establishedYear ?? 0;
        const currentYear = new Date().getFullYear();
        const yearsOperating = currentYear - established;

        const matchesExp = expFilters.some((ef) => {
          if (ef === "15+") return yearsOperating >= 15;
          const parts = ef.split("-").map(Number);
          if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
            const [min, max] = parts;
            return yearsOperating >= min && yearsOperating <= max;
          }
          return false;
        });

        if (!matchesExp) return false;
      }

      // Clinic type filter
      if (typeFilters.length > 0) {
        const lowerTypeFilters = typeFilters.map((t) => t.toLowerCase());
        const matchesType = lowerTypeFilters.some((t) => cType.includes(t) || t.includes(cType));
        if (!matchesType) return false;
      }

      return true;
    });
  }, [clinics, specialty, name,specialtyFilters, locationValue, expFilters, typeFilters]);

  // Sort favorites first
  const sortedClinics = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isFavourite === b.isFavourite) return 0;
      return a.isFavourite ? -1 : 1;
    });
  }, [filtered]);

  // Pagination
  const indexOfLastClinic = currentPage * clinicsPerPage;
  const indexOfFirstClinic = indexOfLastClinic - clinicsPerPage;
  const currentClinics = sortedClinics.slice(indexOfFirstClinic, indexOfLastClinic);
  const totalPages = Math.max(1, Math.ceil(filtered.length / clinicsPerPage));

  const handleFavouriteToggle = (clinicId: string) => {
    setClinics((prevClinics) =>
      prevClinics
        .map((clinic) =>
          clinic._id === clinicId ? { ...clinic, isFavourite: !clinic.isFavourite } : clinic
        )
        .sort((a, b) => (a.isFavourite === b.isFavourite ? 0 : a.isFavourite ? -1 : 1))
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
    navigate("/clinic-search-results", {
      state: { location: locationValue, specialty, date },
      replace: true,
    });
  };

  const clearFilters = () => {
    setSpecialty("");
    setSpecialtyFilters([]);
    setLocationValue("");
    setDate("");
    setExpFilters([]);
    setTypeFilters([]);
    setCurrentPage(1);
  };

  const specialityOptions: string[] = [
    "Dental",
    "Dermatology",
    "Pediatrics",
    "Cardiology",
    "Gynecology",
    "Orthopedic",
    "ENT",
    "General",
  ];

  return (
    <div className="w-full bg-gray-50 ">
      <Helmet>
        <title>Find Clinics Near You | DoctorZ</title>
        <meta
          name="description"
          content="Find and book appointments at top clinics by specialization, location, and services on DoctorZ."
        />
      </Helmet>

      <div className="max-w-[1500px] mx-auto px-3 sm:px-4 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Filters (Desktop) */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-24 self-start">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <button onClick={clearFilters} className="text-sm text-[#0c213e] hover:underline">
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Clinic Type */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Clinic Type</h4>
                {["Government", "Private"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={typeFilters.includes(type)}
                      onChange={() => toggleMulti(setTypeFilters, type)}
                      className="accent-[#0c213e]"
                    />
                    {type}
                  </label>
                ))}
              </div>

              {/* Specialities */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Specialities</h4>
                {specialityOptions.map((spec) => (
                  <label key={spec} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={specialtyFilters.includes(spec)}
                      onChange={() => toggleMulti(setSpecialtyFilters, spec)}
                      className="accent-[#0c213e]"
                    />
                    {spec}
                  </label>
                ))}
              </div>

              {/* Experience */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Experience (Years Operating)</h4>
                {["0-5", "6-10", "11-15", "15+"].map((exp) => (
                  <label key={exp} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={expFilters.includes(exp)}
                      onChange={() => toggleMulti(setExpFilters, exp)}
                      className="accent-[#0c213e]"
                    />
                    {exp}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {specialty || specialtyFilters.length > 0
                  ? `Find ${specialty || specialtyFilters.join(", ")} Clinics`
                  : "Available Clinics"}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">{filtered.length} clinics found</p>
            </div>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#0c213e] text-[#0c213e] rounded-md text-sm font-medium hover:bg-[#0c213e]/10 transition-all"
            >
              <Menu className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="bg-white border border-gray-400 rounded-lg p-3 mb-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
  <Hospital className="w-4 h-4 text-gray-400" />
  <input
    type="text"
    placeholder="Clinic Name"
    className="w-full outline-none text-gray-700 font-semibold"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</div>
              {/* Specialty Input with Autocomplete */}
              <AutocompleteInput
                ref={specialtyInputRef}
                icon={<Stethoscope className="w-4 h-4 text-gray-400" />}
                placeholder="Specialty (e.g. Dental)"
                value={specialty}
                onChange={(val) => {
                  setSpecialty(val);
                  setShowSpecialtyDropdown(true);
                }}
                onFocus={() => setShowSpecialtyDropdown(true)}
                showDropdown={showSpecialtyDropdown}
                suggestions={filteredSpecialties}
                onSelectSuggestion={(val) => {
                  setSpecialty(val);
                  setShowSpecialtyDropdown(false);
                }}
                dropdownRef={specialtyDropdownRef}
              />

              {/* Location Input with Autocomplete */}
              <AutocompleteInput
                ref={locationInputRef}
                icon={<MapPin className="w-4 h-4 text-gray-400" />}
                placeholder="Location (district or state)"
                value={locationValue}
                onChange={(val) => {
                  setLocationValue(val);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                showDropdown={showLocationDropdown}
                suggestions={filteredLocations}
                onSelectSuggestion={(val) => {
                  setLocationValue(val);
                  setShowLocationDropdown(false);
                }}
                dropdownRef={locationDropdownRef}
              />

              <button
                // onClick={handleSearch}
                className="flex items-center justify-center gap-2 bg-[#0c213e] hover:bg-[#132d54] text-white font-medium rounded-lg px-4 py-1.5 border border-[#1f286f] transition-all duration-200"
              >
                <SearchIcon className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          {/* Clinic Cards */}
          {loading ? (
            <div className="bg-white rounded-lg p-6 shadow-sm text-center border border-gray-200">
              <div className="inline-block w-8 h-8 border-4 border-[#0c213e] border-t-transparent rounded-full animate-spin mb-2" />
              <div className="text-gray-600">Loading clinics...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-lg p-6 shadow-sm text-center border border-gray-200">
              <div className="text-gray-700">No clinics found matching your filters.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {currentClinics.map((clinic) => (
                <ClinicCard
                  key={clinic._id}
                  clinic={clinic}
                  navigate={navigate}
                  onFavouriteToggle={handleFavouriteToggle}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-5">
              <div className="inline-flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-200 ${
                      currentPage === i + 1
                        ? "bg-[#0c213e] text-white border-[#0c213e] shadow-lg shadow-[#0c213e]/30 scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#0c213e] hover:text-[#0c213e] hover:bg-[#0c213e]/10"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Right Help Card */}
        <aside className="lg:col-span-2 hidden lg:block">
          <div className="bg-[#08263a] text-white rounded-lg p-4 shadow-md border border-gray-200">
            <h3 className="font-semibold text-base">Need help finding the right clinic?</h3>
            <p className="text-sm mt-2 leading-snug">
              Call <span className="font-medium">+91-8040245807</span> to book instantly
            </p>
            <a
              href="tel:+918040245807"
              className="inline-block mt-3 bg-white text-[#08263a] font-medium px-3 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              Call Now
            </a>
          </div>
        </aside>
      </div>

      {/* Mobile Help Card */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#08263a] text-white p-4 shadow-lg z-40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Need help finding a clinic?</p>
            <p className="text-xs opacity-90">Call +91-8040245807</p>
          </div>
          <a
            href="tel:+918040245807"
            className="bg-white text-[#08263a] font-medium px-4 py-2 rounded text-sm hover:bg-gray-100 transition-colors"
          >
            Call Now
          </a>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-80 max-w-full h-full p-5 overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Specialities</h4>
                {specialityOptions.map((spec) => (
                  <label key={spec} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={specialtyFilters.includes(spec)}
                      onChange={() => toggleMulti(setSpecialtyFilters, spec)}
                      className="accent-[#0c213e]"
                    />
                    {spec}
                  </label>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Clinic Type</h4>
                {["Government", "Private"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={typeFilters.includes(type)}
                      onChange={() => toggleMulti(setTypeFilters, type)}
                      className="accent-[#0c213e]"
                    />
                    {type}
                  </label>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Experience</h4>
                {["0-5", "6-10", "11-15", "15+"].map((exp) => (
                  <label key={exp} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={expFilters.includes(exp)}
                      onChange={() => toggleMulti(setExpFilters, exp)}
                      className="accent-[#0c213e]"
                    />
                    {exp}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={clearFilters} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium">
                  Clear All
                </button>
                <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-2 px-4 bg-[#0c213e] text-white rounded-lg font-medium">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 🔹 Autocomplete Input Component */
const AutocompleteInput = React.forwardRef<
  HTMLInputElement,
  {
    icon: React.ReactNode;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    showDropdown: boolean;
    suggestions: string[];
    onSelectSuggestion: (value: string) => void;
    dropdownRef: React.RefObject<HTMLDivElement>;
  }
>(
  (
    {
      icon,
      placeholder,
      value,
      onChange,
      onFocus,
      showDropdown,
      suggestions,
      onSelectSuggestion,
      dropdownRef,
    },
    ref
  ) => (
    <div className="relative">
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
        {icon}
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="w-full outline-none text-gray-700 font-semibold"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 border-b border-gray-100  hover:bg-gray-100 text-sm text-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
);

export default ClinicSearchResults;