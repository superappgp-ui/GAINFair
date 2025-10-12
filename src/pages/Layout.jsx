
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home") },
  { title: "Why Attend", url: createPageUrl("WhyAttend") },
  { title: "Exhibitors", url: createPageUrl("Exhibitors") },
  { title: "Schedule", url: createPageUrl("Schedule") },
  { title: "Venue & Travel", url: createPageUrl("Venue") },
  { title: "FAQs", url: createPageUrl("FAQs") },
  { title: "Register", url: createPageUrl("Register"), primary: true }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if current page is CMS - hide public layout
  const isCMSPage = currentPageName === "cms-login" || currentPageName === "cms-dashboard";

  if (isCMSPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style>{`
        :root {
          --primary: #0EA5E9;
          --primary-dark: #0284C7;
          --dark: #0B132B;
          --accent: #22C55E;
          --bg: #F8FAFC;
          --text: #475569;
          --text-light: #64748B;
        }
        
        .nav-link {
          transition: all 0.2s ease;
          position: relative;
        }
        
        .nav-link:hover {
          color: var(--primary);
        }
        
        .nav-link.active {
          color: var(--primary);
          font-weight: 600;
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary);
        }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-3' : 'bg-white/10 backdrop-blur-md py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div className="hidden sm:block">
                <div className={`font-bold text-lg transition-colors ${scrolled ? 'text-[#0B132B]' : 'text-white drop-shadow-lg'}`}>
                  GAIN FAIR
                </div>
                <div className={`text-xs transition-colors ${scrolled ? 'text-[#64748B]' : 'text-white/90'}`}>
                  Vietnam 2025
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                item.primary ? (
                  <Link key={item.title} to={item.url}>
                    <Button className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-lg">
                      {item.title}
                    </Button>
                  </Link>
                ) : (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`nav-link px-4 py-2 text-sm font-medium rounded-lg ${
                      location.pathname === item.url
                        ? 'active'
                        : scrolled 
                          ? 'text-[#475569] hover:bg-gray-100' 
                          : 'text-white hover:bg-white/20 drop-shadow-md'
                    }`}
                  >
                    {item.title}
                  </Link>
                )
              ))}
            </div>

            <button
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className={`w-6 h-6 ${scrolled ? 'text-[#0B132B]' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${scrolled ? 'text-[#0B132B]' : 'text-white drop-shadow-lg'}`} />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.primary
                      ? 'bg-[#0EA5E9] text-white hover:bg-[#0284C7]'
                      : location.pathname === item.url
                      ? 'bg-blue-50 text-[#0EA5E9]'
                      : 'text-[#475569] hover:bg-gray-50'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer className="bg-[#0B132B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <div>
                  <div className="font-bold text-lg">GAIN FAIR</div>
                  <div className="text-xs text-gray-400">Vietnam 2025</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Your gateway to global education and immigration opportunities
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                {navigationItems.slice(0, -1).map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className="block text-gray-400 hover:text-[#0EA5E9] text-sm transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Event Details</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-[#0EA5E9]" />
                  <span>October 25, 2025</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-[#0EA5E9]" />
                  <span>Quảng Trị Convention Center<br />Vietnam</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 GAIN FAIR. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-[#0EA5E9] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#0EA5E9] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#0EA5E9] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
