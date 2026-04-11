import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Search, MessageSquare, MapPin, Bell, Timer, Globe, Users, Lightbulb, Handshake, Zap } from 'lucide-react';

const AboutPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-white transition-colors">About</Link>
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
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80" 
            alt="Disaster Relief Volunteers Working Together" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0f1e]/85"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-sm font-semibold mb-8">
            <ShieldAlert size={16} />
            <span>Protecting Sri Lanka</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
            About RescueNet
          </h1>
          
          <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto mb-12 leading-relaxed">
            A proactive, community-driven platform designed to coordinate rapid disaster response, connect missing persons, and empower responders.
          </p>
        </div>
      </div>

      {/* OUR MISSION SECTION */}
      <section className="py-24 bg-[#0a0f1e] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-xl md:text-3xl font-medium leading-relaxed text-white mb-16">
            <span className="text-[#22c55e]">"</span> To provide Sri Lanka with a unified disaster management platform that connects citizens, NGOs, and authorities in real time during emergencies. <span className="text-[#22c55e]">"</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 text-center hover:bg-[#1e293b] transition-all">
              <div className="w-12 h-12 bg-[#16a34a]/20 rounded-full flex items-center justify-center text-[#22c55e] mx-auto mb-4">
                <Timer size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Response</h3>
              <p className="text-[#94a3b8]">Average response time under 5 minutes</p>
            </div>
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 text-center hover:bg-[#1e293b] transition-all">
              <div className="w-12 h-12 bg-[#16a34a]/20 rounded-full flex items-center justify-center text-[#22c55e] mx-auto mb-4">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Island Wide</h3>
              <p className="text-[#94a3b8]">Covering all 9 provinces of Sri Lanka</p>
            </div>
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 text-center hover:bg-[#1e293b] transition-all">
              <div className="w-12 h-12 bg-[#16a34a]/20 rounded-full flex items-center justify-center text-[#22c55e] mx-auto mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Driven</h3>
              <p className="text-[#94a3b8]">Thousands of citizens already registered</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO SECTION */}
      <section className="py-24 bg-[#0f172a] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">What We Do</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b] transition-all duration-300">
              <div className="w-14 h-14 bg-[#16a34a]/20 rounded-xl flex items-center justify-center text-[#22c55e] mb-6">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Missing Persons</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                A centralized registry and photo-matching system to help families reunite quickly during chaotic emergency situations. Users can securely upload details and photos of missing loved ones. Our database connects with NGO and medical records, ensuring rapid identification when shelters and hospitals intake displaced individuals.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b] transition-all duration-300">
              <div className="w-14 h-14 bg-[#16a34a]/20 rounded-xl flex items-center justify-center text-[#22c55e] mb-6">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Emergency Communication</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                Direct chat protocols bridging on-the-ground volunteers with authorized NGO command centers exactly when needed. Our live communication infrastructure circumvents traditional crowded signals, allowing verified responders to stream critical updates and request specific supplies from coordinating authorities instantly.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b] transition-all duration-300">
              <div className="w-14 h-14 bg-[#16a34a]/20 rounded-xl flex items-center justify-center text-[#22c55e] mb-6">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Shelter Finder</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                Real-time geospatial mapping and inventory tracking for safe zones and relief distribution centers. We provide citizens with interactive routes to verified shelters, while allowing shelter managers to broadcast their current capacity, medical supplies, and urgent needs securely across the network.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b] transition-all duration-300">
              <div className="w-14 h-14 bg-[#16a34a]/20 rounded-xl flex items-center justify-center text-[#22c55e] mb-6">
                <Bell size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Disaster Alerts</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                Immediate, automated broadcast notifications connecting authorities directly to at-risk populations. Powered by localized intelligence, RescueNet triggers early warnings regarding floods, landslides, and critical events directly to registered devices, minimizing response latency and maximizing proactive evacuation times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR TEAM SECTION */}
      <section className="py-24 bg-[#0a0f1e] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Team</h2>
            <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto">
              Built by a dedicated team of developers committed to saving lives through technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-8 text-center transition-all hover:-translate-y-1">
              <div className="bg-[#22c55e]/10 w-16 h-16 rounded-2xl flex items-center justify-center text-[#22c55e] mx-auto mb-6">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Innovation</h3>
              <p className="text-[#94a3b8]">Using cutting-edge technology to save lives</p>
            </div>
            
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-8 text-center transition-all hover:-translate-y-1">
              <div className="bg-[#22c55e]/10 w-16 h-16 rounded-2xl flex items-center justify-center text-[#22c55e] mx-auto mb-6">
                <Handshake size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Collaboration</h3>
              <p className="text-[#94a3b8]">Bringing citizens, NGOs and authorities together</p>
            </div>
            
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-8 text-center transition-all hover:-translate-y-1">
              <div className="bg-[#22c55e]/10 w-16 h-16 rounded-2xl flex items-center justify-center text-[#22c55e] mx-auto mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Speed</h3>
              <p className="text-[#94a3b8]">Real-time information when every second counts</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img src={require('../assets/images/RNlogo.PNG')} alt="RescueNet" className="h-12 w-auto object-contain invert hue-rotate-180 brightness-130 mix-blend-screen transition-all hover:scale-105" />
              </div>
              <p className="text-[#94a3b8] max-w-sm">Sri Lanka's centralized disaster management platform. Prepared to respond when the unexpected happens.</p>
            </div>
            <div className="flex md:justify-end gap-16">
              <div>
                <h4 className="font-bold mb-4">Platform</h4>
                <ul className="space-y-2 text-[#94a3b8] text-sm">
                  <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Access</h4>
                <ul className="space-y-2 text-[#94a3b8] text-sm">
                  <li><Link to="/auth/login" className="hover:text-white transition-colors">Log in</Link></li>
                  <li><Link to="/auth/register" className="hover:text-white transition-colors">Sign up</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-[#64748b] text-sm">
            <p>&copy; {new Date().getFullYear()} RescueNet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
