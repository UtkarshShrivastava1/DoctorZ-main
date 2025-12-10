import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  Shield,
  Award,
  Clock,
  ChevronRight,
  X,
  Filter,
  TrendingUp,
  CheckCircle2,
  Package,
  Microscope,
  Heart,
  Star,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";

// Icon mappings
const iconMap = {
  fullbody: "https://img.icons8.com/fluency/96/whole-body.png",
  diabetes: "https://img.icons8.com/fluency/96/diabetes.png",
  womens: "https://img.icons8.com/fluency/96/female.png",
  thyroid: "https://img.icons8.com/fluency/96/thyroid.png",
  vitamin: "https://img.icons8.com/fluency/96/vitamin.png",
  blood: "https://img.icons8.com/fluency/96/blood-sample.png",
  heart: "https://img.icons8.com/fluency/96/heart-with-pulse.png",
  kidney: "https://img.icons8.com/fluency/96/kidney.png",
  liver: "https://img.icons8.com/fluency/96/liver.png",
  hairfall: "https://img.icons8.com/fluency/96/hair.png",
  fever: "https://img.icons8.com/fluency/96/temperature.png",
  senior: "https://img.icons8.com/fluency/96/elderly-person.png",
  pcod: "https://img.icons8.com/fluency/96/ovary.png",
  pregnancy: "https://img.icons8.com/fluency/96/pregnant.png",
  iron: "https://img.icons8.com/fluency/96/blood-bag.png",
  pill: "https://img.icons8.com/fluency/96/pill.png",
  test: "https://img.icons8.com/fluency/96/test-tube.png",
  package: "https://img.icons8.com/fluency/96/package.png",
};

interface LabTest {
  name: string;
  _id: string;
  testName: string;
  shortDescription?: string;
  price?: number;
  category?: string;
  customCategory?: string;
  lab?: { name?: string };
  labName?: string;
}

interface LabPackage {
  _id: string;
  packageName?: string;
  name?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  totalPrice?: number;
  price?: number;
  lab?: { name?: string };
  labName?: string;
  tests?: LabTest[];
}

export default function LabTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [selectedHealthCheck, setSelectedHealthCheck] = useState<string | null>(null);
  const [showAllTests, setShowAllTests] = useState(false);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tests
        const testRes = await fetch("/api/lab/alllabtests");
        const testData = await testRes.json();
        const testsArray = Array.isArray(testData) ? testData : testData?.tests || [];

        const normalizedTests = testsArray.map((t: any) => ({
          ...t,
          lab: t.lab || { name: t.labName || "Unknown Lab" },
        }));
        setTests(normalizedTests);

        // Fetch packages
        const packageRes = await fetch("/api/lab/packages");
        const packageData = await packageRes.json();
        const packagesArray = Array.isArray(packageData) ? packageData : packageData?.packages || [];

        const normalizedPackages = packagesArray.map((p: any) => ({
          ...p,
          lab: p.lab || { name: p.labName || "Unknown Lab" },
        }));
        setPackages(normalizedPackages);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    setQuery(searchInput);
    if (resultsRef.current) {
      const offset = window.innerWidth < 768 ? 80 : 120;
      const elementPosition = resultsRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const getIconForCategory = (category?: string): string => {
    if (!category) return iconMap.test;
    const cat = category.toLowerCase();
    if (cat.includes("blood")) return iconMap.blood;
    if (cat.includes("thyroid")) return iconMap.thyroid;
    if (cat.includes("diabetes")) return iconMap.diabetes;
    if (cat.includes("heart") || cat.includes("cardiac")) return iconMap.heart;
    if (cat.includes("vitamin")) return iconMap.vitamin;
    if (cat.includes("liver")) return iconMap.liver;
    if (cat.includes("kidney")) return iconMap.kidney;
    if (cat.includes("fever")) return iconMap.fever;
    if (cat.includes("hair")) return iconMap.hairfall;
    return iconMap.test;
  };

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      const matchesQuery =
        q === "" ||
        t.testName?.toLowerCase().includes(q) ||
        t.shortDescription?.toLowerCase().includes(q);
      const matchesHealth =
        !selectedHealthCheck ||
        t.category?.toLowerCase().includes(selectedHealthCheck.toLowerCase()) ||
        t.customCategory?.toLowerCase().includes(selectedHealthCheck.toLowerCase()) ||
        t.testName?.toLowerCase().includes(selectedHealthCheck.toLowerCase());
      return matchesQuery && matchesHealth;
    });
  }, [tests, query, selectedHealthCheck]);

  const filteredPackages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((p) => {
      const name = p.packageName || p.name || p.title || "";
      const desc = p.description || p.shortDescription || "";
      const matchesQuery =
        q === "" || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      const matchesHealth =
        !selectedHealthCheck ||
        name.toLowerCase().includes(selectedHealthCheck.toLowerCase()) ||
        desc.toLowerCase().includes(selectedHealthCheck.toLowerCase());
      return matchesQuery && matchesHealth;
    });
  }, [packages, query, selectedHealthCheck]);

  const healthChecks = [
    { key: "Full Body Checkup", icon: iconMap.fullbody, emoji: "🏥" },
    { key: "Diabetes", icon: iconMap.diabetes, emoji: "💉" },
    { key: "Women's Health", icon: iconMap.womens, emoji: "👩‍⚕️" },
    { key: "Thyroid", icon: iconMap.thyroid, emoji: "🦋" },
    { key: "Vitamin", icon: iconMap.vitamin, emoji: "💊" },
    { key: "Blood Studies", icon: iconMap.blood, emoji: "🩸" },
    { key: "Heart", icon: iconMap.heart, emoji: "❤️" },
    { key: "Kidney", icon: iconMap.kidney, emoji: "🫘" },
    { key: "Liver", icon: iconMap.liver, emoji: "🫀" },
    { key: "Hairfall", icon: iconMap.hairfall, emoji: "💆" },
    { key: "Fever", icon: iconMap.fever, emoji: "🌡️" },
    { key: "Senior Citizen", icon: iconMap.senior, emoji: "👴" },
  ];

  const womenCare = [
    { key: "PCOD Screening", icon: iconMap.pcod, emoji: "🔬" },
    { key: "Pregnancy", icon: iconMap.pregnancy, emoji: "🤰" },
    { key: "Iron Studies", icon: iconMap.iron, emoji: "⚕️" },
    { key: "Bone Health", icon: iconMap.vitamin, emoji: "🦴" },
  ];

  const clearAllFilters = () => {
    setSearchInput("");
    setQuery("");
    setSelectedHealthCheck(null);
    setMobileFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0c213e] via-[#1a3a5c] to-[#0c213e] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-16 md:pb-20 text-center">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm mb-6"
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">NABL Certified • 50,000+ Happy Patients</span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">
              Book Lab Tests & Health Checkups
            </h1>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
              Get accurate results from certified labs with free home sample collection
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for tests, packages, or health conditions..."
                className="w-full pl-12 pr-32 py-4 text-base text-gray-900 bg-white rounded-xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0c213e] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#0a1a30] transition-colors flex items-center gap-2"
              >
                <SearchIcon className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-5 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>100% Accurate</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>24-48 Hour Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Free Consultation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Category Filters */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Popular Health Checks</h2>
                <p className="text-sm text-gray-500">Curated by expert doctors</p>
              </div>
            </div>
            {selectedHealthCheck && (
              <button
                onClick={clearAllFilters}
                className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3">
            {healthChecks.map((hc) => (
              <motion.button
                key={hc.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedHealthCheck(selectedHealthCheck === hc.key ? null : hc.key)
                }
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedHealthCheck === hc.key
                    ? "border-[#0c213e] bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{hc.emoji}</span>
                  <span className="text-xs font-semibold text-gray-900 text-center leading-tight">
                    {hc.key}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 bg-white"
          >
            <Filter className="w-5 h-5" />
            {selectedHealthCheck ? `Filter: ${selectedHealthCheck}` : "Filter by Category"}
          </button>
        </section>

        {/* Tests Section */}
        <section ref={resultsRef} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔬</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Available Tests</h2>
                <p className="text-sm text-gray-500">{filteredTests.length} tests available</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#0c213e] text-white rounded-xl font-semibold hover:bg-[#0a1a30]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredTests.slice(0, showAllTests ? undefined : 8).map((test) => (
                  <motion.div
                    key={test._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-300 transition-all duration-300"
                  >
                    <div className="flex gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl group-hover:from-blue-100 group-hover:to-cyan-100 transition-colors">
                        <img
                          src={getIconForCategory(test.category)}
                          alt={test.testName}
                          className="w-10 h-10"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm leading-tight group-hover:text-[#0c213e]">
                          {test.testName}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {test.shortDescription || "Comprehensive diagnostic test"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{test.price ?? "N/A"}
                      </div>
                      {test.lab?.name && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {test.lab.name}
                        </span>
                      )}
                    </div>

                    <button className="w-full bg-gradient-to-r from-[#0c213e] to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3">
                      View Details
                      <ChevronRight className="w-4 h-4 transition-all" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {filteredTests.length > 8 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllTests(!showAllTests)}
                    className="px-8 py-3 border-2 border-[#0c213e] text-[#0c213e] rounded-xl font-semibold hover:bg-[#0c213e] hover:text-white transition-all"
                  >
                    {showAllTests ? "Show Less" : `View All ${filteredTests.length} Tests`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Packages Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Health Packages</h2>
                <p className="text-sm text-gray-500">Complete checkup packages at best prices</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading packages...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No packages found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#0c213e] text-white rounded-xl font-semibold hover:bg-[#0a1a30]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPackages.slice(0, showAllPackages ? undefined : 6).map((pkg) => (
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-6 shadow-md hover:shadow-xl border border-purple-100 hover:border-purple-300 transition-all duration-300"
                  >
                    <div className="flex gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                        <Package className="w-10 h-10 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-purple-700">
                          {pkg.packageName || pkg.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {pkg.description || pkg.shortDescription}
                        </p>
                      </div>
                    </div>

                    {pkg.tests && pkg.tests.length > 0 && (
                      <div className="mb-4 bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs font-bold text-purple-700 mb-1">
                          Includes {pkg.tests.length} tests
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {pkg.tests
                            .slice(0, 2)
                            .map((t) => t.testName)
                            .join(", ")}
                          {pkg.tests.length > 2 && ` +${pkg.tests.length - 2} more`}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{pkg.totalPrice || pkg.price}
                      </div>
                      {pkg.lab?.name && (
                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                          {pkg.lab.name}
                        </span>
                      )}
                    </div>

                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3">
                      View Package
                      <ChevronRight className="w-4 h-4 transition-all" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {filteredPackages.length > 6 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllPackages(!showAllPackages)}
                    className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all"
                  >
                    {showAllPackages
                      ? "Show Less"
                      : `View All ${filteredPackages.length} Packages`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Women's Health Section */}
        <section className="p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 rounded-2xl border border-pink-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💕</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Women's Health Care</h2>
              <p className="text-sm text-gray-600">Specialized tests for women's wellness</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {womenCare.map((w) => (
              <motion.button
                key={w.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedHealthCheck(selectedHealthCheck === w.key ? null : w.key)
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedHealthCheck === w.key
                    ? "border-pink-500 bg-white shadow-lg"
                    : "border-white bg-white/70 hover:bg-white hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{w.emoji}</span>
                  <span className="text-xs font-semibold text-gray-900 text-center leading-tight">
                    {w.key}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Mobile Filter Modal */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <motion.div
              className="fixed inset-0 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              />

              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[75vh] overflow-y-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Filter by Category</h3>
                    <p className="text-sm text-gray-500">Choose a health check to filter results</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:underline flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                      aria-label="Close"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Popular</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {healthChecks.map((hc) => (
                      <button
                        key={hc.key}
                        onClick={() =>
                          setSelectedHealthCheck(selectedHealthCheck === hc.key ? null : hc.key)
                        }
                        className={`p-3 rounded-xl border transition-all text-center text-xs ${
                          selectedHealthCheck === hc.key
                            ? "border-[#0c213e] bg-blue-50 shadow"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl">{hc.emoji}</span>
                          <span className="font-medium">{hc.key}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Women's Health</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {womenCare.map((w) => (
                      <button
                        key={w.key}
                        onClick={() =>
                          setSelectedHealthCheck(selectedHealthCheck === w.key ? null : w.key)
                        }
                        className={`p-3 rounded-xl border transition-all text-center text-xs ${
                          selectedHealthCheck === w.key
                            ? "border-pink-500 bg-white shadow"
                            : "border-gray-200 bg-white/80"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl">{w.emoji}</span>
                          <span className="font-medium">{w.key}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // apply filters and close modal
                      setMobileFilterOpen(false);
                      // Keep query the same — user may search separately
                      if (resultsRef.current) {
                        const offset = window.innerWidth < 768 ? 80 : 120;
                        const elementPosition = resultsRef.current.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;
                        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-[#0c213e] text-white rounded-xl font-semibold hover:bg-[#0a1a30] transition-colors"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      setSelectedHealthCheck(null);
                      setMobileFilterOpen(false);
                    }}
                    className="px-4 py-3 border rounded-xl font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
