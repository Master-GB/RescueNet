import React, { useState, useEffect } from 'react';
import { 
  Heart, AlertTriangle, Search, BookOpen, ArrowUp,
  Thermometer, Bandage, Menu, X
} from 'lucide-react';
import '../../styles/firstAidStyles.css';

const FirstAidGuidePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, focus
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [darkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  // Comprehensive first aid data
  const firstAidCategories = [
    {
      id: 'emergency',
      name: 'Emergency Response',
      icon: AlertTriangle,
      color: 'red',
      description: 'Critical emergency procedures',
      guides: [
        {
          id: 'cpr',
          title: 'CPR - Cardiopulmonary Resuscitation',
          duration: '5 min',
          difficulty: 'Advanced',
          rating: 4.9,
          views: 12500,
          description: 'Life-saving technique for cardiac emergencies',
          steps: [
            'Check responsiveness and breathing',
            'Call emergency services (119)',
            'Start chest compressions (30:2 ratio)',
            'Open airway and give rescue breaths',
            'Continue until help arrives or person recovers'
          ],
          warnings: ['Only perform if trained', 'Call for help immediately'],
          equipment: ['Face shield', 'AED if available'],
          videoUrl: '/videos/cpr-demo.mp4'
        },
        {
          id: 'choking',
          title: 'Choking - Heimlich Maneuver',
          duration: '3 min',
          difficulty: 'Intermediate',
          rating: 4.8,
          views: 8900,
          description: 'Help someone who is choking',
          steps: [
            'Ask "Are you choking?"',
            'Stand behind the person',
            'Make a fist above the navel',
            'Perform upward thrusts',
            'Continue until object is expelled'
          ],
          warnings: ['For conscious persons only', 'Call 119 if unsuccessful'],
          equipment: [],
          videoUrl: '/videos/choking-demo.mp4'
        }
      ]
    },
    {
      id: 'injuries',
      name: 'Common Injuries',
      icon: Bandage,
      color: 'blue',
      description: 'Treatment for everyday injuries',
      guides: [
        {
          id: 'cuts',
          title: 'Cuts and Scrapes',
          duration: '2 min',
          difficulty: 'Basic',
          rating: 4.7,
          views: 15600,
          description: 'Proper wound care and cleaning',
          steps: [
            'Wash hands thoroughly',
            'Clean the wound with water',
            'Apply antiseptic solution',
            'Cover with sterile bandage',
            'Monitor for signs of infection'
          ],
          warnings: ['Seek medical help for deep wounds'],
          equipment: ['Antiseptic', 'Bandages', 'Gloves'],
          videoUrl: '/videos/wound-care.mp4'
        },
        {
          id: 'burns',
          title: 'Burn Treatment',
          duration: '4 min',
          difficulty: 'Intermediate',
          rating: 4.8,
          views: 11200,
          description: 'First aid for burns and scalds',
          steps: [
            'Cool the burn with cool water',
            'Remove jewelry near the burn',
            'Cover with sterile dressing',
            'Take pain medication if needed',
            'Seek medical help for severe burns'
          ],
          warnings: ['Never use ice on burns', 'Don\'t break blisters'],
          equipment: ['Cool water', 'Sterile dressing', 'Pain relievers'],
          videoUrl: '/videos/burn-treatment.mp4'
        }
      ]
    },
    {
      id: 'medical',
      name: 'Medical Conditions',
      icon: Heart,
      color: 'pink',
      description: 'Response to medical emergencies',
      guides: [
        {
          id: 'heart-attack',
          title: 'Heart Attack Recognition',
          duration: '6 min',
          difficulty: 'Advanced',
          rating: 4.9,
          views: 9800,
          description: 'Identify and respond to heart attacks',
          steps: [
            'Recognize symptoms (chest pain, shortness of breath)',
            'Call emergency services immediately',
            'Keep the person calm and comfortable',
            'Give aspirin if not allergic',
            'Monitor vital signs until help arrives'
          ],
          warnings: ['Every minute counts', 'Don\'t delay calling for help'],
          equipment: ['Aspirin', 'Phone', 'Blood pressure monitor'],
          videoUrl: '/videos/heart-attack.mp4'
        },
        {
          id: 'stroke',
          title: 'Stroke - FAST Recognition',
          duration: '4 min',
          difficulty: 'Intermediate',
          rating: 4.8,
          views: 7600,
          description: 'Identify stroke symptoms using FAST',
          steps: [
            'F - Face drooping: Ask to smile',
            'A - Arm weakness: Ask to raise both arms',
            'S - Speech difficulty: Ask to repeat a phrase',
            'T - Time to call emergency services',
            'Note the time symptoms started'
          ],
          warnings: ['Time is brain - act fast', 'Don\'t give food or drink'],
          equipment: ['Phone', 'Watch'],
          videoUrl: '/videos/stroke-recognition.mp4'
        }
      ]
    },
    {
      id: 'environmental',
      name: 'Environmental',
      icon: Thermometer,
      color: 'cyan',
      description: 'Weather and temperature related',
      guides: [
        {
          id: 'heat-stroke',
          title: 'Heat Stroke and Exhaustion',
          duration: '5 min',
          difficulty: 'Intermediate',
          rating: 4.7,
          views: 8900,
          description: 'Recognize and treat heat-related illnesses',
          steps: [
            'Move to a cool place',
            'Remove excess clothing',
            'Cool with water and fans',
            'Provide cool water to drink',
            'Call emergency services if severe'
          ],
          warnings: ['Heat stroke is life-threatening', 'Don\'t give alcohol'],
          equipment: ['Water', 'Fans', 'Cool towels'],
          videoUrl: '/videos/heat-stroke.mp4'
        },
        {
          id: 'hypothermia',
          title: 'Hypothermia Treatment',
          duration: '6 min',
          difficulty: 'Advanced',
          rating: 4.8,
          views: 6700,
          description: 'Help for dangerously low body temperature',
          steps: [
            'Move to warm location',
            'Remove wet clothing',
            'Warm with blankets and body heat',
            'Provide warm, sweet drinks',
            'Monitor for breathing difficulties'
          ],
          warnings: ['Handle gently', 'Don\'t apply direct heat'],
          equipment: ['Blankets', 'Warm drinks', 'Thermometer'],
          videoUrl: '/videos/hypothermia.mp4'
        }
      ]
    }
  ];

  // Filter guides based on search and category
  const filteredGuides = firstAidCategories
    .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
    .flatMap(cat => cat.guides)
    .filter(guide => 
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Scroll to top functionality
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-green-50'}`}>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    First Aid Guide
                  </h1>
                  <p className="text-sm text-gray-600 hidden md:block">Life-saving knowledge at your fingertips</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'}`}
                >
                  <div className="w-4 h-4 space-y-1">
                    <div className="bg-current h-0.5 rounded-sm"></div>
                    <div className="bg-current h-0.5 rounded-sm"></div>
                    <div className="bg-current h-0.5 rounded-sm"></div>
                  </div>
                </button>
              </div>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 bg-white border border-gray-200 rounded-xl"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="w-full px-4 py-2 text-gray-600">
                  Emergency features removed
                </div>
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Save Lives with
                <span className="block text-yellow-300">First Aid Knowledge</span>
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Learn essential life-saving skills with our comprehensive first aid guides. 
                Be prepared for emergencies and make a difference when it matters most.
              </p>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 flex items-center justify-center">
                <Heart className="w-32 h-32 text-white/50" />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-2xl font-bold">★</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
          <div className="grid grid-cols-5 gap-3">
            {/* All Guides Button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`py-2 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center border-2 border-gray-300 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-5 h-5 mr-5 flex-shrink-0 -ml-4" />
              <div className="flex flex-col items-center">
                <div className="font-semibold text-xs">All Guides</div>
                <div className="text-xs opacity-80">Complete</div>
              </div>
            </button>
            
            {/* Category buttons */}
            {firstAidCategories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-2 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center border-2 border-gray-300 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-5 flex-shrink-0" />
                  <div className="flex flex-col items-center">
                    <div className="font-semibold text-xs">{category.name}</div>
                    <div className="text-xs opacity-80">{category.guides.length}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'all' ? 'All First Aid Guides' : 
             firstAidCategories.find(c => c.id === selectedCategory)?.name}
          </h3>
          <div className="text-sm text-gray-600">
            {filteredGuides.length} guides found
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredGuides.map(guide => (
            <div
              key={guide.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 overflow-hidden group"
            >
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-100" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {guide.title}
                  </h4>
                </div>
                
                <p className="text-gray-600 mb-4">{guide.description}</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedGuide(guide)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                  >
                    <BookOpen className="w-5 h-5 inline mr-2" />
                    View Guide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="relative h-28 bg-gradient-to-br from-green-500 to-emerald-600">
              <button
                onClick={() => setSelectedGuide(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{selectedGuide.title}</h2>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-12rem)]">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600">{selectedGuide.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Step-by-Step Instructions</h3>
                <div className="space-y-3">
                  {selectedGuide.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedGuide.warnings && selectedGuide.warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-green-600 mb-3">Important Warnings</h3>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <ul className="space-y-2">
                      {selectedGuide.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start space-x-2 text-green-700">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {selectedGuide.equipment && selectedGuide.equipment.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Required Equipment</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.equipment.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-40"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

          </div>
  );
};

export default FirstAidGuidePage;
