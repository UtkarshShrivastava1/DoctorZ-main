import React, { useEffect, useState } from "react";
import {
  UserGroupIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  UserIcon,
  PlusCircleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import {
  ChartBarIcon,
  UserPlusIcon,
  UsersIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const ClinicHomeDashboard = () => {
  const [dateTime, setDateTime] = useState("");
  // const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredCTA, setHoveredCTA] = useState<number | null>(null);

  // Mock data
  const clinic = {
    clinicName: "HealthCare Plus Clinic",
    email: "contact@healthcareplus.com",
  };

  const clinicStats = {
    totalDoctors: 12,
    totalDepartments: 8,
    activePatients: 247,
    weeklyRevenue: "₹1,45,000",
    todayAppointments: 18,
    completedToday: 12,
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      setDateTime(formatted);
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const statsCards = [
    {
      title: "Total Doctors",
      value: clinicStats.totalDoctors,
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: "#00D09C",
      bgColor: "bg-emerald-50",
      change: "+2 this month",
    },
    {
      title: "Active Patients",
      value: clinicStats.activePatients,
      icon: <UsersIcon className="w-8 h-8" />,
      color: "#3B82F6",
      bgColor: "bg-blue-50",
      change: "+15 this week",
    },
    {
      title: "Departments",
      value: clinicStats.totalDepartments,
      icon: <ChartBarIcon className="w-8 h-8" />,
      color: "#8B5CF6",
      bgColor: "bg-purple-50",
      change: "All active",
    },
    {
      title: "Weekly Revenue",
      value: clinicStats.weeklyRevenue,
      icon: <CurrencyRupeeIcon className="w-8 h-8" />,
      color: "#F59E0B",
      bgColor: "bg-amber-50",
      change: "+12% from last week",
    },
  ];

  const quickActions = [
    {
      title: "Add New Doctor",
      description: "Register a new doctor to your clinic",
      icon: <UserPlusIcon className="w-6 h-6" />,
      color: "#00D09C",
      path: "/add-doctor",
    },
    {
      title: "View All Patients",
      description: "Access complete patient records",
      icon: <UsersIcon className="w-6 h-6" />,
      color: "#3B82F6",
      path: "/all-clinic-patients",
    },
    {
      title: "Doctor Profiles",
      description: "Manage your doctor team",
      icon: <UserGroupIcon className="w-6 h-6" />,
      color: "#8B5CF6",
      path: "/all-clinic-doctors",
    },
  ];

  const todayStats = [
    {
      label: "Today's Appointments",
      value: clinicStats.todayAppointments,
      icon: <CalendarDaysIcon className="w-5 h-5 text-blue-600" />,
    },
    {
      label: "Completed",
      value: clinicStats.completedToday,
      icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
    },
    {
      label: "Remaining",
      value: clinicStats.todayAppointments - clinicStats.completedToday,
      icon: <ClockIcon className="w-5 h-5 text-amber-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#0c213e] px-6 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome back, {clinic.clinicName}
                </h1>
                <div className="flex items-center gap-2 text-gray-300">
                  <ClockIcon className="w-4 h-4" />
                  <p className="text-sm">{dateTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Quick Stats */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              {todayStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsCards.map((card, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer ${
                hoveredCard === idx ? "shadow-lg scale-105 -translate-y-1" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`${card.bgColor} p-3 rounded-xl transition-transform duration-300 ${
                    hoveredCard === idx ? "scale-110 rotate-3" : ""
                  }`}
                >
                  <div style={{ color: card.color }}>{card.icon}</div>
                </div>
                <ArrowTrendingUpIcon 
                  className="w-5 h-5 text-green-500"
                  style={{
                    opacity: hoveredCard === idx ? 1 : 0,
                    transition: "opacity 0.3s"
                  }}
                />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {card.value}
              </p>
              <p className="text-xs text-gray-500">{card.change}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-[#0c213e] to-transparent ml-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredCTA(idx)}
                onMouseLeave={() => setHoveredCTA(null)}
                className={`group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-100 transition-all duration-300 cursor-pointer ${
                  hoveredCTA === idx ? "border-[#0c213e] shadow-lg scale-105" : ""
                }`}
              >
                <div
                  className="absolute top-0 left-0 w-full h-1 rounded-t-xl transition-all duration-300"
                  style={{
                    backgroundColor: hoveredCTA === idx ? action.color : "transparent"
                  }}
                ></div>
                
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      hoveredCTA === idx ? "scale-110" : ""
                    }`}
                    style={{
                      backgroundColor: hoveredCTA === idx ? action.color : "#f3f4f6",
                      color: hoveredCTA === idx ? "white" : action.color,
                    }}
                  >
                    {action.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center justify-between">
                      {action.title}
                      <ArrowRightIcon 
                        className={`w-5 h-5 transition-all duration-300 ${
                          hoveredCTA === idx ? "translate-x-1 opacity-100" : "opacity-0"
                        }`}
                        style={{ color: action.color }}
                      />
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              System Status
            </h3>
            <div className="space-y-3">
              {[
                { label: "Server Status", status: "Operational", color: "green" },
                { label: "Database", status: "Healthy", color: "green" },
                { label: "API Services", status: "Running", color: "green" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      item.color === "green"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notices */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">📌</span>
              Important Notices
            </h3>
            <div className="space-y-3">
              {[
                { text: "System maintenance scheduled for Friday 10 PM", priority: "medium" },
                { text: "New patient portal features launched", priority: "low" },
                { text: "Staff training session on Monday 3 PM", priority: "high" },
              ].map((notice, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      notice.priority === "high"
                        ? "bg-red-500"
                        : notice.priority === "medium"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <p className="text-sm text-gray-700 flex-1">{notice.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicHomeDashboard;