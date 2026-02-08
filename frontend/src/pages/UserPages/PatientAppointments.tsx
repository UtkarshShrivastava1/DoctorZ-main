import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Phone, Star } from "lucide-react";
import api from "../../Services/mainApi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";


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
  meetingLink:string;
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
  const [rating, setRating] = useState(0);
const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get<DoctorApiResponse>(`/api/patient/appointments/doctors/${patientId}`);
        console.log(res)
        setDoctors(res.data.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, [patientId]);

  // 🔥 Submit review
  const handleSubmitReview = async () => {
     if (rating === 0) {
    alert('Please select a rating');
    return;
  }
    // if (!feedback.trim()) return alert("Please enter feedback!");
    console.log({ rating, feedback });
    try {
      await api.post(`/api/doctor/review/${selectedDoctorId}`, {
        userId: patientId,
        comment: feedback,
        rating:rating,
      });

      // alert("Review Added Successfully!");
      toast.success(
              `Review Added Successfully!`
            );
      setShowModal(false);
      setFeedback("");
    } catch (error) {
      console.log(error);
      // alert("Something went wrong");
      toast.error(
              `Something went wrong`
            );
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
              {doctors.map(({ doctor, bookingDate, roomId,meetingLink }) => (
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
                    {/* <a href={`/${meetingLink}`} target="_blank" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                      Call
                    </a> */}
                    {/* <Link
  to={`${meetingLink}`}
  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
>
  Call
</Link> */}
                    {/* <button onClick={() => navigate(`${meetingLink}`)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                      Chat
                    </button> */}
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
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white p-8 rounded-xl w-[480px] shadow-xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-[#0c213e]">Share Your Experience</h3>
              <p className="text-sm text-gray-500 mt-1">Your feedback helps us improve our services</p>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-[#0c213e] mb-3 block">
                Rate Your Experience
              </label>
              <div className="flex gap-3 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={36}
                      className={`${
                        star <= (hoverRating || rating)
                          ? 'fill-[#0c213e] text-[#0c213e]'
                          : 'text-gray-300'
                      } transition-all duration-200`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-[#0c213e] mb-2 block">
                Additional Comments (Optional)
              </label>
              <textarea
                className="w-full h-28 border border-gray-300 p-3 rounded-lg focus:border-[#0c213e] focus:ring-2 focus:ring-[#0c213e] focus:ring-opacity-20 focus:outline-none transition-all resize-none text-gray-700 text-sm"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience with the doctor and the care you received..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setRating(0);
                  setFeedback('');
                }} 
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReview} 
                disabled={rating === 0}
                className="px-6 py-2.5 text-white bg-[#0c213e] rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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