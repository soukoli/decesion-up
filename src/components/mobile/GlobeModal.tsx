'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { GlobalHotspot } from '@/types';
import { useTranslation } from '@/lib/translation';

// Dynamic import to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="text-slate-400">Loading globe...</div>
    </div>
  ),
});

interface GlobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotspots: GlobalHotspot[];
}

const categoryColors: Record<GlobalHotspot['category'], string> = {
  conflict: '#ef4444',
  protest: '#f59e0b',
  disaster: '#8b5cf6',
  politics: '#3b82f6',
  economy: '#10b981',
};

const categoryLabelsEN: Record<GlobalHotspot['category'], string> = {
  conflict: 'Conflicts',
  protest: 'Protests',
  disaster: 'Disasters',
  politics: 'Politics',
  economy: 'Economy',
};

const categoryLabelsCZ: Record<GlobalHotspot['category'], string> = {
  conflict: 'Konflikty',
  protest: 'Protesty',
  disaster: 'Katastrofy',
  politics: 'Politika',
  economy: 'Ekonomika',
};

const categoryOrder: GlobalHotspot['category'][] = ['conflict', 'disaster', 'protest', 'politics', 'economy'];

// Bottom sheet snap points (percentage of screen height)
const SHEET_COLLAPSED = 60; // Just the handle visible (px)
const SHEET_HALF = 40; // 40% of screen
const SHEET_FULL = 85; // 85% of screen

type SheetState = 'collapsed' | 'half' | 'full';

export function GlobeModal({ isOpen, onClose, hotspots }: GlobeModalProps) {
  const globeRef = useRef<any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<GlobalHotspot | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const { language } = useTranslation();
  const dragControls = useDragControls();
  
  const categoryLabels = language === 'cs' ? categoryLabelsCZ : categoryLabelsEN;

  // Group hotspots by category and sort by intensity
  const groupedHotspots = useMemo(() => {
    const groups: Record<GlobalHotspot['category'], GlobalHotspot[]> = {
      conflict: [],
      protest: [],
      disaster: [],
      politics: [],
      economy: [],
    };
    
    hotspots.forEach(h => {
      groups[h.category].push(h);
    });
    
    // Sort each group by intensity (highest first)
    Object.keys(groups).forEach(key => {
      groups[key as GlobalHotspot['category']].sort((a, b) => b.intensity - a.intensity);
    });
    
    return groups;
  }, [hotspots]);

  // Calculate sheet height based on state
  const getSheetHeight = (state: SheetState): number => {
    switch (state) {
      case 'collapsed': return SHEET_COLLAPSED;
      case 'half': return (dimensions.height * SHEET_HALF) / 100;
      case 'full': return (dimensions.height * SHEET_FULL) / 100;
      default: return SHEET_COLLAPSED;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      document.body.style.overflow = 'hidden';
      setSheetState('collapsed');
      setSelectedHotspot(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (globeRef.current && isOpen) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
      controls.minDistance = 150;
      controls.maxDistance = 400;
      globeRef.current.pointOfView({ lat: 30, lng: 0, altitude: 2.2 }, 0);
    }
  }, [isOpen]);

  const handlePointClick = useCallback((point: GlobalHotspot) => {
    setSelectedHotspot(point);
    setSheetState('collapsed'); // Collapse sheet when viewing detail
    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: point.lat, lng: point.lng, altitude: 1.5 },
        1000
      );
      globeRef.current.controls().autoRotate = false;
    }
  }, []);

  const handleCloseDetail = () => {
    setSelectedHotspot(null);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.pointOfView({ lat: 30, lng: 0, altitude: 2.2 }, 1000);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;
    
    // Determine new state based on drag direction and velocity
    if (velocity > 500 || offset > 100) {
      // Dragging down fast - collapse
      if (sheetState === 'full') {
        setSheetState('half');
      } else {
        setSheetState('collapsed');
      }
    } else if (velocity < -500 || offset < -100) {
      // Dragging up fast - expand
      if (sheetState === 'collapsed') {
        setSheetState('half');
      } else {
        setSheetState('full');
      }
    }
  };

  const handleSheetToggle = () => {
    if (sheetState === 'collapsed') {
      setSheetState('half');
    } else {
      setSheetState('collapsed');
    }
  };

  const pointsData = hotspots.map(h => ({
    ...h,
    size: 0.05 + (h.intensity / 10) * 0.3,
    color: categoryColors[h.category],
  }));

  const ringsData = hotspots.filter(h => h.intensity >= 5).map(h => ({
    lat: h.lat,
    lng: h.lng,
    maxR: 3 + (h.intensity / 10) * 5,
    propagationSpeed: 2,
    repeatPeriod: 1000 + (10 - h.intensity) * 200,
    color: categoryColors[h.category],
  }));

  // Count high-intensity events
  const criticalCount = hotspots.filter(h => h.intensity >= 8).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent">
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'cs' ? 'Globální Události' : 'Global Hotspots'}
              </h2>
              <p className="text-xs text-slate-400">
                {hotspots.length} {language === 'cs' ? 'událostí' : 'events'}
                {criticalCount > 0 && (
                  <span className="ml-2 text-red-400">
                    • {criticalCount} {language === 'cs' ? 'kritických' : 'critical'}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Legend - only show when sheet is collapsed */}
          <AnimatePresence>
            {sheetState === 'collapsed' && !selectedHotspot && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-20 left-4 z-10 flex flex-wrap gap-2"
              >
                {Object.entries(categoryColors).map(([cat, color]) => {
                  const count = groupedHotspots[cat as GlobalHotspot['category']].length;
                  if (count === 0) return null;
                  return (
                    <span key={cat} className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded-full text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-slate-300">{count}</span>
                    </span>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Globe */}
          <div className="w-full h-full">
            <Globe
              ref={globeRef}
              width={dimensions.width}
              height={dimensions.height}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              pointsData={pointsData}
              pointLat="lat"
              pointLng="lng"
              pointAltitude="size"
              pointColor="color"
              pointRadius={0.5}
              pointLabel={(d: object) => {
                const point = d as GlobalHotspot & { color: string };
                const description = point.topEvent?.slice(0, 60) || 'No description';
                return `
                  <div style="background: rgba(15,23,42,0.95); padding: 8px 12px; border-radius: 8px; border: 1px solid #334155;">
                    <div style="font-weight: bold; color: white;">${point.region || point.country || 'Unknown'}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${description}...</div>
                  </div>
                `;
              }}
              onPointClick={(point: object) => handlePointClick(point as GlobalHotspot)}
              ringsData={ringsData}
              ringLat="lat"
              ringLng="lng"
              ringMaxRadius="maxR"
              ringPropagationSpeed="propagationSpeed"
              ringRepeatPeriod="repeatPeriod"
              ringColor="color"
              atmosphereColor="#4f46e5"
              atmosphereAltitude={0.2}
            />
          </div>

          {/* Selected Hotspot Detail - shows above bottom sheet */}
          <AnimatePresence>
            {selectedHotspot && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-20 left-4 right-4 z-20 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-600 p-4 shadow-xl"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${categoryColors[selectedHotspot.category]}20`,
                        color: categoryColors[selectedHotspot.category],
                      }}
                    >
                      {categoryLabels[selectedHotspot.category]}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">
                      {selectedHotspot.region || selectedHotspot.country || 'Unknown'}
                    </h3>
                  </div>
                  <button 
                    onClick={handleCloseDetail}
                    className="text-slate-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  {selectedHotspot.topEvent || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{selectedHotspot.eventCount ?? 0} {language === 'cs' ? 'událostí' : 'events'}</span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        backgroundColor: (selectedHotspot.intensity ?? 0) >= 8 ? 'rgba(239,68,68,0.2)' : 
                                        (selectedHotspot.intensity ?? 0) >= 5 ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.2)',
                        color: (selectedHotspot.intensity ?? 0) >= 8 ? '#ef4444' : 
                               (selectedHotspot.intensity ?? 0) >= 5 ? '#f59e0b' : '#94a3b8',
                      }}
                    >
                      {(selectedHotspot.intensity ?? 0) >= 8 ? (language === 'cs' ? 'Kritické' : 'Critical') :
                       (selectedHotspot.intensity ?? 0) >= 5 ? (language === 'cs' ? 'Vysoké' : 'High') :
                       (language === 'cs' ? 'Střední' : 'Medium')}
                    </span>
                    <span>{selectedHotspot.intensity ?? 0}/10</span>
                  </div>
                </div>
                {selectedHotspot.url && (
                  <a
                    href={selectedHotspot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium"
                  >
                    {language === 'cs' ? 'Číst více' : 'Read More'}
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Sheet */}
          <motion.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            animate={{ 
              height: getSheetHeight(sheetState),
              transition: { type: 'spring', damping: 30, stiffness: 300 }
            }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border-t border-slate-700 overflow-hidden"
          >
            {/* Handle */}
            <div 
              className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
              onClick={handleSheetToggle}
            >
              <div className="w-12 h-1 bg-slate-600 rounded-full" />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400">
                  {sheetState === 'collapsed' 
                    ? (language === 'cs' ? 'Zobrazit seznam' : 'Show list')
                    : (language === 'cs' ? 'Skrýt seznam' : 'Hide list')
                  }
                </span>
                <svg 
                  className={`w-4 h-4 text-slate-400 transition-transform ${sheetState !== 'collapsed' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </div>

            {/* Sheet Content */}
            <div className="h-full overflow-y-auto pb-safe-area px-4">
              {categoryOrder.map(category => {
                const items = groupedHotspots[category];
                if (items.length === 0) return null;
                
                return (
                  <div key={category} className="mb-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-900/95 py-2">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoryColors[category] }}
                      />
                      <h3 className="text-sm font-semibold text-white">
                        {categoryLabels[category]}
                      </h3>
                      <span className="text-xs text-slate-500">({items.length})</span>
                    </div>
                    
                    {/* Items */}
                    <div className="space-y-2">
                      {items.map(hotspot => (
                        <button
                          key={hotspot.id}
                          onClick={() => handlePointClick(hotspot)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            selectedHotspot?.id === hotspot.id
                              ? 'bg-slate-700 border-amber-500'
                              : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white truncate">
                                  {hotspot.region || hotspot.country || 'Unknown'}
                                </span>
                                {hotspot.intensity >= 8 && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded">
                                    {language === 'cs' ? 'KRITICKÉ' : 'CRITICAL'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {hotspot.topEvent || 'No description available'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end ml-2 shrink-0">
                              <span className="text-xs text-slate-500">
                                {hotspot.intensity ?? 0}/10
                              </span>
                              <span className="text-[10px] text-slate-600">
                                {hotspot.eventCount ?? 0} {language === 'cs' ? 'udál.' : 'events'}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Bottom padding for safe area */}
              <div className="h-8" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
