import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';

const ContactPage = () => {
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
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="text-white transition-colors">Contact Us</Link>
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
          <div 
            className="absolute inset-0" 
            style={{ background: 'radial-gradient(ellipse at center, rgba(22, 163, 74, 0.35) 0%, rgba(10, 15, 30, 1) 70%)' }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
            Get In Touch
          </h1>
          <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto font-medium tracking-wide">
            We're here 24/7 — reach out anytime and our team will respond as quickly as possible
          </p>
        </div>
      </div>

      {/* CONTACT FORM & INFO SECTION */}
      <section className="py-24 bg-[#0a0f1e] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <div className="bg-[#0f172a] border border-white/5 p-8 md:p-12 rounded-3xl shadow-xl">
              <h2 className="text-3xl font-bold mb-8">Send us a message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-[#94a3b8]">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      required
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-[#94a3b8]">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      required
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-[#94a3b8]">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    required
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all"
                    placeholder="How can we help?"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-[#94a3b8]">Message</label>
                  <textarea 
                    id="message" 
                    required
                    rows="5"
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all resize-none"
                    placeholder="Provide as much detail as possible..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[#16a34a] hover:bg-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-white font-medium px-8 py-4 rounded-xl transition-all duration-300"
                >
                  Submit Message
                </button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b] transition-all duration-300 flex items-start gap-6">
                <div className="w-14 h-14 bg-[#16a34a]/20 shrink-0 rounded-xl flex items-center justify-center text-[#22c55e]">
                  <Mail size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Email Parameters</h3>
                  <p className="text-[#94a3b8] mb-1">Our friendly team is here to help.</p>
                  <a href="mailto:support@rescuenet.lk" className="text-[#22c55e] font-medium hover:underline">support@rescuenet.lk</a>
                </div>
              </div>
              
              <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b] transition-all duration-300 flex items-start gap-6">
                <div className="w-14 h-14 bg-[#16a34a]/20 shrink-0 rounded-xl flex items-center justify-center text-[#22c55e]">
                  <Phone size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Phone</h3>
                  <p className="text-[#94a3b8] mb-1">Available 24/7</p>
                  <a href="tel:+94111236745" className="text-[#22c55e] font-medium hover:underline">+94 11 123 6745</a>
                </div>
              </div>
              
              <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b] transition-all duration-300 flex items-start gap-6">
                <div className="w-14 h-14 bg-[#16a34a]/20 shrink-0 rounded-xl flex items-center justify-center text-[#22c55e]">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Location</h3>
                  <p className="text-[#94a3b8] mb-1">Come say hello at our command center.</p>
                  <span className="text-[#22c55e] font-medium">Colombo, Sri Lanka</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-16 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-4 flex items-center justify-center md:justify-start gap-3">
                <AlertTriangle size={32} /> Emergency? Don't wait.
              </h2>
              <p className="text-white/80 text-lg max-w-2xl">
                If you are facing an active emergency, do not use this form. Call 119 immediately or use the Emergency Contact feature inside the RescueNet platform.
              </p>
            </div>
            <a href="tel:119" className="shrink-0 bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white text-lg font-bold px-10 py-5 rounded-2xl transition-all hover:scale-105">
              Call 119 Now
            </a>
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

export default ContactPage;
