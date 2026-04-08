import React, { useState } from "react";
import { MapPin, Calendar, Phone, User, X } from "lucide-react";
import { useMissingPerson } from "../../contexts/MissingPersonContext";

const MissingPersonDetailModal = ({ person, onClose }) => {
  const { submitSighting } = useMissingPerson();
  const [sighting, setSighting] = useState({ location: "", description: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSighting = async (e) => {
    e.preventDefault();
    try {
      await submitSighting(person._id, sighting);
      setSubmitted(true);
    } catch {
      // error handled in context
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Missing Person Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Photo */}
          {(person.photo || person.image) && (
            <img
              src={person.photo || person.image}
              alt={person.name}
              className="w-full h-56 object-cover rounded-xl"
            />
          )}

          {/* Core Info */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">{person.name}</h3>
            {person.age && (
              <p className="text-gray-500 text-sm">Age: {person.age} • Gender: {person.gender || "N/A"}</p>
            )}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize
              ${person.status === "found" ? "bg-green-100 text-green-600" :
                person.status === "investigating" ? "bg-yellow-100 text-yellow-600" :
                "bg-red-100 text-red-600"}`}>
              {person.status || "missing"}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Last Seen Location</p>
                <p>{person.lastSeenLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Calendar size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Last Seen Date</p>
                <p>{new Date(person.lastSeenDate).toLocaleDateString("en-LK", { dateStyle: "long" })}</p>
              </div>
            </div>
            {person.contactInfo?.phone && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Contact</p>
                  <p>{person.contactInfo.name} — {person.contactInfo.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {person.description && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{person.description}</p>
            </div>
          )}

          {/* Sightings */}
          {person.sightings?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Reported Sightings</h4>
              <div className="space-y-2">
                {person.sightings.map((s, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                    <p className="font-medium">{s.location}</p>
                    <p className="text-blue-600">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Sighting Form */}
          {person.status !== "found" && (
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Report a Sighting</h4>
              {submitted ? (
                <div className="bg-green-50 text-green-600 rounded-lg px-4 py-3 text-sm">
                  ✓ Thank you! Your sighting has been reported.
                </div>
              ) : (
                <form onSubmit={handleSighting} className="space-y-3">
                  <input
                    value={sighting.location}
                    onChange={(e) => setSighting((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Where did you see them?"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <textarea
                    value={sighting.description}
                    onChange={(e) => setSighting((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What were they wearing? Any other details?"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
                  >
                    Submit Sighting
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissingPersonDetailModal;