import React from 'react';
import { AlertTriangle, Shield, Heart, Phone } from 'lucide-react';

const RecentNotifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'warning',
      icon: AlertTriangle,
      title: 'Heavy Rainfall Warning',
      description: 'Severe thunderstorm expected in your area within 2 hours',
      time: '25 min ago',
      priority: 'High Priority',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverColor: 'hover:bg-red-100',
      iconBg: 'bg-red-500',
      titleColor: 'text-red-800',
      descriptionColor: 'text-red-600',
      timeColor: 'text-red-500',
      priorityBg: 'bg-red-200',
      priorityColor: 'text-red-800'
    },
    {
      id: 2,
      type: 'info',
      icon: Shield,
      title: 'Shelter Capacity Update',
      description: 'Colombo Central Safe Center now at 85% capacity',
      time: '1 hour ago',
      priority: 'Medium Priority',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:bg-amber-100',
      iconBg: 'bg-amber-500',
      titleColor: 'text-amber-800',
      descriptionColor: 'text-amber-600',
      timeColor: 'text-amber-500',
      priorityBg: 'bg-amber-200',
      priorityColor: 'text-amber-800'
    },
    {
      id: 3,
      type: 'reminder',
      icon: Heart,
      title: 'Emergency Supplies Reminder',
      description: 'Check your emergency kit - water and supplies may need replenishing',
      time: '2 hours ago',
      priority: 'Low Priority',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      iconBg: 'bg-blue-500',
      titleColor: 'text-blue-800',
      descriptionColor: 'text-blue-600',
      timeColor: 'text-blue-500',
      priorityBg: 'bg-blue-200',
      priorityColor: 'text-blue-800'
    },
    {
      id: 4,
      type: 'success',
      icon: Phone,
      title: 'Emergency Contact Verified',
      description: 'Your emergency contact number has been successfully verified',
      time: '3 hours ago',
      priority: 'Information',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      iconBg: 'bg-green-500',
      titleColor: 'text-green-800',
      descriptionColor: 'text-green-600',
      timeColor: 'text-green-500',
      priorityBg: 'bg-green-200',
      priorityColor: 'text-green-800'
    }
  ];

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const Icon = notification.icon;
        return (
          <div
            key={notification.id}
            className={`p-4 rounded-2xl border ${notification.borderColor} ${notification.bgColor} ${notification.hoverColor} transition-colors cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${notification.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${notification.titleColor} mb-1`}>
                  {notification.title}
                </h4>
                <p className={`text-sm ${notification.descriptionColor} mb-2`}>
                  {notification.description}
                </p>
                <div className={`flex items-center gap-2 text-xs ${notification.timeColor}`}>
                  <span>{notification.time}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 ${notification.priorityBg} rounded-full ${notification.priorityColor} font-medium`}>
                    {notification.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentNotifications;
