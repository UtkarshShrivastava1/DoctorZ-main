import { useEffect, useState, useContext } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Building2,
  Package,
  FlaskConical,
} from "lucide-react";
import { getUserLabTests, getPatientPackageBookings } from "../../Services/getLabTest";
import { AuthContext } from "../../Context/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LabTestItem {
  labId: { name: string; city: string; address: string };
  _id: string;
  testName: string;
  status: string;
  bookedAt?: string;
  reportUrl?: string;
}

export interface PackageBookingItem {
  _id: string;
  packageId: {
    packageName: string;
    description: string;
    totalPrice: number;
  };
  labId: {
    name: string;
    city: string;
    address: string;
  };
  bookingDate: string;
  status: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const statusStyle = (status: string): string => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-50 text-green-700 border border-green-100";
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    case "cancelled":
      return "bg-red-50 text-red-700 border border-red-100";
    default:
      return "bg-gray-50 text-gray-600 border border-gray-100";
  }
};

// ─── Sub-components ────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 bg-[#0c213e]/8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
        {label}
      </p>
      <p className="text-base font-medium text-gray-700">{value}</p>
    </div>
  </div>
);

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPrev, onNext }) => (
  <div className="flex justify-center items-center gap-3 mt-6">
    <button
      disabled={page === 1}
      onClick={onPrev}
      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#0c213e] hover:bg-[#0c213e] hover:text-white hover:border-[#0c213e] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0c213e] disabled:hover:border-gray-200 transition-all duration-150"
    >
      <ChevronLeft size={18} />
    </button>
    <span className="text-sm font-semibold text-gray-500 px-4 py-2 bg-white border border-gray-100 rounded-xl">
      {page} / {totalPages}
    </span>
    <button
      disabled={page === totalPages}
      onClick={onNext}
      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#0c213e] hover:bg-[#0c213e] hover:text-white hover:border-[#0c213e] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0c213e] disabled:hover:border-gray-200 transition-all duration-150"
    >
      <ChevronRight size={18} />
    </button>
  </div>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
    <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
    <p className="text-base text-gray-400">{subtitle}</p>
  </div>
);

// ─── Lab Test Card (always expanded) ──────────────────────────────────────────

const LabTestCard: React.FC<{ test: LabTestItem }> = ({ test }) => {
  const hasDate = !!test.bookedAt && !isNaN(Date.parse(test.bookedAt));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card header strip */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0c213e] rounded-xl flex items-center justify-center flex-shrink-0">
            <FlaskConical size={20} className="text-[#a8c4e0]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#0c213e]">{test.testName}</p>
            <p className="text-md text-gray-400 mt-0.5">{test.labId.name}</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${statusStyle(test.status)}`}>
          {test.status}
        </span>
      </div>

      {/* Card body — always visible */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <InfoRow
            icon={<Building2 size={16} className="text-[#0c213e]/60" />}
            label="Lab"
            value={test.labId.name}
          />
          <InfoRow
            icon={<MapPin size={16} className="text-[#0c213e]/60" />}
            label="Location"
            value={`${test.labId.city}${test.labId.address ? " · " + test.labId.address : ""}`}
          />
          {hasDate ? (
            <>
              <InfoRow
                icon={<Calendar size={16} className="text-[#0c213e]/60" />}
                label="Appointment Date"
                value={formatDate(test.bookedAt!)}
              />
              <InfoRow
                icon={<Clock size={16} className="text-[#0c213e]/60" />}
                label="Appointment Time"
                value={formatTime(test.bookedAt!)}
              />
            </>
          ) : (
            <InfoRow
              icon={<Calendar size={16} className="text-[#0c213e]/60" />}
              label="Appointment"
              value="Not available"
            />
          )}
        </div>

        {test.reportUrl && (
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2">
            <FileText size={15} className="text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-2">
              Report
            </span>
            <a
              href={test.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c213e] hover:bg-[#132d54] text-white text-sm font-semibold rounded-xl transition-colors duration-150"
            >
              <FileText size={15} />
              View Report
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Package Booking Card (always expanded) ────────────────────────────────────

const PackageCard: React.FC<{ booking: PackageBookingItem }> = ({ booking }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    {/* Card header strip */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/60">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#0c213e] rounded-xl flex items-center justify-center flex-shrink-0">
          <Package size={20} className="text-[#a8c4e0]" />
        </div>
        <div>
          <p className="text-lg font-bold text-[#0c213e]">{booking.packageId.packageName}</p>
          <p className="text-md text-gray-400 mt-0.5">{booking.labId.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-base font-bold text-[#0c213e]">
          ₹{booking.packageId.totalPrice.toLocaleString()}
        </span>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${statusStyle(booking.status)}`}>
          {booking.status}
        </span>
      </div>
    </div>

    {/* Card body — always visible */}
    <div className="p-6">
      {booking.packageId.description && (
        <p className="text-base text-gray-500 mb-6 leading-relaxed">
          {booking.packageId.description}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        <InfoRow
          icon={<Building2 size={16} className="text-[#0c213e]/60" />}
          label="Lab"
          value={booking.labId.name}
        />
        <InfoRow
          icon={<MapPin size={16} className="text-[#0c213e]/60" />}
          label="Location"
          value={`${booking.labId.city}${booking.labId.address ? " · " + booking.labId.address : ""}`}
        />
        <InfoRow
          icon={<Calendar size={16} className="text-[#0c213e]/60" />}
          label="Booking Date"
          value={formatDate(booking.bookingDate)}
        />
        <InfoRow
          icon={<Package size={16} className="text-[#0c213e]/60" />}
          label="Total Price"
          value={`₹${booking.packageId.totalPrice.toLocaleString()}`}
        />
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

function LabTestInUser() {
  const { user } = useContext(AuthContext);

  const [labTests, setLabTests] = useState<LabTestItem[]>([]);
  const [packageBookings, setPackageBookings] = useState<PackageBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tests" | "packages">("tests");

  const [labPage, setLabPage] = useState(1);
  const [packagePage, setPackagePage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [labRes, packageRes] = await Promise.all([
          getUserLabTests(user.id),
          getPatientPackageBookings(user.id),
        ]);
        setLabTests(labRes.data.labTests || []);
        setPackageBookings(packageRes.data.bookings || []);
      } catch (err) {
        console.log("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const totalLabPages = Math.max(1, Math.ceil(labTests.length / itemsPerPage));
  const totalPackagePages = Math.max(1, Math.ceil(packageBookings.length / itemsPerPage));

  const currentLabTests = labTests.slice(
    (labPage - 1) * itemsPerPage,
    labPage * itemsPerPage
  );
  const currentPackages = packageBookings.slice(
    (packagePage - 1) * itemsPerPage,
    packagePage * itemsPerPage
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#0c213e]/20 border-t-[#0c213e] rounded-full animate-spin" />
          <p className="text-base text-gray-400 font-medium">Loading your records…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-[#0c213e] rounded-2xl flex items-center justify-center flex-shrink-0">
              <FlaskConical size={26} className="text-[#a8c4e0]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#0c213e] leading-tight">
                My Lab Records
              </h1>
              <p className="text-md text-gray-400 mt-0.5">
                View your booked tests and health packages
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0c213e]/8 text-[#0c213e] text-xs font-semibold">
                  <FlaskConical size={12} /> {labTests.length} Test{labTests.length !== 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                  <Package size={12} /> {packageBookings.length} Package{packageBookings.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("tests")}
              className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "tests"
                  ? "bg-[#0c213e] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FlaskConical size={17} />
              Lab Tests
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "tests"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {labTests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("packages")}
              className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "packages"
                  ? "bg-[#0c213e] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Package size={17} />
              Package Bookings
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "packages"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {packageBookings.length}
              </span>
            </button>
          </div>
        </div>

        {/* ── Lab Tests Tab ────────────────────────────────────────────────── */}
        {activeTab === "tests" && (
          <>
            {labTests.length === 0 ? (
              <EmptyState
                icon={<FlaskConical size={30} className="text-gray-200" />}
                title="No lab tests found"
                subtitle="Your booked lab tests will appear here"
              />
            ) : (
              <>
                <div className="space-y-4">
                  {currentLabTests.map((test) => (
                    <LabTestCard key={test._id} test={test} />
                  ))}
                </div>
                {totalLabPages > 1 && (
                  <Pagination
                    page={labPage}
                    totalPages={totalLabPages}
                    onPrev={() => setLabPage((p) => p - 1)}
                    onNext={() => setLabPage((p) => p + 1)}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ── Package Bookings Tab ─────────────────────────────────────────── */}
        {activeTab === "packages" && (
          <>
            {packageBookings.length === 0 ? (
              <EmptyState
                icon={<Package size={30} className="text-gray-200" />}
                title="No package bookings found"
                subtitle="Your booked health packages will appear here"
              />
            ) : (
              <>
                <div className="space-y-4">
                  {currentPackages.map((booking) => (
                    <PackageCard key={booking._id} booking={booking} />
                  ))}
                </div>
                {totalPackagePages > 1 && (
                  <Pagination
                    page={packagePage}
                    totalPages={totalPackagePages}
                    onPrev={() => setPackagePage((p) => p - 1)}
                    onNext={() => setPackagePage((p) => p + 1)}
                  />
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default LabTestInUser;