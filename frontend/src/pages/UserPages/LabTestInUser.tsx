// import React, { useEffect, useState, useContext } from "react";
// // import { useParams } from "react-router-dom";
// import { getUserLabTests } from "../../Services/getLabTest";
// import { AuthContext } from "../../Context/AuthContext";

// export interface LabTestItem {
//   labId: { name: string; city: string; address: string };
//   _id: string;
//   testName: string;
//   status: string;
//   doctorId?: { fullName: string; MobileNo: string };
//   bookedAt?: string;
//   reportUrl?: string;
// }

// function LabTestInUser() {
//   const [labTests, setLabTests] = useState<LabTestItem[]>([]);
//   const { user } = useContext(AuthContext); // or from context

//   useEffect(() => {
//     if (!user?.id) return;

//     const fetchLabTests = async () => {
//       try {
//         const res = await getUserLabTests(user.id);
//         setLabTests(res.data.labTests);
//         console.log("Lab Tests API Response:", res.data.labTests);
//       } catch (err) {
//         console.log("Error fetching lab tests:", err);
//       }
//     };

//     fetchLabTests();
//   }, [user]);

//   // return (
//   //   <div className="p-4">
//   //     <h1 className="text-xl font-semibold mb-4">Lab Test</h1>

//   //     {labTests.length === 0 ? (
//   //       <p>No lab tests found.</p>
//   //     ) : (
//   //       <div className="space-y-3">
//   //         {labTests.map((test) => (
//   //           <div
//   //             key={test._id}
//   //             className="border p-3 rounded-lg shadow-sm bg-white"
//   //           >
//   //             <p>
//   //               <strong>Test Name:</strong> {test.testName}
//   //             </p>
//   //             {/* <p><strong>Status:</strong> {test.status}</p> */}
//   //             <p>
//   //               <strong>Lab:</strong> {test.labId.name}
//   //             </p>

//   //             {/* {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
//   //               <p>
//   //                 <strong>Appointment Date:</strong>{" "}
//   //                 {new Date(test.bookedAt).toLocaleString()}
//   //               </p>
//   //             ) : (
//   //               <p>Appointment Date: Not Available</p>
//   //             )} */}

//   //             {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
//   //               <div>
//   //                 <p>
//   //                   <strong>Appointment Date:</strong>{" "}
//   //                   {new Date(test.bookedAt).toLocaleDateString()}
//   //                 </p>
//   //                 <p>
//   //                   <strong>Appointment Time:</strong>{" "}
//   //                   {new Date(test.bookedAt).toLocaleTimeString([], {
//   //                     hour: "2-digit",
//   //                     minute: "2-digit",
//   //                   })}
//   //                 </p>
//   //               </div>
//   //             ) : (
//   //               <p>Appointment Date: Not Available</p>
//   //             )}

//   //             {/* {test.reportUrl && (
//   //               <a
//   //                 href={test.reportUrl}
//   //                 target="_blank"
//   //                 rel="noopener noreferrer"
//   //                 className="text-blue-600 underline"
//   //               >
//   //                 View Report
//   //               </a>
//   //             )} */}
//   //           </div>
//   //         ))}
//   //       </div>
//   //     )}
//   //   </div>
//   // );

//   return (
//   <div className="p-6">
//     <h1 className="text-2xl font-semibold mb-6">My Lab Tests</h1>

//     {labTests.length === 0 ? (
//       <p className="text-gray-500">No lab tests found.</p>
//     ) : (
//       <div className="space-y-4">
//         {labTests.map((test) => (
//           <div
//             key={test._id}
//             className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
//           >
//             <p className="font-medium text-lg mb-1"> <strong>Test Name:</strong> {test.testName}</p>
//             <p className="text-gray-600 mb-1">
//               <strong>Lab:</strong> {test.labId.name}
//             </p>
//             {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
//               <div className="text-gray-600 mb-1">
//                 <p>
//                   <strong>Appointment Date:</strong>{" "}
//                   {new Date(test.bookedAt).toLocaleDateString()}
//                 </p>
//                 <p>
//                   <strong>Appointment Time:</strong>{" "}
//                   {new Date(test.bookedAt).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             ) : (
//               <p className="text-gray-500">Appointment Date: Not Available</p>
//             )}
//             {test.reportUrl && (
//               <a
//                 href={test.reportUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 underline mt-2 inline-block"
//               >
//                 View Report
//               </a>
//             )}
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// );


// }


// export default LabTestInUser;


// import  { useEffect, useState, useContext } from "react";
// import { ChevronLeft, ChevronRight, Calendar, Clock, FileText, MapPin, Building2 } from "lucide-react";
// import { getUserLabTests } from "../../Services/getLabTest";
// import { AuthContext } from "../../Context/AuthContext";

// export interface LabTestItem {
//   labId: { name: string; city: string; address: string };
//   _id: string;
//   testName: string;
//   status: string;
//   doctorId?: { fullName: string; MobileNo: string };
//   bookedAt?: string;
//   reportUrl?: string;
// }

// function LabTestInUser() {
//   const [labTests, setLabTests] = useState<LabTestItem[]>([]);
//   const { user } = useContext(AuthContext);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 2;

//   useEffect(() => {
//     if (!user?.id) return;

//     const fetchLabTests = async () => {
//       try {
//         const res = await getUserLabTests(user.id);
//         setLabTests(res.data.labTests);
//         console.log("Lab Tests API Response:", res.data.labTests);
//       } catch (err) {
//         console.log("Error fetching lab tests:", err);
//       }
//     };

//     fetchLabTests();
//   }, [user]);

//   const totalPages = Math.ceil(labTests.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentTests = labTests.slice(startIndex, startIndex + itemsPerPage);

//   return (
//     <div className="min-h-screen">
//       <div className="max-w-6xl mx-auto p-6">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-[#0c213e] mb-2 underline">My Lab Tests</h1>
//           <div className="h-1 w-24 bg-white rounded-full"></div>
//           {labTests.length > 0 && (
//             <p className="text-black mt-3">
//               Total Tests: <span className="font-semibold text-black">{labTests.length}</span>
//             </p>
//           )}
//         </div>

//         {labTests.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
//             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <FileText className="w-10 h-10 text-gray-400" />
//             </div>
//             <p className="text-gray-600 text-lg">No lab tests found.</p>
//             <p className="text-gray-400 text-sm mt-2">Your lab test history will appear here.</p>
//           </div>
//         ) : (
//           <>
//             <div className="space-y-6">
//               {currentTests.map((test) => (
//                 <div
//                   key={test._id}
//                   className="bg-white border-b rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
//                 >
//                   {/* Card Header */}
//                   <div className="p-6 border-b border-gray-100">
//                     <h2 className="text-2xl font-bold text-black mb-2">
//                       Test name: {test.testName}
//                     </h2>
//                     <div className="flex items-center gap-2 text-gray-300">
//                       <Building2 className="w-4 h-4 text-black" />
//                       <span className="text-sm text-black">Lab name: {test.labId.name}</span>
//                     </div>
//                   </div>

//                   {/* Card Body */}
//                   <div className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       {/* Lab Information */}
//                       <div className="space-y-4">
//                         <div className="flex items-start gap-3">
//                           <div className="mt-1 p-2 rounded-lg" style={{ backgroundColor: '#08172c' }}>
//                             <MapPin className="w-4 h-4 text-white" />
//                           </div>
//                           <div className="flex-1">
//                             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
//                               Location
//                             </p>
//                             <p className="text-gray-800 font-medium">
//                               {test.labId.city}
//                             </p>
//                             <p className="text-gray-600 text-sm mt-1">
//                               {test.labId.address}
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Appointment Information */}
//                       <div className="space-y-4">
//                         {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
//                           <>
//                             <div className="flex items-start gap-3">
//                               <div className="mt-1 p-2 rounded-lg" style={{ backgroundColor: '#08172c' }}>
//                                 <Calendar className="w-4 h-4 text-white" />
//                               </div>
//                               <div className="flex-1">
//                                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
//                                   Appointment Date
//                                 </p>
//                                 <p className="text-gray-800 font-medium">
//                                   {new Date(test.bookedAt).toLocaleDateString('en-US', {
//                                     weekday: 'short',
//                                     year: 'numeric',
//                                     month: 'long',
//                                     day: 'numeric'
//                                   })}
//                                 </p>
//                               </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                               <div className="mt-1 p-2 rounded-lg" style={{ backgroundColor: '#08172c' }}>
//                                 <Clock className="w-4 h-4 text-white" />
//                               </div>
//                               <div className="flex-1">
//                                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
//                                   Appointment Time
//                                 </p>
//                                 <p className="text-gray-800 font-medium">
//                                   {new Date(test.bookedAt).toLocaleTimeString([], {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                   })}
//                                 </p>
//                               </div>
//                             </div>
//                           </>
//                         ) : (
//                           <div className="flex items-start gap-3">
//                             <div className="mt-1 p-2 rounded-lg bg-gray-100">
//                               <Calendar className="w-4 h-4 text-gray-400" />
//                             </div>
//                             <div className="flex-1">
//                               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
//                                 Appointment Date
//                               </p>
//                               <p className="text-gray-500 italic">Not Available</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Report Button */}
//                     {test.reportUrl && (
//                       <div className="mt-6 pt-6 border-t border-gray-100">
//                         <a
//                           href={test.reportUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
//                           style={{ backgroundColor: '#08172c' }}
//                         >
//                           <FileText className="w-5 h-5" />
//                           View Report
//                         </a>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center gap-4 mt-8">
//                 <button
//                   disabled={currentPage === 1 || totalPages === 0}
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                   className="p-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
//                   style={{ backgroundColor: '#08172c' }}
//                 >
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>

//                 <div className="px-6 py-3 bg-white rounded-xl shadow-lg">
//                   <span className="font-bold" style={{ color: '#08172c' }}>
//                     Page {currentPage} of {totalPages || 1}
//                   </span>
//                 </div>

//                 <button
//                   disabled={currentPage === totalPages}
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                   className="p-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
//                   style={{ backgroundColor: '#08172c' }}
//                 >
//                   <ChevronRight className="w-5 h-5" />
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default LabTestInUser;

import { useEffect, useState, useContext } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Building2,
  Package
} from "lucide-react";
import { getUserLabTests, getPatientPackageBookings } from "../../Services/getLabTest";
// import { getPatientPackageBookings } from "../../Services/getPatientPackageBookings";
import { AuthContext } from "../../Context/AuthContext";

/* =========================
   Interfaces
========================= */

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

/* =========================
   Component
========================= */

function LabTestInUser() {
  const { user } = useContext(AuthContext);

  const [labTests, setLabTests] = useState<LabTestItem[]>([]);
  const [packageBookings, setPackageBookings] = useState<PackageBookingItem[]>([]);

  const [labPage, setLabPage] = useState(1);
  const [packagePage, setPackagePage] = useState(1);

  const itemsPerPage = 2;

  /* =========================
     Fetch Data
  ========================= */

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const labRes = await getUserLabTests(user.id);
        setLabTests(labRes.data.labTests || []);

        const packageRes = await getPatientPackageBookings(user.id);
        setPackageBookings(packageRes.data.bookings || []);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };

    fetchData();
  }, [user]);

  /* =========================
     Pagination
  ========================= */

  const totalLabPages = Math.ceil(labTests.length / itemsPerPage);
  const totalPackagePages = Math.ceil(packageBookings.length / itemsPerPage);

  const currentLabTests = labTests.slice(
    (labPage - 1) * itemsPerPage,
    labPage * itemsPerPage
  );

  const currentPackages = packageBookings.slice(
    (packagePage - 1) * itemsPerPage,
    packagePage * itemsPerPage
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">

        {/* ================= LAB TEST SECTION ================= */}

        <div className="mb-16">
          <h1 className="text-4xl font-bold text-[#0c213e] mb-4 underline">
            My Lab Tests
          </h1>

          {labTests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No lab tests found.</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {currentLabTests.map((test) => (
                  <div
                    key={test._id}
                    className="bg-white rounded-2xl shadow-xl p-6"
                  >
                    <h2 className="text-2xl font-bold mb-2">
                      {test.testName}
                    </h2>

                    <p className="text-gray-600 mb-2">
                      Status:{" "}
                      <span className="font-semibold capitalize">
                        {test.status}
                      </span>
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{test.labId.name}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4" />
                          <span>{test.labId.city}</span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {test.labId.address}
                        </p>
                      </div>

                      {test.bookedAt && (
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(test.bookedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(test.bookedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {test.reportUrl && (
                      <div className="mt-6">
                        <a
                          href={test.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2"
                          style={{ backgroundColor: "#08172c" }}
                        >
                          <FileText className="w-4 h-4" />
                          View Report
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalLabPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    disabled={labPage === 1}
                    onClick={() => setLabPage((p) => p - 1)}
                    className="p-3 rounded-xl text-white"
                    style={{ backgroundColor: "#08172c" }}
                  >
                    <ChevronLeft />
                  </button>

                  <span className="font-bold">
                    Page {labPage} of {totalLabPages}
                  </span>

                  <button
                    disabled={labPage === totalLabPages}
                    onClick={() => setLabPage((p) => p + 1)}
                    className="p-3 rounded-xl text-white"
                    style={{ backgroundColor: "#08172c" }}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ================= PACKAGE BOOKINGS SECTION ================= */}

        <div>
          <h1 className="text-4xl font-bold text-[#0c213e] mb-4 underline">
            My Package Bookings
          </h1>

          {packageBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No package bookings found.</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {currentPackages.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-2xl shadow-xl p-6"
                  >
                    <h2 className="text-2xl font-bold mb-2">
                      {booking.packageId.packageName}
                    </h2>

                    <p className="text-gray-600 mb-2">
                      ₹ {booking.packageId.totalPrice}
                    </p>

                    <p className="text-gray-600 text-sm mb-4">
                      {booking.packageId.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{booking.labId.name}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.labId.city}</span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {booking.labId.address}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(
                              booking.bookingDate
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="mt-2 text-gray-600">
                          Status:{" "}
                          <span className="font-semibold capitalize">
                            {booking.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPackagePages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    disabled={packagePage === 1}
                    onClick={() => setPackagePage((p) => p - 1)}
                    className="p-3 rounded-xl text-white"
                    style={{ backgroundColor: "#08172c" }}
                  >
                    <ChevronLeft />
                  </button>

                  <span className="font-bold">
                    Page {packagePage} of {totalPackagePages}
                  </span>

                  <button
                    disabled={packagePage === totalPackagePages}
                    onClick={() => setPackagePage((p) => p + 1)}
                    className="p-3 rounded-xl text-white"
                    style={{ backgroundColor: "#08172c" }}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default LabTestInUser;


