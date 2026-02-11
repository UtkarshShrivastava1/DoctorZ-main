import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import api from "../Services/mainApi";
import {
  Search,
  Filter,
  ChevronRight,
  Building2,
  Shield,
  Clock,
  Award,
  FlaskConical,
  Package,
  X,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";

// Import icons
import fullbody from "../assets/icons/fullbody.png";
import diabetes from "../assets/icons/Diabetes.png";
import womens from "../assets/icons/womens.png";
import thyroid from "../assets/icons/thyroid.png";
import vitamin from "../assets/icons/vitamin.png";
import blood from "../assets/icons/blood.png";
import heart from "../assets/icons/heart.png";
import kidney from "../assets/icons/kidney.png";
import liver from "../assets/icons/liver.png";
import hairfall from "../assets/icons/hairfall.png";
import fever from "../assets/icons/fever.png";
import senior from "../assets/icons/senior.png";
import testIcon from "../assets/icons/test.png";
import packageIcon from "../assets/icons/package.png";
import pcod from "../assets/icons/pcod.png";
import pregnancy from "../assets/icons/pregnancy.png";
import iron from "../assets/icons/iron.png";
import { Link } from "react-router-dom";
// import pill from "../assets/icons/pill.png";

// Interfaces
interface Lab {
  name?: string;
}

interface LabTest {
  name: string;
  _id: string;
  testName: string;
  shortDescription?: string;
  price?: number;
  category?: string;
  customCategory?: string;
  lab?: Lab;
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
  lab?: Lab;
  labName?: string;
  tests?: LabTest[];
  certified?: boolean;
}

export default function LabTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [query, setQuery] = useState("");
  // CHANGED: multiple categories instead of single
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAllTests, setShowAllTests] = useState(false);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const iconMap: Record<string, string> = {
    heart,
    liver,
    kidney,
    thyroid,
    vitamin,
    blood,
    diabetes,
    fever,
    hair: hairfall,
    women: womens,
    pcod,
    pregnancy,
    iron,
    senior,
    full: fullbody,
  };

  const categories = [
    { key: "Full Body", icon: fullbody, color: "from-blue-500 to-cyan-500" },
    { key: "Diabetes", icon: diabetes, color: "from-green-500 to-emerald-500" },
    { key: "Women's Health", icon: womens, color: "from-pink-500 to-rose-500" },
    { key: "Thyroid", icon: thyroid, color: "from-purple-500 to-violet-500" },
    { key: "Vitamin", icon: vitamin, color: "from-amber-500 to-orange-500" },
    { key: "Heart", icon: heart, color: "from-rose-500 to-red-500" },
    { key: "Kidney", icon: kidney, color: "from-indigo-500 to-blue-500" },
    { key: "Liver", icon: liver, color: "from-teal-500 to-cyan-500" },
    { key: "PCOD", icon: pcod, color: "from-pink-500 to-purple-500" },
    { key: "Pregnancy", icon: pregnancy, color: "from-rose-400 to-pink-500" },
    { key: "Fever", icon: fever, color: "from-orange-500 to-amber-500" },
    { key: "Senior", icon: senior, color: "from-slate-600 to-gray-700" },
  ];

  const getIconForTest = (test: LabTest): string => {
    const name = `${test.testName || ""} ${test.category || ""}`.toLowerCase();
    for (const key of Object.keys(iconMap)) {
      if (name.includes(key)) return iconMap[key];
    }
    return testIcon;
  };

  // NEW: toggle helper for multi-select categories
  const toggleCategory = (catKey: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catKey) ? prev.filter((c) => c !== catKey) : [...prev, catKey]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const testRes = await api.get("/api/lab/alllabtests");
        const rawTests = testRes.data as any;
        const testsData: LabTest[] = Array.isArray(rawTests)
          ? rawTests
          : Array.isArray(rawTests?.tests)
          ? rawTests.tests
          : [];

        const normalizedTests: LabTest[] = testsData.map((t: any) => ({
          ...t,
          lab: t.lab || { name: t.labName || "Unknown Lab" },
        }));
        setTests(normalizedTests);

        const packageRes = await api.get("/api/lab/packages");
        const packageData = Array.isArray(packageRes.data)
          ? packageRes.data
          : "packages" in (packageRes.data as Record<string, unknown>) &&
            Array.isArray((packageRes.data as Record<string, unknown>).packages)
          ? ((packageRes.data as Record<string, unknown>).packages as LabPackage[])
          : [];

        const normalizedPackages: LabPackage[] = packageData.map((p: any) => ({
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

  // const filteredTests = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   const hasCategoryFilters = selectedCategories.length > 0;

  //   return tests.filter((t) => {
  //     const matchesQuery =
  //       q === "" ||
  //       t.testName?.toLowerCase().includes(q) ||
  //       t.shortDescription?.toLowerCase().includes(q);

  //     if (!hasCategoryFilters) return matchesQuery;

  //     const nameBlob = `${t.testName || ""} ${t.category || ""} ${
  //       t.customCategory || ""
  //     }`.toLowerCase();

  //     const matchesAnyCategory = selectedCategories.some((cat) =>
  //       nameBlob.includes(cat.toLowerCase())
  //     );

  //     return matchesQuery && matchesAnyCategory;
  //   });
  // }, [tests, query, selectedCategories]);

  // Replace the existing filteredTests and filteredPackages useMemo hooks with these:

const filteredTests = useMemo(() => {
  const q = query.trim().toLowerCase();
  const hasCategoryFilters = selectedCategories.length > 0;

  return tests.filter((t) => {
    // ✅ SEARCH EVERYWHERE: test name, description, lab name, category
    const searchableText = `
      ${t.testName || ""} 
      ${t.shortDescription || ""} 
      ${t.lab?.name || t.labName || ""} 
      ${t.category || ""} 
      ${t.customCategory || ""}
    `.toLowerCase();

    const matchesQuery = q === "" || searchableText.includes(q);

    if (!hasCategoryFilters) return matchesQuery;

    // Category filtering (unchanged)
    const nameBlob = `${t.testName || ""} ${t.category || ""} ${t.customCategory || ""}`.toLowerCase();
    const matchesAnyCategory = selectedCategories.some((cat) =>
      nameBlob.includes(cat.toLowerCase())
    );

    return matchesQuery && matchesAnyCategory;
  });
}, [tests, query, selectedCategories]);

const filteredPackages = useMemo(() => {
  const q = query.trim().toLowerCase();
  const hasCategoryFilters = selectedCategories.length > 0;

  return packages.filter((p) => {
    // ✅ SEARCH EVERYWHERE: package name, description, lab name, tests included
    const searchableText = `
      ${p.packageName || p.name || p.title || ""} 
      ${p.description || p.shortDescription || ""} 
      ${p.lab?.name || p.labName || ""} 
      ${(p.tests || []).map(t => t.testName || t.name).join(' ') || ""}
    `.toLowerCase();

    const matchesQuery = q === "" || searchableText.includes(q);

    if (!hasCategoryFilters) return matchesQuery;

    // Category filtering (unchanged)
    const matchesAnyCategory = selectedCategories.some((cat) => {
      const c = cat.toLowerCase();
      const name = (p.packageName || p.name || p.title || "").toLowerCase();
      const desc = (p.description || p.shortDescription || "").toLowerCase();
      return name.includes(c) || desc.includes(c);
    });

    return matchesQuery && matchesAnyCategory;
  });
}, [packages, query, selectedCategories]);


  // const filteredPackages = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   const hasCategoryFilters = selectedCategories.length > 0;

  //   return packages.filter((p) => {
  //     const name = (p.packageName || p.name || p.title || "").toLowerCase();
  //     const desc = (p.description || p.shortDescription || "").toLowerCase();

  //     const matchesQuery = q === "" || name.includes(q) || desc.includes(q);

  //     if (!hasCategoryFilters) return matchesQuery;

  //     const matchesAnyCategory = selectedCategories.some((cat) => {
  //       const c = cat.toLowerCase();
  //       return name.includes(c) || desc.includes(c);
  //     });

  //     return matchesQuery && matchesAnyCategory;
  //   });
  // }, [packages, query, selectedCategories]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20"
      style={{ fontFamily: "var(--font-primary, Inter, system-ui, sans-serif)" }}
    >
      {/* Compact Header with Search */}
      <header className="sticky top-0 z-45 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for tests, packages, or conditions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0c213e] focus:outline-none text-gray-800 transition-all"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#0c213e] text-white rounded-xl font-semibold hover:bg-[#1a3557] transition-colors shadow-md"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Active Filter Badge(s) */}
          {selectedCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 flex-wrap"
            >
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCategories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 bg-[#0c213e] text-white px-4 py-1.5 rounded-full text-sm font-medium"
                >
                  {cat}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSelectedCategories([])}
                className="text-xs text-[#0c213e] hover:underline font-medium"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Trust Indicators Bar */}
      <div className="bg-gradient-to-r from-[#0c213e] to-[#1a3557] text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="font-medium">NABL Certified Labs</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              <span className="font-medium">100% Accurate Reports</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="font-medium">24-48 Hour Results</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="font-medium">50,000+ Happy Patients</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Browse by Category</h2>
            {/* {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-sm text-[#0c213e] hover:underline font-medium"
              >
                Clear
              </button>
            )} */}
          </div>
          <div className="flex overflow-x-auto gap-3 pb-1 px-1 scrollbar-hide pt-2">
            {categories.map((cat) => {
              const isActive = selectedCategories.includes(cat.key);
              return (
                <motion.button
                  key={cat.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleCategory(cat.key)}
                  className={`flex flex-col items-center min-w-[90px] p-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-[#0c213e] bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center mb-2 shadow-md`}
                  >
                    <img
                      src={cat.icon}
                      alt={cat.key}
                      className="w-6 h-6 object-contain filter brightness-0 invert"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                    {cat.key}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Available Tests Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0c213e] rounded-xl shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Tests</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTests.length} {filteredTests.length === 1 ? "test" : "tests"} available
                </p>
              </div>
            </div>
            {filteredTests.length > 8 && (
              <button
                onClick={() => setShowAllTests(!showAllTests)}
                className="group flex items-center gap-2 bg-white border-2 border-[#0c213e] text-[#0c213e] px-6 py-3 rounded-xl font-semibold hover:bg-[#0c213e] hover:text-white transition-all duration-300"
              >
                {showAllTests ? "Show Less" : "View All"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm p-6 animate-pulse border border-gray-200"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl mt-4"></div>
                </div>
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Tests Found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter</p>
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCategories([]);
                }}
                className="bg-[#0c213e] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1a3557] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTests.slice(0, showAllTests ? filteredTests.length : 8).map((t) => (
                <motion.div
                  key={t._id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-[#0c213e]/20 flex flex-col transition-all duration-300"
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-[#0c213e]/5 group-hover:bg-[#0c213e]/10 transition-colors flex items-center justify-center text-2xl min-w-[56px] h-14">
                        <img
                          src={getIconForTest(t)}
                          alt={t.testName}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                          {t.testName}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {t.shortDescription || "Comprehensive diagnostic test"}
                        </p>
                      </div>
                    </div>

                    {(t.lab?.name || t.labName) && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1.5 text-md text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="font-medium">{t.lab?.name || t.labName}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex-1"></div>

                    <div className="pt-4 border-t border-gray-100 mt-2">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-[#0c213e]">
                            ₹{t.price ?? "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">Per Test</div>
                        </div>
                      </div>

                      {/* <Link to={`/lab-test-details/${t._id}`}>
                      <button
                        // onClick={() => {
                        //   window.location.href = `/lab-test-details/${t._id}`;
                        // }}
                        className="w-full bg-[#0c213e] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#1a3557] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer"
                        >
                        View Details
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                        </Link> */}

                        {/* <Link 
  to={`/lab-test-details/${t._id}`}
  className="w-full bg-[#0c213e] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#1a3557] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer"
>
  View Details
  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
</Link> */}

<button
  onClick={() => navigate(`/lab-test-details/${t._id}`)}
  className="w-full bg-[#0c213e] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#1a3557] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer"
>
  View Details
  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Health Packages Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#1a3557] rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Health Packages</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete checkup packages at best prices
                </p>
              </div>
            </div>
            {filteredPackages.length > 8 && (
              <button
                onClick={() => setShowAllPackages(!showAllPackages)}
                className="group flex items-center gap-2 bg-white border-2 border-[#1a3557] text-[#1a3557] px-6 py-3 rounded-xl font-semibold hover:bg-[#1a3557] hover:text-white transition-all duration-300"
              >
                {showAllPackages ? "Show Less" : "View All"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm p-6 animate-pulse border border-gray-200"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl mt-4"></div>
                </div>
              ))}
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Packages Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPackages
                .slice(0, showAllPackages ? filteredPackages.length : 8)
                .map((p) => {
                  const packageName = p.packageName || p.name || p.title || "Health Package";
                  const description =
                    p.description || p.shortDescription || "Comprehensive package";
                  const price = p.totalPrice || p.price || "N/A";
                  const included = p.tests || [];

                  return (
                    <motion.div
                      key={p._id || packageName}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-[#1a3557]/20 flex flex-col transition-all duration-300"
                    >
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-[#1a3557]/5 group-hover:bg-[#1a3557]/10 transition-colors flex items-center justify-center text-2xl min-w-[56px] h-14">
                            <img
                              src={packageIcon}
                              alt="Package"
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                              {packageName}
                            </h3>
                            <p className="text-md text-gray-600 line-clamp-2 leading-tight">
                              {description}
                            </p>
                          </div>
                        </div>

                        {Array.isArray(included) && included.length > 0 && (
                          <div className="mb-4">
                            <div className="inline-flex items-center gap-1.5 bg-[#1a3557]/10 text-[#1a3557] px-3 py-1.5 rounded-lg text-xs font-semibold">
                              <FlaskConical className="w-3.5 h-3.5" />
                              <span>{included.length} Tests Included</span>
                            </div>
                          </div>
                        )}

                        {Array.isArray(included) && included.length > 0 && (
                          <div className="mb-4 bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                            <div className="text-xs font-semibold text-gray-700 mb-1.5">
                              Complete Package:
                            </div>
                            <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {included
                                .slice(0, 2)
                                .map((t) => t.testName || t.name)
                                .join(", ")}
                              {included.length > 2 && ` +${included.length - 2} more`}
                            </div>
                          </div>
                        )}

                        {p.certified && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4">
                            <Shield className="w-3.5 h-3.5 text-green-600" />
                            <span className="font-medium">Lab Certified</span>
                          </div>
                        )}

                        <div className="flex-1"></div>

                        <div className="pt-4 border-t border-gray-100 mt-2">
                          <div className="flex items-end justify-between mb-4">
                            <div>
                              <div className="text-2xl font-bold text-[#1a3557]">₹{price}</div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Complete Package
                              </div>
                            </div>
                            {(p.lab?.name || p.labName) && (
                              <span className="text-xs font-semibold text-[#1a3557] bg-[#1a3557]/10 px-3 py-1.5 rounded-lg flex items-center gap-1 justify-between">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {p.lab?.name || p.labName}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              window.location.href = `/lab-package-details/${p._id}`;
                            }}
                            className="w-full bg-[#1a3557] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#0c213e] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                          >
                            View Package
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </section>
      </main>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filter by Category</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {categories.map((cat) => {
                  const isActive = selectedCategories.includes(cat.key);
                  return (
                    <button
                      key={cat.key}
                      onClick={() => toggleCategory(cat.key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-[#0c213e] bg-blue-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md`}
                      >
                        <img
                          src={cat.icon}
                          alt={cat.key}
                          className="w-5 h-5 object-contain filter brightness-0 invert"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {cat.key}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setShowFilterModal(false);
                  }}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 bg-[#0c213e] text-white font-semibold py-2.5 rounded-xl hover:bg-[#1a3557] transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
