import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  MessageSquare, 
  MapPin, 
  BellRing,
  UserPlus,
  Radio,
  HeartHandshake,
  Users,
  Building,
  Shield,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
          // Optional: stop observing once animated
          observerRef.current.unobserve(entry.target);
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans selection:bg-[#16a34a] selection:text-white">
      {/* SVG utility to remove black background from invert */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="remove-black" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    1 1 1 0 0"
          />
        </filter>
      </svg>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src={require('../assets/images/RNlogo.PNG')} 
              alt="RescueNet" 
              className="h-14 w-auto object-contain transition-all hover:scale-105" 
              style={{ filter: 'invert(1) url(#remove-black) hue-rotate(180deg) brightness(1.3)' }}
            />
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94a3b8]">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('portals')} className="hover:text-white transition-colors">Portals</button>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/auth/login" className="text-sm font-medium text-white hover:text-[#22c55e] transition-colors">
              Log in
            </Link>
            <Link to="/auth/register" className="text-sm font-medium bg-[#16a34a] hover:bg-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] text-white px-5 py-2.5 rounded-full transition-all duration-300 transform hover:-translate-y-0.5">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={require('../assets/images/hero_bg.png')} 
            alt="Rescue Operation" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0f1e]/85"></div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-[#16a34a]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f172a] border border-white/10 text-sm font-medium text-[#22c55e] mb-8 shadow-xl">
            <Radio size={16} className="animate-pulse" />
            <span>Live System: Optimizing Disaster Response</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            When Disaster Strikes, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-emerald-400">
              RescueNet Responds
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#94a3b8] max-w-3xl mx-auto mb-10 leading-relaxed">
            Sri Lanka's unified disaster management and relief coordination platform — connecting citizens, NGOs, and authorities in real time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/register" className="w-full sm:w-auto bg-[#16a34a] hover:bg-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] text-white text-lg font-medium px-8 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1">
              Get Started
            </Link>
            <button onClick={() => scrollToSection('how-it-works')} className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white text-lg font-medium px-8 py-4 rounded-full transition-all duration-300">
              See How It Works
            </button>
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 flex flex-wrap justify-center gap-8 md:gap-16 text-[#94a3b8] font-medium text-sm md:text-base">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22c55e]"></div> 18+ Emergency Services</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22c55e]"></div> Real-time Alerts</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22c55e]"></div> 24/7 Available</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22c55e]"></div> Sri Lanka Wide</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-[#0a0f1e] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in a Crisis</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg">Powerful tools designed specifically for disaster scenarios, ensuring you have the right information when every second counts.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl hover:border-[#16a34a]/50 hover:shadow-[0_0_30px_rgba(22,163,74,0.1)] transition-all duration-300 group animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
              <div className="bg-[#1e293b] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#16a34a] group-hover:text-white transition-colors text-[#22c55e]">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Missing Person Reporting</h3>
              <p className="text-[#94a3b8] leading-relaxed">Report and track missing individuals during disasters with real-time updates and secure image uploads using advanced facial metadata tracking.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl hover:border-[#16a34a]/50 hover:shadow-[0_0_30px_rgba(22,163,74,0.1)] transition-all duration-300 group animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-300">
              <div className="bg-[#1e293b] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#16a34a] group-hover:text-white transition-colors text-[#22c55e]">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Emergency Communication</h3>
              <p className="text-[#94a3b8] leading-relaxed">Direct bidirectional chat with emergency services (Police, Ambulance, Fire) and regional disaster coordinators without leaving the app.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl hover:border-[#16a34a]/50 hover:shadow-[0_0_30px_rgba(22,163,74,0.1)] transition-all duration-300 group animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-400">
              <div className="bg-[#1e293b] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#16a34a] group-hover:text-white transition-colors text-[#22c55e]">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Shelter Finder</h3>
              <p className="text-[#94a3b8] leading-relaxed">Locate nearest verified shelters via an interactive map interface, complete with live capacity information, driving directions, and resource availability.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl hover:border-[#16a34a]/50 hover:shadow-[0_0_30px_rgba(22,163,74,0.1)] transition-all duration-300 group animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-500">
              <div className="bg-[#1e293b] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#16a34a] group-hover:text-white transition-colors text-[#22c55e]">
                <BellRing size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Disaster Alerts</h3>
              <p className="text-[#94a3b8] leading-relaxed">Get instant alerts and updates on active disasters in your area, pushed directly from centralized government disaster management registries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready in 3 Simple Steps</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg">We've eliminated friction so you can focus on what matters during an emergency.</p>
          </div>

          <div className="relative">
            {/* Connecting Timeline Line (Desktop) */}
            <div className="hidden md:block absolute top-[50px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-[#16a34a]/50 to-transparent"></div>

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-[#0a0f1e] border-2 border-[#16a34a] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.2)]">
                    <UserPlus size={32} className="text-[#22c55e]" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center text-white font-bold shadow-lg">1</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Create Your Account</h3>
                <p className="text-[#94a3b8]">Register as a Citizen, Volunteer, or NGO in under 2 minutes. Secure, fast, and easy.</p>
              </div>

              {/* Step 2 */}
              <div className="text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-400">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-[#0a0f1e] border-2 border-[#16a34a] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.2)]">
                    <Radio size={32} className="text-[#22c55e]" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center text-white font-bold shadow-lg">2</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Stay Informed</h3>
                <p className="text-[#94a3b8]">Access real-time disaster information, safe shelter maps, and direct emergency contacts.</p>
              </div>

              {/* Step 3 */}
              <div className="text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-600">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-[#0a0f1e] border-2 border-[#16a34a] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.2)]">
                    <HeartHandshake size={32} className="text-[#22c55e]" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center text-white font-bold shadow-lg">3</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Take Action</h3>
                <p className="text-[#94a3b8]">Report missing persons, request immediate help, or coordinate complex relief efforts seamlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTALS SECTION */}
      <section id="portals" className="py-24 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Portal</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg">Purpose-built environments ensuring the right tools are always placed in the right hands.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Citizen Portal */}
            <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(22,163,74,0.2)] transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100 flex flex-col h-full">
              <div className="bg-[#16a34a]/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-[#22c55e]">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Citizen Portal</h3>
              <p className="text-[#94a3b8] mb-8 flex-grow">Find verified shelters, report missing persons, and request emergency help directly from responders.</p>
              <Link to="/auth/login" className="flex justify-between items-center w-full bg-white/5 hover:bg-[#16a34a] text-white px-6 py-3 rounded-xl transition-colors font-medium group">
                Enter as Citizen
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Volunteer Portal */}
            <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200 flex flex-col h-full">
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
                <HeartHandshake size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Volunteer Portal</h3>
              <p className="text-[#94a3b8] mb-8 flex-grow">Join real relief efforts, assist NGOs on the ground, and directly support disaster response operations locally.</p>
              <Link to="/auth/login" className="flex justify-between items-center w-full bg-white/5 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors font-medium group">
                Enter as Volunteer
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* NGO Portal */}
            <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)] transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-300 flex flex-col h-full">
              <div className="bg-amber-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
                <Building size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">NGO Portal</h3>
              <p className="text-[#94a3b8] mb-8 flex-grow">Coordinate massive relief campaigns, manage localized volunteers, and track inbound physical donations.</p>
              <Link to="/auth/login" className="flex justify-between items-center w-full bg-white/5 hover:bg-amber-600 text-white px-6 py-3 rounded-xl transition-colors font-medium group">
                Enter as NGO
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Admin Portal */}
            <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)] transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-400 flex flex-col h-full">
              <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Admin Portal</h3>
              <p className="text-[#94a3b8] mb-8 flex-grow">Monitor global platform activity, manage user access, verify resources, and oversee all Rescue operations.</p>
              <Link to="/auth/login" className="flex justify-between items-center w-full bg-white/5 hover:bg-purple-600 text-white px-6 py-3 rounded-xl transition-colors font-medium group">
                Enter as Admin
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img src={require('../assets/images/RNlogo.PNG')} alt="RescueNet" className="h-12 w-auto object-contain invert hue-rotate-180 brightness-125 mix-blend-screen transition-all hover:scale-105" />
              </div>
              <p className="text-[#94a3b8] max-w-sm">Sri Lanka's centralized disaster management platform. Prepared to respond when the unexpected happens.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 md:justify-self-end">
              <div>
                <h4 className="font-bold text-white mb-4">Platform</h4>
                <ul className="space-y-2 text-[#94a3b8] text-sm">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-[#22c55e] transition-colors">Features</button></li>
                  <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#22c55e] transition-colors">How It Works</button></li>
                  <li><button onClick={() => scrollToSection('portals')} className="hover:text-[#22c55e] transition-colors">Portals</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Access</h4>
                <ul className="space-y-2 text-[#94a3b8] text-sm">
                  <li><Link to="/auth/login" className="hover:text-[#22c55e] transition-colors">Login</Link></li>
                  <li><Link to="/auth/register" className="hover:text-[#22c55e] transition-colors">Register</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#94a3b8]">
            <p>&copy; {new Date().getFullYear()} RescueNet. All rights reserved.</p>
            <p className="flex items-center gap-1">Built with <HeartHandshake size={14} className="text-red-500"/> for Sri Lanka.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
