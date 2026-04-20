/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback, ReactNode, MouseEvent as ReactMouseEvent, FC } from 'react';
import { 
  Plus, 
  Trash2, 
  Play, 
  Image as ImageIcon, 
  Type, 
  Square, 
  Layout, 
  Settings, 
  Download,
  Monitor,
  Presentation,
  Maximize2,
  X,
  Palette,
  Type as FontIcon,
  MousePointer2,
  Share2,
  Search,
  HelpCircle,
  MoreHorizontal,
  Circle,
  Triangle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Slide, SlideElement, PresentationMode } from './types.ts';

const THEMES = [
  { name: 'Minimal', bg: '#ffffff', text: '#323130', accent: '#b7472a' },
  { name: 'Dark', bg: '#323130', text: '#ffffff', accent: '#605e5c' },
  { name: 'Sky', bg: '#f3f2f1', text: '#323130', accent: '#2b579a' },
];

const INITIAL_SLIDE: Slide = {
  id: '1',
  elements: [
    {
      id: 'e1',
      type: 'text',
      x: 10,
      y: 25,
      width: 80,
      height: 20,
      content: 'QUARTERLY PERFORMANCE',
      style: { fontSize: '48px', fontWeight: '800', textAlign: 'center', color: '#b7472a', fontFamily: 'Inter', letterSpacing: '-0.025em' }
    },
    {
      id: 'e2',
      type: 'text',
      x: 10,
      y: 50,
      width: 80,
      height: 10,
      content: 'Analysis and Strategy Review',
      style: { fontSize: '24px', textAlign: 'center', color: '#605e5c', fontFamily: 'Inter', fontWeight: '300' }
    }
  ],
  background: '#ffffff'
};

export default function App() {
  const [slides, setSlides] = useState<Slide[]>([INITIAL_SLIDE]);
  const [currentSlideId, setCurrentSlideId] = useState<string>('1');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [mode, setMode] = useState<PresentationMode>('edit');
  const [activeTab, setActiveTab] = useState('Home');
  const [presentationTitle, setPresentationTitle] = useState('Presentation 1');

  const currentSlide = slides.find(s => s.id === currentSlideId) || slides[0];

  const addSlide = () => {
    const newSlide: Slide = {
      id: Math.random().toString(36).substr(2, 9),
      elements: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'text',
          x: 5,
          y: 5,
          width: 90,
          height: 10,
          content: 'Add Title',
          style: { fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }
        }
      ],
      background: currentSlide.background
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideId(newSlide.id);
  };

  const deleteSlide = (id: string) => {
    if (slides.length === 1) return;
    const newSlides = slides.filter(s => s.id !== id);
    setSlides(newSlides);
    if (currentSlideId === id) {
      setCurrentSlideId(newSlides[0].id);
    }
  };

  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
    setSlides(slides.map(s => s.id === slideId ? { ...s, ...updates } : s));
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    const newElements = currentSlide.elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateSlide(currentSlideId, { elements: newElements });
  };

  const addElement = (type: 'text' | 'shape', shapeType?: string) => {
    const newElement: SlideElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 35,
      y: 35,
      width: type === 'text' ? 30 : 15,
      height: type === 'text' ? 10 : 15,
      content: type === 'text' ? 'New Text Box' : '',
      style: type === 'text' ? { fontSize: '20px' } : { backgroundColor: '#b7472a', borderRadius: shapeType === 'circle' ? '999px' : '0' }
    };
    updateSlide(currentSlideId, { elements: [...currentSlide.elements, newElement] });
    setSelectedElementId(newElement.id);
  };

  const selectedElement = currentSlide.elements.find(el => el.id === selectedElementId);

  // Presenter Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'present') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        const nextIdx = slides.findIndex(s => s.id === currentSlideId) + 1;
        if (nextIdx < slides.length) setCurrentSlideId(slides[nextIdx].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        const prevIdx = slides.findIndex(s => s.id === currentSlideId) - 1;
        if (prevIdx >= 0) setCurrentSlideId(slides[prevIdx].id);
      } else if (e.key === 'Escape') {
        setMode('edit');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentSlideId, slides]);

  const handleElementDrag = useCallback((id: string, dx: number, dy: number) => {
    const el = currentSlide.elements.find(e => e.id === id);
    if (!el) return;
    updateElement(id, {
      x: Math.max(0, Math.min(100 - el.width, el.x + dx)),
      y: Math.max(0, Math.min(100 - el.height, el.y + dy))
    });
  }, [currentSlide.elements, updateElement]);

  if (mode === 'present') {
    const getTransition = () => {
      switch (currentSlide.transition) {
        case 'fade': return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } };
        case 'slide': return { initial: { x: '100%' }, animate: { x: 0 }, transition: { type: 'spring', damping: 20 } };
        case 'zoomX': return { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.4 } };
        default: return { initial: { opacity: 1 }, animate: { opacity: 1 } };
      }
    };

    const transProps = getTransition();

    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden cursor-none">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={() => setMode('edit')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="w-full h-full max-w-[100vw] max-h-[100vh] flex items-center justify-center">
           <AnimatePresence mode="wait">
             <motion.div 
              key={currentSlide.id}
              {...transProps}
              className="relative shadow-2xl overflow-hidden aspect-video w-full m-8"
              style={{ backgroundColor: currentSlide.background }}
            >
              {currentSlide.elements.map(el => (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: `${el.height}%`,
                    ...el.style
                  }}
                  className="flex items-center justify-center pointer-events-none"
                >
                  {el.content}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-sm font-medium tracking-widest">
          {slides.findIndex(s => s.id === currentSlideId) + 1} / {slides.length}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f3f2f1] font-sans text-[#323130] overflow-hidden">
      {/* Top Banner / Title Bar */}
      <header className="h-12 bg-[#b7472a] flex items-center px-4 justify-between shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
            <div className="w-4 h-4 bg-[#b7472a]"></div>
          </div>
          <div className="flex items-center gap-3">
             <input 
              className="text-white font-semibold text-sm bg-transparent border-none outline-none focus:ring-1 focus:ring-white/20 rounded px-1 transition-all"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
            />
            <div className="bg-[#a23e25] px-3 py-0.5 rounded text-[10px] text-white">Saved</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input 
              placeholder="Search"
              className="bg-white/20 text-xs py-1 pl-9 pr-3 rounded text-white placeholder:text-white/60 border border-transparent focus:bg-white focus:text-[#323130] focus:placeholder:text-gray-400 transition-all outline-none" 
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white/20 flex items-center justify-center text-white text-xs font-bold">
            JD
          </div>
        </div>
      </header>

      {/* Ribbon Navigation */}
      <nav className="h-28 bg-white border-b border-gray-200 flex flex-col shrink-0 select-none">
        <div className="flex px-4 gap-6 text-sm pt-2">
          {['File', 'Home', 'Insert', 'Draw', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Review', 'View'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 text-xs transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === tab 
                  ? 'border-b-2 border-[#b7472a] font-semibold text-[#323130]' 
                  : 'opacity-70 hover:opacity-100 text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center px-4 gap-2 py-2 overflow-hidden">
           <div className="h-full border-r border-gray-100 flex items-center pr-2">
              {activeTab === 'Home' && <HomeRibbon addSlide={addSlide} addElement={addElement} deleteSlide={() => deleteSlide(currentSlideId)} />}
              {activeTab === 'Insert' && <InsertRibbon addElement={addElement} />}
              {activeTab === 'Design' && <DesignRibbon currentSlide={currentSlide} onUpdate={(upd) => updateSlide(currentSlideId, upd)} />}
              {activeTab === 'Transitions' && <TransitionsRibbon currentSlide={currentSlide} onUpdate={(upd) => updateSlide(currentSlideId, upd)} />}
              {!['Home', 'Insert', 'Design', 'Transitions'].includes(activeTab) && (
                <div className="text-[10px] text-gray-400 italic px-4">Coming soon...</div>
              )}
           </div>

           <div className="flex-1 flex items-center px-4">
              <AnimatePresence mode="wait">
                {selectedElement && selectedElement.type === 'text' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
                       <select 
                        className="text-xs bg-gray-50 border border-gray-200 rounded px-2 outline-none h-8 min-w-[100px]"
                        value={selectedElement.style?.fontSize as string || '20px'}
                        onChange={(e) => updateElement(selectedElement.id, { style: { ...selectedElement.style, fontSize: e.target.value } })}
                       >
                         {['12px', '16px', '20px', '24px', '32px', '48px', '64px', '96px'].map(size => (
                           <option key={size} value={size}>{size}</option>
                         ))}
                       </select>
                       <div className="flex gap-1">
                          <button 
                            onClick={() => updateElement(selectedElement.id, { style: { ...selectedElement.style, fontWeight: selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold' } })}
                            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${selectedElement.style?.fontWeight === 'bold' ? 'bg-[#b7472a] text-white' : 'hover:bg-gray-100 text-sm font-bold'}`}
                          >B</button>
                          <button className="w-6 h-6 flex items-center justify-center italic hover:bg-gray-100 rounded text-sm">I</button>
                          <button className="w-6 h-6 flex items-center justify-center underline hover:bg-gray-100 rounded text-sm text-sm">U</button>
                       </div>
                    </div>
                    <input 
                      type="color" 
                      className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0 overflow-hidden"
                      value={(selectedElement.style?.color as string) || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { style: { ...selectedElement.style, color: e.target.value } })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <div className="flex items-center gap-4 border-l border-gray-100 pl-4 h-full">
              <button 
                onClick={() => setMode('present')}
                className="flex flex-col items-center justify-center gap-1 h-full px-4 hover:bg-gray-50 rounded transition-colors text-[#b7472a]"
              >
                <Play size={20} fill="currentColor" />
                <span className="text-[10px] font-semibold">Present</span>
              </button>
           </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Slide Selector */}
        <aside className="w-48 bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-4 shrink-0 shadow-sm scrollbar-hide">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id}
              className="flex flex-col gap-1 items-center group cursor-pointer"
              onClick={() => {
                setCurrentSlideId(slide.id);
                setSelectedElementId(null);
              }}
            >
              <span className={`self-start text-[10px] font-medium transition-colors ${currentSlideId === slide.id ? 'text-[#b7472a]' : 'text-gray-400'}`}>
                {idx + 1}
              </span>
              <div 
                className={`w-full aspect-video border-2 transition-all relative overflow-hidden bg-white shadow-sm rounded-sm ${
                  currentSlideId === slide.id 
                    ? 'border-[#b7472a]' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: slide.background }}
              >
                {slide.elements.map(el => (
                  <div 
                    key={el.id}
                    className="absolute bg-gray-200"
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.width}%`,
                      height: `${el.height}%`,
                    }}
                  />
                ))}
                {slides.length > 1 && (
                  <button 
                    className="absolute top-1 right-1 p-1 bg-white shadow-md hover:bg-red-500 hover:text-white rounded transition-all opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide.id);
                    }}
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button 
            onClick={addSlide}
            className="w-full h-12 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#b7472a] hover:border-[#b7472a] hover:bg-orange-50/30 transition-all rounded text-[10px] font-semibold uppercase tracking-widest mt-2"
          >
            New Slide
          </button>
        </aside>

        {/* Main Canvas Area */}
        <section className="flex-1 relative flex items-center justify-center p-8 bg-[#e1e1e1] overflow-auto">
          <div 
            className="aspect-video w-full max-w-[900px] bg-white shadow-2xl relative overflow-hidden ring-1 ring-black/5"
            style={{ backgroundColor: currentSlide.background }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelectedElementId(null);
            }}
          >
            {currentSlide.elements.map(el => (
              <DraggableElement
                key={el.id}
                element={el}
                isSelected={selectedElementId === el.id}
                onSelect={() => setSelectedElementId(el.id)}
                onUpdate={(upd) => updateElement(el.id, upd)}
                onDrag={handleElementDrag}
                onDelete={() => {
                  updateSlide(currentSlideId, { 
                    elements: currentSlide.elements.filter(e => e.id !== el.id) 
                  });
                  setSelectedElementId(null);
                }}
              />
            ))}
          </div>
        </section>

        {/* Designer Panel */}
        <aside className="w-64 bg-white border-l border-gray-200 p-4 shrink-0 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-sm">Designer</h2>
            <X size={14} className="text-gray-400 cursor-pointer" />
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="w-full h-32 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-center p-4 text-[10px] text-gray-500 italic">
              Generating design suggestions...
            </div>
            <div className="w-full h-24 bg-gradient-to-br from-[#b7472a] to-orange-400 rounded p-4 flex flex-col justify-end text-white text-[10px] shadow-sm transform hover:scale-[1.02] transition-transform cursor-pointer">
              <span className="font-bold">Modern Theme</span>
            </div>
            <div className="w-full h-24 bg-gray-800 rounded p-4 flex flex-col justify-end text-white text-[10px] shadow-sm transform hover:scale-[1.02] transition-transform cursor-pointer">
              <span className="font-bold">Editorial Hero</span>
            </div>
            <div className="w-full h-24 bg-blue-900 rounded p-4 flex flex-col justify-end text-white text-[10px] shadow-sm transform hover:scale-[1.02] transition-transform cursor-pointer">
              <span className="font-bold">Tech Corporate</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-6 bg-[#f3f2f1] border-t border-gray-200 flex items-center px-3 justify-between text-[11px] text-gray-600 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="hover:bg-gray-200 px-2 h-full flex items-center transition-colors cursor-default">
            Slide {slides.findIndex(s => s.id === currentSlideId) + 1} of {slides.length}
          </div>
          <div className="h-3 w-[1px] bg-gray-300" />
          <div className="hover:bg-gray-200 px-2 h-full flex items-center transition-colors cursor-default capitalize">
            English (United States)
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-2 items-center hover:text-gray-900 cursor-pointer transition-colors">
            <Layout size={10} className="text-gray-400" />
            <span>Notes</span>
          </div>
          <div className="flex gap-2 items-center hover:text-gray-900 cursor-pointer transition-colors">
            <Search size={10} className="text-gray-400" />
            <span>Comments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 bg-gray-200 rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-3/4 bg-[#b7472a]"></div>
            </div>
            <span className="font-bold">75%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomeRibbon({ addSlide, addElement, deleteSlide }: { addSlide: () => void; addElement: (t: 'text' | 'shape') => void; deleteSlide: () => void }) {
  return (
    <>
      <RibbonGroup label="Clipboard">
        <div className="flex flex-col gap-1 items-center justify-center h-full cursor-pointer group">
          <div className="w-6 h-6 bg-gray-100 rounded mb-1"></div>
          <span className="text-[10px]">Paste</span>
        </div>
      </RibbonGroup>
      <RibbonGroup label="Slides">
        <div className="grid grid-cols-4 gap-2 items-center">
          <div 
            onClick={addSlide}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-5 h-5 bg-gray-100 group-hover:bg-[#b7472a]/10 rounded mb-1 transition-colors"></div>
            <span className="text-[10px]">New Slide</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 bg-gray-100 rounded mb-1"></div>
            <span className="text-[10px]">Layout</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 bg-gray-100 rounded mb-1"></div>
            <span className="text-[10px]">Reset</span>
          </div>
          <div onClick={deleteSlide} className="flex flex-col items-center cursor-pointer group">
             <div className="w-5 h-5 bg-red-50 group-hover:bg-red-100 rounded mb-1 transition-colors"></div>
             <span className="text-[10px]">Delete</span>
          </div>
        </div>
      </RibbonGroup>
      <RibbonGroup label="Drawing">
        <div className="flex items-center gap-4">
           <div 
            onClick={() => addElement('text')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-6 h-6 bg-gray-100 rounded mb-1"></div>
            <span className="text-[10px]">Text</span>
          </div>
          <div 
            onClick={() => addElement('shape')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-6 h-6 bg-gray-100 rounded mb-1"></div>
            <span className="text-[10px]">Shapes</span>
          </div>
        </div>
      </RibbonGroup>
    </>
  );
}

function InsertRibbon({ addElement }: { addElement: (t: 'text' | 'shape', st?: string) => void }) {
  return (
    <>
      <RibbonGroup label="Illustration">
        <div className="flex gap-2">
          <div onClick={() => addElement('shape')} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px]">
             <Square size={20} />
             <span className="text-[9px]">Shape</span>
          </div>
          <div onClick={() => addElement('shape', 'circle')} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px]">
             <Circle size={20} />
             <span className="text-[9px]">Circle</span>
          </div>
          <div onClick={() => addElement('shape', 'triangle')} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px]">
             <Triangle size={20} />
             <span className="text-[9px]">Triangle</span>
          </div>
        </div>
      </RibbonGroup>
      <RibbonGroup label="AI Pro">
        <div className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-purple-100 cursor-pointer hover:shadow-sm transition-all group">
           <Sparkles size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
           <span className="text-[9px] font-bold text-purple-700">AI Design</span>
        </div>
      </RibbonGroup>
    </>
  );
}

function DesignRibbon({ onUpdate, currentSlide }: { currentSlide: Slide; onUpdate: (upd: Partial<Slide>) => void }) {
  return (
    <>
      <RibbonGroup label="Themes">
        <div className="flex gap-2">
           {THEMES.map(theme => (
             <div 
              key={theme.name}
              onClick={() => onUpdate({ background: theme.bg })}
              className={`w-16 h-12 rounded border-2 cursor-pointer transition-all flex flex-col items-center justify-center p-1 relative group ${currentSlide.background === theme.bg ? 'border-[#b7472a]' : 'border-gray-200 hover:border-gray-300'}`}
              style={{ background: theme.bg }}
             >
               <div className="text-[8px] font-bold" style={{ color: theme.text }}>{theme.name}</div>
               <div className="mt-1 w-4 h-1 rounded-full" style={{ background: theme.accent }} />
             </div>
           ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Customize">
         <div className="flex flex-col gap-1 p-1">
            <div className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
               <Palette size={14} />
               <span className="text-[9px] font-medium">Format Background</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
               <Maximize2 size={14} />
               <span className="text-[9px] font-medium">Slide Size</span>
            </div>
         </div>
      </RibbonGroup>
    </>
  );
}

function TransitionsRibbon({ currentSlide, onUpdate }: { currentSlide: Slide; onUpdate: (upd: Partial<Slide>) => void }) {
  const animations: { id: Slide['transition']; label: string; icon: any }[] = [
    { id: 'none', label: 'None', icon: Square },
    { id: 'fade', label: 'Fade', icon: Sparkles },
    { id: 'slide', label: 'Push', icon: Layout },
    { id: 'zoomX', label: 'Zoom', icon: Maximize2 },
  ];

  return (
    <>
      <RibbonGroup label="Transition to This Slide">
        <div className="flex gap-2">
           {animations.map(anim => (
             <div 
              key={anim.id}
              onClick={() => onUpdate({ transition: anim.id })}
              className={`flex flex-col items-center gap-1 p-2 rounded border-2 transition-all cursor-pointer min-w-[64px] ${currentSlide.transition === anim.id ? 'border-[#b7472a] bg-orange-50/50' : 'border-transparent hover:bg-gray-50'}`}
             >
               <anim.icon size={20} className={currentSlide.transition === anim.id ? 'text-[#b7472a]' : 'text-gray-400'} />
               <span className="text-[9px] font-medium">{anim.label}</span>
             </div>
           ))}
        </div>
      </RibbonGroup>
    </>
  );
}

function RibbonGroup({ label, children, className = "" }: { label: string; children: ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col items-center h-full px-2 ${className}`}>
      <div className="flex-1 flex gap-1 items-center">
        {children}
      </div>
      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-0.5 select-none">{label}</span>
    </div>
  );
}

interface DraggableProps {
  element: SlideElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onDrag: (id: string, dx: number, dy: number) => void;
  onDelete: () => void;
}

const DraggableElement: FC<DraggableProps> = ({ element, isSelected, onSelect, onUpdate, onDrag, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = ((e.clientX - dragStartPos.current.x) / window.innerWidth) * 100;
      const dy = ((e.clientY - dragStartPos.current.y) / window.innerHeight) * 100;
      onDrag(element.id, dx, dy);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };

    if (isSelected) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelected, element.id, onDrag]);

  const onMouseDown = (e: ReactMouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    onSelect();
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = 'move';
  };
  
  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (element.type === 'text') setIsEditing(true);
      }}
      style={{
        position: 'absolute',
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        ...element.style,
        border: isSelected ? '2px solid #b7472a' : '1px solid transparent',
        cursor: isEditing ? 'text' : 'move',
        userSelect: 'none',
        zIndex: isSelected ? 10 : 1
      }}
      className={`group flex items-center justify-center transition-all ${!isSelected && 'hover:border-gray-200 hover:bg-gray-50/20'}`}
    >
      {isSelected && (
        <div className="absolute -top-4 -right-4 z-20">
           <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 scale-90"
           >
             <X size={12} />
           </button>
        </div>
      )}
      
      {element.type === 'text' ? (
        isEditing ? (
          <textarea
            autoFocus
            className="w-full h-full bg-white/10 backdrop-blur-sm resize-none outline-none text-center p-2 border border-[#b7472a]/30"
            value={element.content}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onBlur={() => setIsEditing(false)}
          />
        ) : (
          <div className="w-full h-full p-2 text-center whitespace-pre-wrap break-words overflow-hidden pointer-events-none select-none">
            {element.content}
          </div>
        )
      ) : (
        <div 
          className="w-full h-full" 
          style={{ 
            backgroundColor: (element.style?.backgroundColor as string) || '#ccc',
            borderRadius: element.style?.borderRadius || '0'
          }} 
        />
      )}

      {isSelected && !isEditing && (
        <>
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#b7472a] rounded-sm ring-1 ring-black/10" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#b7472a] rounded-sm ring-1 ring-black/10" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#b7472a] rounded-sm ring-1 ring-black/10" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#b7472a] rounded-sm ring-1 ring-black/10" />
          {/* Edge drag indicators */}
          <div className="absolute top-0 inset-x-0 h-1 cursor-ns-resize" />
          <div className="absolute bottom-0 inset-x-0 h-1 cursor-ns-resize" />
          <div className="absolute left-0 inset-y-0 w-1 cursor-ew-resize" />
          <div className="absolute right-0 inset-y-0 w-1 cursor-ew-resize" />
        </>
      )}
    </div>
  );
}
