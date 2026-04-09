// Utility functions for emergency contacts

export const emergencyContactUtils = {
  // Format phone number for display
  formatPhoneNumber: (phone) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleaned.length === 12) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    }
    
    return phone;
  },

  // Validate phone number
  validatePhoneNumber: (phone) => {
    if (!phone) return false;
    
    const cleaned = phone.replace(/\D/g, '');
    
    // Sri Lankan phone numbers: 10 digits (mobile) or landline with area code
    const sriLankanRegex = /^(\+94|0)?[1-9]\d{8}$/;
    
    return sriLankanRegex.test(cleaned);
  },

  // Generate avatar initials from name
  generateAvatar: (name) => {
    if (!name) return '??';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    } else {
      return name.substring(0, 2).toUpperCase();
    }
  },

  // Get category color classes
  getCategoryColors: (category) => {
    const colors = {
      personal: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
        gradient: 'from-blue-500 to-blue-600'
      },
      medical: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200',
        gradient: 'from-red-500 to-red-600'
      },
      work: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
        gradient: 'from-purple-500 to-purple-600'
      },
      family: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
        gradient: 'from-green-500 to-green-600'
      }
    };
    
    return colors[category] || colors.personal;
  },

  // Sort contacts by priority
  sortContacts: (contacts, sortBy = 'name') => {
    const sorted = [...contacts];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'primary':
        return sorted.sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return a.name.localeCompare(b.name);
        });
      case 'category':
        return sorted.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.lastContact || 0);
          const dateB = new Date(b.lastContact || 0);
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  },

  // Filter contacts by search term and category
  filterContacts: (contacts, searchTerm, category) => {
    return contacts.filter(contact => {
      const matchesSearch = !searchTerm || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !category || category === 'all' || contact.category === category;
      
      return matchesSearch && matchesCategory;
    });
  },

  // Export contacts to CSV
  exportToCSV: (contacts) => {
    const headers = ['Name', 'Phone', 'Email', 'Relationship', 'Category', 'Address', 'Notes', 'Primary'];
    const rows = contacts.map(contact => [
      contact.name,
      contact.phone,
      contact.email || '',
      contact.relationship,
      contact.category,
      contact.address || '',
      contact.notes || '',
      contact.isPrimary ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  },

  // Import contacts from CSV
  importFromCSV: (csvText) => {
    const lines = csvText.split('\n');
    const contacts = [];
    
    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (simple implementation)
      const values = line.split(',').map(val => val.replace(/"/g, '').trim());
      
      if (values.length >= 3) {
        contacts.push({
          name: values[0] || '',
          phone: values[1] || '',
          email: values[2] || '',
          relationship: values[3] || '',
          category: values[4] || 'personal',
          address: values[5] || '',
          notes: values[6] || '',
          isPrimary: values[7] === 'Yes'
        });
      }
    }
    
    return contacts;
  },

  // Validate contact data
  validateContact: (contact) => {
    const errors = {};
    
    if (!contact.name || contact.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    
    if (!contact.phone) {
      errors.phone = 'Phone number is required';
    } else if (!emergencyContactUtils.validatePhoneNumber(contact.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!contact.relationship || contact.relationship.trim().length < 2) {
      errors.relationship = 'Relationship is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Get contact statistics
  getStatistics: (contacts) => {
    const stats = {
      total: contacts.length,
      primary: contacts.filter(c => c.isPrimary).length,
      byCategory: {},
      withEmail: contacts.filter(c => c.email).length,
      withAddress: contacts.filter(c => c.address).length,
      recentContacts: contacts.filter(c => {
        if (!c.lastContact) return false;
        const contactDate = new Date(c.lastContact);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return contactDate > weekAgo;
      }).length
    };
    
    contacts.forEach(contact => {
      stats.byCategory[contact.category] = (stats.byCategory[contact.category] || 0) + 1;
    });
    
    return stats;
  },

  // Generate emergency message template
  generateEmergencyMessage: (contact, emergencyType = 'general') => {
    const templates = {
      medical: `EMERGENCY - Medical assistance needed. This is ${contact.name}. I need immediate medical help. Please call me back ASAP.`,
      accident: `EMERGENCY - Accident occurred. This is ${contact.name}. I've been in an accident and need help. Location: [Your Location]. Please call emergency services.`,
      general: `EMERGENCY - I need help. This is ${contact.name}. Please call me back immediately.`,
      lost: `EMERGENCY - I'm lost and need help. This is ${contact.name}. Please help me find my way. Last known location: [Your Location].`
    };
    
    return templates[emergencyType] || templates.general;
  },

  // Calculate distance between two coordinates (in km)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  },

  // Find nearest contacts
  findNearestContacts: (contacts, userLat, userLon, maxDistance = 50) => {
    return contacts
      .filter(contact => contact.latitude && contact.longitude)
      .map(contact => ({
        ...contact,
        distance: emergencyContactUtils.calculateDistance(
          userLat, userLon, 
          contact.latitude, contact.longitude
        )
      }))
      .filter(contact => contact.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  },

  // Format last contact time
  formatLastContact: (lastContact) => {
    if (!lastContact) return 'Never';
    
    const date = new Date(lastContact);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
};

export default emergencyContactUtils;
