import React from "react";
import { MapPin, Calendar, Phone, User } from "lucide-react";

const statusColors = {
  missing: "bg-red-100 text-red-600",
  found: "bg-green-100 text-green-600",
  investigating: "bg-yellow-100 text-yellow-700",
};

const MissingPersonCard = ({ person, onView, onEdit, onDelete, onFound, isOwner }) => {
  const status = person.status || "missing";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Photo */}
      <div className="relative h-48 bg-gray-100">
        {person.photo || person.image ? (
          <img
            src={person.photo || person.image}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={48} className="text-gray-300" />
          </div>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status]}`}>
          {status}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-gray-800 text-lg truncate">{person.name}</h3>

        {person.age && (
          <p className="text-sm text-gray-500">Age: {person.age} • {person.gender || "N/A"}</p>
        )}

        <div className="flex items-start gap-1.5 text-sm text-gray-500">
          <MapPin size={14} className="mt-0.5 shrink-0 text-red-400" />
          <span className="truncate">{person.lastSeenLocation}</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar size={14} className="text-red-400" />
          <span>{new Date(person.lastSeenDate).toLocaleDateString()}</span>
        </div>

        {person.contactInfo?.phone && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Phone size={14} className="text-red-400" />
            <span>{person.contactInfo.phone}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => onView(person)}
          className="flex-1 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition"
        >
          View Details
        </button>
        {isOwner && status !== "found" && (
          <>
            <button
              onClick={() => onFound(person._id)}
              className="py-1.5 px-3 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition"
            >
              Mark Found
            </button>
            <button
              onClick={() => onEdit(person)}
              className="py-1.5 px-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(person._id)}
              className="py-1.5 px-3 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MissingPersonCard;