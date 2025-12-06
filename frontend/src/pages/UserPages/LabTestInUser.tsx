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


import  { useEffect, useState, useContext } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, FileText, MapPin, Building2 } from "lucide-react";
import { getUserLabTests } from "../../Services/getLabTest";
import { AuthContext } from "../../Context/AuthContext";

export interface LabTestItem {
  labId: { name: string; city: string; address: string };
  _id: string;
  testName: string;
  status: string;
  doctorId?: { fullName: string; MobileNo: string };
  bookedAt?: string;
  reportUrl?: string;
}

function LabTestInUser() {
  const [labTests, setLabTests] = useState<LabTestItem[]>([]);
  const { user } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    if (!user?.id) return;

    const fetchLabTests = async () => {
      try {
        const res = await getUserLabTests(user.id);
        setLabTests(res.data.labTests);
        console.log("Lab Tests API Response:", res.data.labTests);
      } catch (err) {
        console.log("Error fetching lab tests:", err);
      }
    };

    fetchLabTests();
  }, [user]);

  const totalPages = Math.ceil(labTests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTests = labTests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#08172c' }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Lab Tests</h1>
          <div className="h-1 w-24 bg-white rounded-full"></div>
          {labTests.length > 0 && (
            <p className="text-gray-300 mt-3">
              Total Tests: <span className="font-semibold text-white">{labTests.length}</span>
            </p>
          )}
        </div>

        {labTests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">No lab tests found.</p>
            <p className="text-gray-400 text-sm mt-2">Your lab test history will appear here.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentTests.map((test) => (
                <div
                  key={test._id}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #08172c 0%, #0a1f3d 100%)' }}>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {test.testName}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{test.labId.name}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Lab Information */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-2 rounded-lg" style={{ backgroundColor: '#08172c' }}>
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Location
                            </p>
                            <p className="text-gray-800 font-medium">
                              {test.labId.city}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {test.labId.address}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Appointment Information */}
                      <div className="space-y-4">
                        {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-2 rounded-lg" style={{ backgroundColor: '#08172c' }}>
                                <Calendar className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                  Appointment Date
                                </p>
                                <p className="text-gray-800 font-medium">
                                  {new Date(test.bookedAt).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-2 rounded-lg" style={{ backgroundColor: '#08172c' }}>
                                <Clock className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                  Appointment Time
                                </p>
                                <p className="text-gray-800 font-medium">
                                  {new Date(test.bookedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-lg bg-gray-100">
                              <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Appointment Date
                              </p>
                              <p className="text-gray-500 italic">Not Available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Report Button */}
                    {test.reportUrl && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <a
                          href={test.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                          style={{ backgroundColor: '#08172c' }}
                        >
                          <FileText className="w-5 h-5" />
                          View Report
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  disabled={currentPage === 1 || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#08172c' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="px-6 py-3 bg-white rounded-xl shadow-lg">
                  <span className="font-bold" style={{ color: '#08172c' }}>
                    Page {currentPage} of {totalPages || 1}
                  </span>
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#08172c' }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LabTestInUser;
