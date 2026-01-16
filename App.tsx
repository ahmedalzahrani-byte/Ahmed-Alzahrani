
import React, { useState, useEffect } from 'react';
import { SAUDI_CITIES } from './constants';
import { SaudiCity, CityEvent, ViewState } from './types';
import { fetchCityEvents } from './services/geminiService';

// --- Minimalist Icons: Geometric Line Art ---
const CityIcon = ({ id, className = "w-8 h-8" }: { id: string, className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    riyadh: (
      <g strokeWidth="1">
        <rect x="10" y="4" width="4" height="16" rx="0.5" />
        <rect x="5" y="12" width="2" height="8" rx="0.5" opacity="0.4" />
        <rect x="17" y="9" width="2" height="11" rx="0.5" opacity="0.4" />
      </g>
    ),
    jeddah: (
      <g strokeWidth="1">
        <path d="M4 12c4-2 8 2 12 0s4-2 4 0" />
        <path d="M4 16c4-2 8 2 12 0s4-2 4 0" opacity="0.4" />
      </g>
    ),
    alula: (
      <g strokeWidth="1">
        <path d="M4 20c4 0 4-4 8-4s4 4 8 4" />
        <circle cx="12" cy="8" r="3" opacity="0.2" />
      </g>
    ),
    dammam: (
      <g strokeWidth="1">
        <path d="M4 14c2-1 4 1 6 0s4-1 6 0 4 1 6 0" />
      </g>
    ),
    abha: (
      <g strokeWidth="1">
        <path d="m4 18 8-12 8 12" />
      </g>
    ),
    medina: (
      <g strokeWidth="1">
        <path d="M12 4v4m-4 2a4 4 0 0 1 8 0v4H8v-4z" />
        <path d="M6 20h12v-6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6z" />
      </g>
    ),
    mecca: (
      <g strokeWidth="1">
        <rect x="8" y="12" width="8" height="8" rx="1" />
        <path d="M12 4v4m-2 0a2 2 0 0 1 4 0v4h-4V8z" />
      </g>
    ),
    taif: (
      <g strokeWidth="1">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v2m0 12v2M4 12h2m12 0h2" />
      </g>
    ),
    tabuk: (
      <g strokeWidth="1">
        <path d="m4 18 4-6 4 6 4-6 4 6" />
      </g>
    ),
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {icons[id] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};

// --- Sub-components ---

const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Analyzing Vision..." }) => (
  <div className="fixed inset-0 bg-white/95 backdrop-blur-2xl z-[1000] flex items-center justify-center animate-in fade-in duration-500">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-8"></div>
      <p className="text-gray-900 font-light text-lg tracking-widest uppercase">{message}</p>
    </div>
  </div>
);

const CityCard: React.FC<{ city: SaudiCity; onClick: () => void }> = ({ city, onClick }) => (
  <button 
    onClick={onClick}
    className="group relative h-[280px] bg-white border border-gray-100 rounded-3xl p-10 text-left transition-all duration-500 hover:border-emerald-200 hover:shadow-xl hover:shadow-gray-100 active:scale-[0.98]"
  >
    <div className="flex flex-col h-full">
      <div className="text-emerald-600 mb-8 transition-transform group-hover:translate-x-1">
        <CityIcon id={city.id} />
      </div>
      <p className="text-emerald-600 text-[10px] tracking-[0.3em] font-medium uppercase mb-2">{city.arabicName}</p>
      <h3 className="text-3xl font-semibold tracking-tight text-gray-950 mb-4">{city.name}</h3>
      <p className="text-sm text-gray-400 font-normal leading-relaxed line-clamp-2 mt-auto">
        {city.description}
      </p>
    </div>
  </button>
);

const EventItem: React.FC<{ event: CityEvent; onSelect: () => void }> = ({ event, onSelect }) => (
  <div 
    onClick={onSelect}
    className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col cursor-pointer hover:border-emerald-500 transition-all group active:scale-[0.99]"
  >
    <div className="flex justify-between items-center mb-6">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-800 bg-emerald-50 px-4 py-1.5 rounded-full">
        {event.category}
      </span>
      <span className="text-[10px] text-gray-300 font-medium tracking-widest">2026</span>
    </div>
    <h4 className="font-semibold text-2xl text-gray-950 mb-4 group-hover:text-emerald-600 transition-colors tracking-tight leading-snug">{event.title}</h4>
    <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-6 border-t border-gray-50 font-medium uppercase tracking-widest">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      <span className="truncate">{event.location}</span>
    </div>
  </div>
);

const EventDetail: React.FC<{ event: CityEvent; onClose: () => void }> = ({ event, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[1200] bg-white animate-in slide-in-from-bottom duration-500 flex flex-col overflow-hidden">
      {/* Navigation */}
      <div className="flex items-center justify-between px-8 py-8 md:px-24">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center text-white font-bold text-xl">W</div>
          <span className="text-xs font-semibold tracking-[0.3em] text-gray-400 uppercase">WAJHAH Detail</span>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center gap-3 px-6 py-3 bg-gray-950 hover:bg-emerald-600 rounded-full text-white transition-all text-[10px] font-semibold uppercase tracking-widest shadow-lg"
        >
          Close
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scroll-hide pb-20">
        <div className="max-w-6xl mx-auto px-8 md:px-24 py-12 md:py-24">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <div className="lg:w-2/3">
              <div className="mb-10">
                <span className="text-[10px] font-semibold tracking-[0.5em] text-emerald-600 uppercase border-b border-emerald-100 pb-2">
                  {event.category}
                </span>
              </div>

              <h2 className="text-5xl md:text-7xl font-semibold text-gray-950 leading-tight mb-16 tracking-tighter animate-in fade-in slide-in-from-left duration-700">
                {event.title}
              </h2>
              
              <p className="text-gray-500 leading-relaxed text-2xl md:text-3xl font-light tracking-tight mb-20">
                {event.description}
              </p>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 mb-10">
                 <h4 className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest mb-10">Logistics</h4>
                 <div className="space-y-8">
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Schedule</span>
                      <span className="text-xl font-medium text-gray-950 leading-none">{event.date}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Sector</span>
                      <span className="text-xl font-medium text-gray-950 leading-none">{event.location}</span>
                    </div>
                 </div>
              </div>

              <a 
                href="https://webook.com/en" 
                target="_blank" 
                className="flex items-center justify-center gap-4 w-full py-6 bg-gray-950 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-xl font-semibold text-sm uppercase tracking-widest active:scale-[0.98]"
              >
                Get Tickets
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.GRID);
  const [selectedCity, setSelectedCity] = useState<SaudiCity | null>(null);
  const [events, setEvents] = useState<CityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCityClick = async (city: SaudiCity) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsLoading(true);
    setSelectedCity(city);
    setViewState(ViewState.CITY_DETAIL);
    
    try {
      const cityEvents = await fetchCityEvents(city.name);
      setEvents(cityEvents);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setViewState(ViewState.GRID);
    setSelectedCity(null);
    setEvents([]);
    setSelectedEvent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-gray-950 selection:bg-emerald-50 pb-20">
      {/* Header Navigation */}
      <nav className="px-8 pt-10 md:px-24 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center text-white font-bold text-xl">W</div>
          <span className="text-sm font-semibold tracking-[0.4em] uppercase text-gray-950">WAJHAH</span>
        </div>
        <div className="hidden sm:flex gap-10 text-[10px] font-semibold text-gray-300 uppercase tracking-widest">
          <span className="text-emerald-600 border-b border-emerald-200 pb-1">Discover</span>
          <span className="hover:text-gray-900 transition-colors cursor-pointer">Archive</span>
          <span className="hover:text-gray-900 transition-colors cursor-pointer">Info</span>
        </div>
      </nav>

      <header className="px-8 pt-20 pb-16 md:px-24 md:pt-32 md:pb-24 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <span className="inline-block text-[10px] font-semibold text-emerald-600 uppercase tracking-[0.4em] mb-6">Future Discovery</span>
            <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter leading-[0.9] mb-10 text-gray-950">
              Explore the <br/>Kingdom.
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed tracking-tight max-w-xl">
              A minimalist guide to Saudi Arabia's upcoming mega-projects and curated experiences by <span className="text-gray-900 font-medium">WAJHAH</span>.
            </p>
          </div>
          
          {viewState === ViewState.CITY_DETAIL && (
            <button 
              onClick={handleBack}
              className="flex items-center gap-4 px-8 py-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-500 transition-all text-xs font-semibold uppercase tracking-widest group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              Grid
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="px-8 md:px-24 max-w-7xl mx-auto">
        {viewState === ViewState.GRID ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {SAUDI_CITIES.map((city) => (
              <CityCard key={city.id} city={city} onClick={() => handleCityClick(city)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-20 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* City Identity Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-10">
                <div className="bg-white rounded-3xl p-12 border border-gray-100 mb-8 text-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-10">
                    <CityIcon id={selectedCity?.id || ''} className="w-12 h-12" />
                  </div>
                  <span className="text-emerald-600 text-lg font-medium tracking-[0.4em] mb-4 block">{selectedCity?.arabicName}</span>
                  <h2 className="text-5xl font-semibold tracking-tighter text-gray-950 mb-8">{selectedCity?.name}</h2>
                  <p className="text-lg text-gray-400 font-light leading-relaxed">{selectedCity?.description}</p>
                </div>
              </div>
            </div>

            {/* Content List */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-16">
                <h3 className="text-4xl font-semibold text-gray-950 tracking-tight">Discovery</h3>
                <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full">
                  Verified Intel
                </span>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-gray-50 border border-gray-100 rounded-3xl p-10 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {events.map((event) => (
                    <EventItem key={event.id} event={event} onSelect={() => setSelectedEvent(event)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-40 pt-20 border-t border-gray-50 text-center px-8">
        <div className="inline-flex items-center gap-6 px-10 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm mb-12">
          <div className="w-8 h-8 bg-gray-950 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Minimal Curator Portal</span>
        </div>
        <p className="text-[10px] font-semibold text-gray-200 uppercase tracking-[0.8em] max-w-xl mx-auto leading-loose">
          WAJHAH IS AN INDEPENDENT PORTAL CURATING THE DISCOVERY OF SAUDI ARABIA WINTER 2026.
        </p>
      </footer>

      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {isLoading && viewState === ViewState.GRID && (
        <LoadingOverlay message={`Exploring ${selectedCity?.name}...`} />
      )}
    </div>
  );
}
