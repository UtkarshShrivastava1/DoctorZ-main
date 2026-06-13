import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  User,
  CalendarDays,
  FilePlus2,
  FileText,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../Context/AuthContext";
import UserIcon from "../../assets/Icon2.png";

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const token = Cookies.get("patientToken");

  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Auth check
  useEffect(() => {
    if (!token) {
      navigate("/patient-login");
      return;
    }
    try {
      jwtDecode(token);
    } catch (err) {
      console.log(err);
      Cookies.remove("patientToken");
      navigate("/patient-login");
    }
  }, [token, navigate]);

  // Default redirect to profile
  useEffect(() => {
    const base = `/user-dashboard/${user?.id}`;
    if (location.pathname === base) {
      navigate("user-profile", { replace: true });
    }
  }, [location.pathname, user, navigate]);

  // Resize handling
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop always keeps sidebar open
  useEffect(() => {
    if (isDesktop) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [isDesktop]);

  const handleLogout = () => {
    Cookies.remove("patientToken");
    navigate("/patient-login");
  };

  const menuItems = [
    {
      name: "My Profile",
      path: "user-profile",
      icon: User,
    },
    {
      name: "Appointments",
      path: "appointments",
      icon: CalendarDays,
    },
    {
      name: "EMR",
      path: "add-emr",
      icon: FilePlus2,
    },
    {
      name: "My Prescriptions",
      path: "prescription",
      icon: FileText,
    },
    {
      name: "Lab Test",
      path: `lab-test/${user?.id}`,
      icon: FilePlus2,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0c213e] rounded-lg flex items-center justify-center overflow-hidden">
            <img src={UserIcon} alt="User" className="w-8 h-8 object-cover" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900">
              {user?.name || "User Dashboard"}
            </h1>
            {user?.email && (
              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Backdrop */}
      {!isDesktop && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-gray-200
          fixed md:relative
          left-0
          z-40
          w-72 h-[calc(100vh-57px)] md:h-full
          transform transition-all duration-300 ease-in-out
          top-[57px] md:top-0
          flex flex-col
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header / User info – desktop only */}
        <div className="hidden bg-[#0c213e] text-white md:flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <img
            src={UserIcon}
            className="w-10 h-10 rounded-full object-cover shadow-md"
            alt="User avatar"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {user?.name || "User"}
            </h2>
            {user?.email && (
              <p className="text-xs text-gray-300 truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              const Icon = item.icon;

              const targetPath =
                item.path.startsWith("lab-test")
                  ? `/user-dashboard/${user?.id}/${item.path}`
                  : `/user-dashboard/${user?.id}/${item.path}`;

              return (
                <NavLink
                  key={item.path}
                  to={targetPath}
                  onClick={() => !isDesktop && setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group
                    ${
                      isActive
                        ? "bg-[#0c213e] text-white shadow-lg shadow-[#0c213e]/20"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-all text-red-600 w-full group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-[57px] md:pt-0 bg-gray-50" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
