import React, { useState } from 'react';
import {
  Phone, MessageCircle, Navigation, Edit2, Trash2, PhoneCall,
  UserCircle, Mail, MapPin, Star, Loader2, Clock
} from 'lucide-react';

const EmergencyContactCard = ({ 
  contact, 
  onCall, 
  onMessage, 
  onNavigate, 
  onEdit, 
  onDelete,
  callingContact,
  messageContact 
}) => {
  const [imageError, setImageError] = useState(false);

  const getCategoryColor = (category) => {
    const colors = {
      personal: 'blue',
      medical: 'red',
      work: 'purple',
      family: 'green'
    };
    return colors[category] || 'gray';
  };

  const categoryColor = getCategoryColor(contact.category);

  const handleCall = () => {
    if (onCall) onCall(contact);
  };

  const handleMessage = () => {
    if (onMessage) onMessage(contact);
  };

  const handleNavigate = () => {
    if (onNavigate && contact.address) onNavigate(contact);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(contact);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(contact);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:scale-105">
      {/* Header */}
      <div className={`bg-gradient-to-r from-${categoryColor}-500 to-${categoryColor}-600 p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              {contact.avatar ? (
                <span className="text-lg font-bold">{contact.avatar}</span>
              ) : (
                <UserCircle className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{contact.name}</h3>
              <p className="text-sm opacity-90">{contact.relationship}</p>
            </div>
          </div>
          {contact.isPrimary && (
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              PRIMARY
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Phone */}
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-${categoryColor}-100 rounded-lg flex items-center justify-center`}>
              <Phone className={`w-4 h-4 text-${categoryColor}-600`} />
            </div>
            <span className="text-gray-900 font-medium">{contact.phone}</span>
          </div>

          {/* Email */}
          {contact.email && (
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-${categoryColor}-100 rounded-lg flex items-center justify-center`}>
                <Mail className={`w-4 h-4 text-${categoryColor}-600`} />
              </div>
              <span className="text-gray-900 text-sm">{contact.email}</span>
            </div>
          )}

          {/* Address */}
          {contact.address && (
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-${categoryColor}-100 rounded-lg flex items-center justify-center`}>
                <MapPin className={`w-4 h-4 text-${categoryColor}-600`} />
              </div>
              <span className="text-gray-900 text-sm">{contact.address}</span>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-600 text-sm">{contact.notes}</p>
            </div>
          )}

          {/* Last Contact */}
          {contact.lastContact && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Last contact: {new Date(contact.lastContact).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex space-x-2">
            {/* Call Button */}
            <button
              onClick={handleCall}
              disabled={callingContact?.id === contact.id}
              className={`p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Call"
            >
              {callingContact?.id === contact.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PhoneCall className="w-4 h-4" />
              )}
            </button>

            {/* Message Button */}
            <button
              onClick={handleMessage}
              disabled={messageContact?.id === contact.id}
              className={`p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Send Message"
            >
              {messageContact?.id === contact.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
            </button>

            {/* Navigate Button */}
            {contact.address && (
              <button
                onClick={handleNavigate}
                className={`p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all duration-200`}
                title="Navigate"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Edit/Delete Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactCard;
