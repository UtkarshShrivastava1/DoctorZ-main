import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Phone, Star } from "lucide-react";
import api from "../../Services/mainApi";

interface Doctor {
  _id: string;
  fullName: string;
  gender: string;
  MobileNo: string;
  specialization: string;
}

interface DoctorWithBooking {
  doctor: Doctor;
  bookingDate: string;
  roomId: string;
}

interface DoctorApiResponse {
  data: DoctorWithBooking[];
}

const PatientAppointments: React.FC = () => {
  const navigate = useNavigate();
  const patientId = useParams().id;

  const [doctors, setDoctors] = useState<DoctorWithBooking[]>([]);
  
  // 🔹 Review modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get<DoctorApiResponse>(`/api/patient/appointments/doctors/${patientId}`);
        setDoctors(res.data.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, [patientId]);

  // 🔥 Submit review
  const handleSubmitReview = async () => {
    if (!feedback.trim()) return alert("Please enter feedback!");

    try {
      await api.post(`/api/doctor/review/${selectedDoctorId}`, {
        userId: patientId,
        comment: feedback,
      });

      alert("Review Added Successfully!");
      setShowModal(false);
      setFeedback("");
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="w-full p-5 font-[Poppins]">
      <h2 className="text-2xl font-bold mb-4">Doctors List</h2>

      {doctors.length === 0 ? (
        <p className="text-gray-500">No Pending appointments.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left bg-white border shadow-md rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Gender</th>
                <th className="px-4 py-2">Specialization</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(({ doctor, bookingDate, roomId }) => (
                <tr key={doctor._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <UserCircleIcon className="w-6 h-6 text-gray-500" />
                    Dr. {doctor.fullName}
                  </td>

                  <td className="px-4 py-2">{doctor.gender}</td>
                  <td className="px-4 py-2">{doctor.specialization}</td>
                  <td className="px-4 py-2 flex gap-2 items-center">
                    <Phone size={18} />
                    {doctor.MobileNo}
                  </td>

                  <td className="px-4 py-2">
                    {new Date(bookingDate).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-4 py-2 flex gap-2">
                    <a href={`tel:${doctor.MobileNo}`} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                      Call
                    </a>
                    <button onClick={() => navigate(`/doctor-chat/${roomId}`)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                      Chat
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoctorId(doctor._id);
                        setShowModal(true);
                      }}
                      className="px-3 py-1.5 bg-purple-500 text-white rounded-lg transition-all duration-300 flex items-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                    >
                      <Star size={16} />
                      Add Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div 
          className="fixed inset-0 flex justify-center items-center z-50 animate-fadeIn"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white p-6 rounded-2xl w-96 shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              {/* <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Star className="text-white" size={24} />
              </div> */}
              <h3 className="text-xl font-bold">Write a Review</h3>
            </div>

            <textarea
              className="w-full h-32 border-2 border-gray-200 p-3 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience with the doctor..."
            />

            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReview} 
                className="px-4 py-2 text-white bg-[#0c213e] rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PatientAppointments;