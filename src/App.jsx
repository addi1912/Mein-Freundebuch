import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User, Music, Book, Film, Save, Plus, Trash2, X, Eye, Loader2,
  Instagram, Ghost, Twitter, MapPin, Image as ImageIcon, Smile,
  Languages, Search, CheckCircle2, Play, Pause, ArrowRightLeft,
  Quote, Gamepad2, Clock, Globe, ImagePlus, PlaneTakeoff, Star,
  Users, Heart, Utensils, Camera, Palette, Check, Download,
  Calendar, Sparkles, PenTool, Hash, Mail, Linkedin, Mic, Square,
  AudioLines, Trophy, BarChart2, Hourglass, PawPrint, StickyNote,
  Backpack, Smartphone, Briefcase, HelpCircle, Images, Lightbulb,
  Swords, Shield, Link as LinkIcon, Tractor, Ticket, Database, Flag, Gift, Skull, Youtube, Podcast, Video, Twitch, Monitor, Lock, Unlock, Key, Zap, MousePointerClick, Puzzle, Calculator, Grid3x3, Circle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ⚠️ DEINE FIREBASE CONFIGURATION KOMMT HIER HINEIN:
const fallbackConfig = {
  apiKey: "AIzaSyCIWTav_h1lkWFg_NFcFhnJ-qLfJBeEmHE",
  authDomain: "mein-freundebuch.firebaseapp.com",
  projectId: "mein-freundebuch",
  storageBucket: "mein-freundebuch.firebasestorage.app",
  messagingSenderId: "1:1040024985833:web:a62aa9b2870fb4a1ba1078",
  appId: "DEINE_APP_ID"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : fallbackConfig;
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "DEINE_API_KEY";

let app, auth, db;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'mein-freundebuch';

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 10 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const calculateCurrentStreak = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.abs(today - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getZodiac = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const d = date.getDate();
  const m = date.getMonth() + 1;
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return { sign: 'Widder', emoji: '♈' };
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return { sign: 'Stier', emoji: '♉' };
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return { sign: 'Zwillinge', emoji: '♊' };
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return { sign: 'Krebs', emoji: '♋' };
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return { sign: 'Löwe', emoji: '♌' };
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return { sign: 'Jungfrau', emoji: '♍' };
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return { sign: 'Waage', emoji: '♎' };
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return { sign: 'Skorpion', emoji: '♏' };
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return { sign: 'Schütze', emoji: '♐' };
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return { sign: 'Steinbock', emoji: '♑' };
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return { sign: 'Wassermann', emoji: '♒' };
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return { sign: 'Fische', emoji: '♓' };
  return null;
};

const getAge = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  const birthDate = new Date(dateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getSpotifyEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/open\.spotify\.com\/(show|episode)\/([a-zA-Z0-9]+)/);
  if (match) {
    const type = match[1];
    const id = match[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }
  return null;
};

// --- Sub-Komponenten ---

const SearchBar = ({ type, onSelect }) => {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  const performSearch = async (query) => {
    try {
      let searchResults = [];
      const encodedQuery = encodeURIComponent(query);
      if (type === 'music') {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodedQuery}&entity=song&limit=5`);
        const data = await res.json();
        searchResults = (data.results || []).map(t => ({ id: `music-${t.trackId}`, title: t.trackName, subtitle: t.artistName, image: t.artworkUrl100?.replace('100x100', '600x600'), previewUrl: t.previewUrl }));
      } else if (type === 'books') {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=5`);
        const data = await res.json();
        searchResults = (data.items || []).map(b => ({ id: `book-${b.id}`, title: b.volumeInfo.title, subtitle: b.volumeInfo.authors?.join(', ') || 'Unbekannter Autor', image: b.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '' }));
      } else if (type === 'movies') {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodedQuery}&entity=movie&limit=8&lang=de_de&country=de`);
        const data = await res.json();
        searchResults = (data.results || []).map(m => ({ id: `movie-${m.trackId}`, title: m.trackName, subtitle: m.primaryGenreName || 'Film', image: m.artworkUrl100?.replace('100x100', '600x900') }));
      } else if (type === 'games') {
        const res = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodedQuery}&limit=5`);
        const data = await res.json();
        searchResults = (data || []).map(g => ({ id: `game-${g.gameID}`, title: g.external, subtitle: 'PC/Konsole', image: g.thumb?.includes('steamstatic') ? g.thumb.replace('capsule_sm_120', 'header') : g.thumb }));
      } else if (type === 'creators') {
        const res = await fetch(`https://de.wikipedia.org/w/api.php?action=query&generator=prefixsearch&gpssearch=${encodedQuery}&gpslimit=5&prop=pageimages|description&piprop=thumbnail&pithumbsize=400&format=json&origin=*`);
        const data = await res.json();
        const pages = Object.values(data.query?.pages || {});
        searchResults = pages.sort((a, b) => (a.index || 0) - (b.index || 0)).map(p => ({ id: `creator-${p.pageid}`, title: p.title, subtitle: p.description || 'Content Creator', image: p.thumbnail?.source }));
      }
      setResults(searchResults);
    } catch (error) {
      console.error("Suche fehlgeschlagen", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setTerm(val);
    
    if (val.length < 2) {
      setOpen(false);
      setResults([]);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      return;
    }

    setOpen(true);
    setLoading(true);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(val);
    }, 500);
  };

  const selectItem = (item) => {
    onSelect(item);
    setTerm('');
    setResults([]);
    setOpen(false);
  };

  const Icon = type === 'music' ? Music : type === 'books' ? Book : type === 'movies' ? Film : type === 'creators' ? Video : Gamepad2;
  const customImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f1f5f9'/%3E%3Cpath d='M200 150a50 50 0 1 0 0 100 50 50 0 0 0 0-100z' fill='%23cbd5e1'/%3E%3C/svg%3E";

  return (
    <div className="relative mb-6">
      <div className="relative">
        <input type="text" value={term} onChange={handleInputChange} placeholder={`${type === 'music' ? 'Song' : type === 'books' ? 'Buch' : type === 'movies' ? 'Film/Serie' : type === 'creators' ? 'Creator' : 'Spiel'} suchen...`} className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 font-bold focus:ring-2 focus:ring-slate-500/10 text-base outline-none" />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Icon size={20} />}
        </div>
      </div>
      {open && term.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-64 overflow-y-auto">
          
          <div className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 bg-slate-50/50" onClick={() => selectItem({ id: `custom-${Date.now()}`, title: term, subtitle: 'Eigener Eintrag', image: customImg })}>
            <div className={`w-12 flex items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-lg text-slate-400 shrink-0 ${type === 'games' ? 'aspect-video' : 'h-16'}`}>
              <Plus size={18} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-slate-900 font-bold text-xs">"{term}" hinzufügen</p>
              <p className="text-[10px] text-slate-500 truncate">Benutzerdefinierter Eintrag</p>
            </div>
          </div>

          {results.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0" onClick={() => selectItem(item)}>
              {item.image ? (
                <img src={item.image} className={`w-12 rounded-lg object-cover ${type === 'games' ? 'aspect-video' : 'h-16'}`} alt="" />
              ) : (
                <div className="w-10 h-14 bg-slate-100 rounded-lg flex items-center justify-center"><ImageIcon size={14} className="text-slate-300" /></div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-slate-900 font-bold text-xs">{item.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>
              </div>
            </div>
          ))}

          {loading && results.length === 0 && (
            <div className="p-4 text-center text-xs font-bold text-slate-400 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" size={14} /> Suche in der Datenbank...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PreviewMusicCard = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
      <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
        <img src={song.image} className="w-full h-full object-cover" alt={song.title} />
        {song.previewUrl && (
          <>
            <audio ref={audioRef} src={song.previewUrl} onEnded={() => setIsPlaying(false)} />
            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur p-2 rounded-full text-slate-800 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
              </div>
            </button>
          </>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-black uppercase leading-tight truncate text-slate-800">{song.title}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase truncate mt-0.5">{song.subtitle}</p>
      </div>
    </div>
  );
};

const PreviewQuizCard = ({ item, themeConfig }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="relative w-full aspect-video perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`w-full h-full transition-transform duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute inset-0 backface-hidden bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm group-hover:shadow-md transition-shadow">
          <HelpCircle className="text-slate-300 mb-2 shrink-0" size={24} />
          <p className="font-bold text-[11px] sm:text-xs text-slate-800 leading-snug line-clamp-3">{item.question}</p>
          <p className="absolute bottom-3 text-[8px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><ArrowRightLeft size={10} /> Drehen</p>
        </div>
        <div className={`absolute inset-0 backface-hidden ${themeConfig.bg} text-white rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-md rotate-y-180`}>
          <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest shrink-0">Antwort</p>
          <p className="font-black text-sm sm:text-base leading-snug overflow-y-auto no-scrollbar">{item.answer}</p>
        </div>
      </div>
    </div>
  );
};

const VoiceNoteWidget = ({ audioData, onSave, themeConfig }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const formatTime = (secs) => `00:${secs.toString().padStart(2, '0')}`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioType = audioChunksRef.current[0]?.type || mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: audioType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => onSave(reader.result);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 59) { stopRecording(); return 60; }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Mikrofon Zugriff verweigert", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
      else { await audioRef.current.play(); setIsPlaying(true); }
    } catch (err) {
      console.error("Fehler beim Abspielen", err);
      setIsPlaying(false);
    }
  };

  if (audioData) {
    return (
      <div className={`flex items-center gap-3 bg-white p-3 rounded-2xl border-2 ${themeConfig.dashed} shadow-sm`}>
        <audio ref={audioRef} src={audioData} onEnded={() => setIsPlaying(false)} />
        <button onClick={togglePlay} className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full ${themeConfig.bg} text-white shadow-md hover:scale-105 transition-transform`}>
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="flex-1 flex items-center gap-2 text-slate-400">
          <AudioLines size={20} className={isPlaying ? `${themeConfig.text} animate-pulse` : ''} />
          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${themeConfig.bg} transition-all duration-300`} style={{ width: isPlaying ? '100%' : '0%' }}></div>
          </div>
        </div>
        <button onClick={() => onSave(null)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isRecording ? <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> : <Mic size={18} className="text-slate-400" />}
        <span className={`font-bold text-sm ${isRecording ? 'text-red-500' : 'text-slate-600'}`}>{isRecording ? `Aufnahme... ${formatTime(recordingTime)} / 01:00` : 'Audio-Gruß (max. 1 Min)'}</span>
      </div>
      {isRecording ? (
        <button onClick={stopRecording} className="flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-red-200 transition-colors"><Square size={12} fill="currentColor" /> Stop</button>
      ) : (
        <button onClick={startRecording} className={`flex items-center gap-1.5 ${themeConfig.bgLight} ${themeConfig.text} px-3 py-1.5 rounded-lg text-xs font-black uppercase ${themeConfig.hover} transition-colors`}>Aufnehmen</button>
      )}
    </div>
  );
};

const SignaturePad = ({ onSave, initialSignature, themeConfig }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preventScroll = (e) => e.preventDefault();
    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    return () => canvas.removeEventListener('touchmove', preventScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && initialSignature && !hasDrawn) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialSignature;
    }
  }, [initialSignature, hasDrawn]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches && e.touches.length > 0) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDrawing = (e) => {
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    onSave(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    onSave(null);
  };

  return (
    <div className="space-y-2">
      <div className={`border-2 border-dashed ${themeConfig.dashed} rounded-2xl overflow-hidden relative bg-white`}>
        <div className="relative">
          {!hasDrawn && !initialSignature && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <span className="font-serif italic text-2xl text-slate-300">Unterschreiben...</span>
            </div>
          )}
          <canvas ref={canvasRef} width={600} height={200} className="w-full h-32 touch-none cursor-crosshair relative z-10" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
          {(hasDrawn || initialSignature) && (
            <button onClick={clear} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full shadow-sm hover:scale-110 transition-transform z-20"><Trash2 size={16} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

const TravelMap = ({ travels }) => {
  if (!travels) return null;
  const mappedTravels = travels.filter(t => t.lat !== undefined && t.lon !== undefined && !isNaN(t.lat) && !isNaN(t.lon));
  const visitedTravels = travels.filter(t => t.status !== 'planned');
  const validFlags = visitedTravels.map(t => t.flag).filter(f => f && f !== '');
  const uniqueCountries = new Set(validFlags).size;
  const TOTAL_COUNTRIES = 195;
  const worldPercentage = ((uniqueCountries / TOTAL_COUNTRIES) * 100).toFixed(1);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between border-b border-teal-100 pb-2 mb-3">
        <p className="text-[10px] font-black uppercase text-teal-500 tracking-[0.2em] flex items-center gap-2"><Globe size={12} /> Deine Weltkarte</p>
        <div className="flex items-center gap-2">
          <div className="text-[9px] font-bold text-teal-600 uppercase bg-teal-50 px-2 py-1 rounded-lg">{uniqueCountries} Länder {visitedTravels.length} Orte</div>
          <div className="text-[9px] font-black text-white uppercase bg-teal-500 px-2 py-1 rounded-lg shadow-sm">{worldPercentage}% der Welt</div>
        </div>
      </div>
      <div className="relative w-full aspect-[2/1] bg-[#eef7f9] rounded-3xl overflow-hidden shadow-inner border border-slate-200">
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" className="w-full h-full object-fill opacity-60" alt="Weltkarte" onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/c/c4/Earthmap1000x500compac.jpg"; e.target.className = "w-full h-full object-fill grayscale opacity-40 mix-blend-multiply" }} />
        {travels.length > 0 && mappedTravels.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-0">
            <p className="text-xs font-bold text-slate-500 text-center px-4 bg-white/80 p-3 rounded-xl shadow-sm">Alte Einträge haben keine Koordinaten.<br />Füge eine neue Reise hinzu, um die Karte zu aktivieren!</p>
          </div>
        )}
        {mappedTravels.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-col gap-1 bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-slate-200/50 z-10">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-600 uppercase"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Besucht</div>
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-600 uppercase"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Geplant</div>
          </div>
        )}
        {mappedTravels.map(travel => {
          const x = ((travel.lon + 180) / 360) * 100;
          const y = ((90 - travel.lat) / 180) * 100;
          const isPlanned = travel.status === 'planned';
          const pinColor = isPlanned ? 'text-orange-500 fill-orange-100' : 'text-teal-600 fill-teal-100';
          return (
            <div key={travel.id} className="absolute transform -translate-x-1/2 -translate-y-full group cursor-pointer z-10 hover:z-50 transition-all duration-300" style={{ left: `${x}%`, top: `${y}%` }}>
              <div className="relative transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-2">
                <MapPin size={24} className={`${pinColor} drop-shadow-md`} />
                <span className="absolute -top-1 -right-2 text-xs">{travel.flag}</span>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-2xl text-[10px] font-bold whitespace-nowrap pointer-events-none z-20">
                {travel.resolvedName || travel.name || travel.city} {isPlanned && '(Geplant)'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PreviewSecretMessage = ({ data, themeConfig }) => {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (input.trim().toLowerCase() === (data.answer || '').trim().toLowerCase()) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  if (!data || !data.message) return null;

  if (unlocked) {
    return (
      <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden shadow-sm animate-in zoom-in-95">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Unlock size={60} /></div>
        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] mb-4 flex items-center gap-2"><Unlock size={12} /> Geheimnis gelüftet</p>
        <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{data.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-[2.5rem] border border-slate-700 relative overflow-hidden shadow-sm text-white text-left">
      <div className="absolute top-0 right-0 p-4 opacity-10"><Lock size={60} /></div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 flex items-center gap-2"><Lock size={12} /> Secret Message</p>
      
      <div className="space-y-4 relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-300 mb-1">Sicherheitsfrage:</p>
          <p className="text-lg font-black text-white leading-tight">{data.question || 'Wie lautet das Passwort?'}</p>
        </div>
        
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} placeholder="Antwort..." className={`flex-1 bg-slate-700/50 border-2 ${error ? 'border-red-500' : 'border-slate-600'} rounded-xl px-4 py-3 font-bold text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors`} />
          <button onClick={handleUnlock} className="bg-indigo-500 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors font-bold"><Key size={20} /></button>
        </div>
        {error && <p className="text-[10px] font-black text-red-400 uppercase animate-pulse">Falsche Antwort!</p>}
      </div>
    </div>
  );
};

const ReactionGame = ({ highScore, onNewHighScore }) => {
  const [status, setStatus] = useState('idle'); // idle, waiting, ready, result, early
  const [time, setTime] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const handleStart = () => {
    setStatus('waiting');
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5s
    timerRef.current = setTimeout(() => {
      setStatus('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (status === 'idle' || status === 'result' || status === 'early') {
      handleStart();
    } else if (status === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus('early');
    } else if (status === 'ready') {
      const endTime = Date.now();
      const reaction = endTime - startTimeRef.current;
      setTime(reaction);
      setStatus('result');
      if (highScore === null || reaction < highScore) {
        onNewHighScore(reaction);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  let content;
  let bgColor = 'bg-slate-100';

  if (status === 'idle') {
    content = <><Zap size={48} className="text-slate-400 mb-2" /><p className="font-black text-slate-600 uppercase text-sm">Klicken zum Starten</p></>;
    bgColor = 'bg-slate-100 hover:bg-slate-200 cursor-pointer';
  } else if (status === 'waiting') {
    content = <p className="font-black text-white text-xl uppercase">Warten...</p>;
    bgColor = 'bg-red-500 cursor-pointer';
  } else if (status === 'ready') {
    content = <p className="font-black text-white text-2xl uppercase">KLICKEN!</p>;
    bgColor = 'bg-green-500 cursor-pointer';
  } else if (status === 'early') {
    content = <><p className="font-black text-white text-lg uppercase mb-1">Zu früh!</p><p className="text-white/80 text-xs font-bold">Nochmal versuchen</p></>;
    bgColor = 'bg-orange-400 cursor-pointer';
  } else if (status === 'result') {
    content = (
      <>
        <p className="font-black text-slate-800 text-4xl mb-2">{time} ms</p>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Klicken für Neustart</p>
      </>
    );
    bgColor = 'bg-white border-2 border-slate-100 cursor-pointer';
  }

  return (
    <div 
      onMouseDown={handleClick} 
      onTouchStart={(e) => { e.preventDefault(); handleClick(); }}
      className={`w-full aspect-video rounded-3xl flex flex-col items-center justify-center transition-all select-none shadow-sm ${bgColor}`}
    >
      {content}
    </div>
  );
};

const PizzaClickerGame = ({ highScore, onNewHighScore }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [clicks, setClicks] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  const startGame = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setIsFinished(false);
    setClicks(0);
    setTimeLeft(10);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev <= 1 ? 0 : prev - 1);
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft === 0 && isPlaying) {
      clearInterval(timerRef.current);
      setIsPlaying(false);
      setIsFinished(true);
      if (clicks > (highScore || 0)) {
        onNewHighScore(clicks);
      }
    }
  }, [timeLeft, isPlaying, clicks, highScore, onNewHighScore]);

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);

  const handleClick = () => {
    if (isPlaying) setClicks(prev => prev + 1);
    else startGame();
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex justify-between w-full px-4 font-black text-slate-400 text-xs uppercase tracking-widest"><span>Zeit: {timeLeft}s</span><span>Klicks: {clicks}</span></div>
      <button onMouseDown={handleClick} onTouchStart={(e) => { e.preventDefault(); handleClick(); }} className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl shadow-xl transition-all active:scale-90 active:shadow-inner ${isPlaying ? 'bg-orange-100 hover:bg-orange-200 scale-105' : 'bg-slate-100 hover:bg-slate-200'}`}>🍕</button>
      <p className="text-sm font-bold text-slate-500">
        {isPlaying ? 'Klicken so schnell du kannst!' : isFinished ? `Fertig! ${clicks} Klicks` : 'Tippe die Pizza zum Starten'}
      </p>
    </div>
  );
};

const SlidePuzzleGame = ({ image }) => {
  const SIZE = 3;
  const [tiles, setTiles] = useState([...Array(SIZE * SIZE).keys()]);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    shuffleTiles();
  }, []);

  const shuffleTiles = () => {
    let newTiles = [...Array(SIZE * SIZE).keys()];
    let emptyIdx = newTiles.indexOf(SIZE * SIZE - 1);
    let previousIdx = -1;

    for (let i = 0; i < 150; i++) {
      const possibleMoves = [];
      const row = Math.floor(emptyIdx / SIZE);
      const col = emptyIdx % SIZE;

      if (row > 0) possibleMoves.push(emptyIdx - SIZE);
      if (row < SIZE - 1) possibleMoves.push(emptyIdx + SIZE);
      if (col > 0) possibleMoves.push(emptyIdx - 1);
      if (col < SIZE - 1) possibleMoves.push(emptyIdx + 1);

      const validMoves = possibleMoves.filter(idx => idx !== previousIdx);
      if (validMoves.length > 0) {
        const moveIdx = validMoves[Math.floor(Math.random() * validMoves.length)];
        [newTiles[emptyIdx], newTiles[moveIdx]] = [newTiles[moveIdx], newTiles[emptyIdx]];
        previousIdx = emptyIdx;
        emptyIdx = moveIdx;
      }
    }
    setTiles(newTiles);
    setIsSolved(false);
  };

  const moveTile = (index) => {
    if (isSolved) return;
    const emptyIndex = tiles.indexOf(SIZE * SIZE - 1);
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const emptyRow = Math.floor(emptyIndex / SIZE);
    const emptyCol = emptyIndex % SIZE;

    if ((Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      if (newTiles.every((val, i) => val === i)) setIsSolved(true);
    }
  };

  if (!image) return null;

  return (
    <div className="flex flex-col items-center gap-4 select-none">
       <div className="relative w-64 h-64 bg-slate-200 rounded-xl overflow-hidden shadow-lg border-4 border-white">
         {isSolved && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black uppercase tracking-widest shadow-2xl transform scale-110">Gelöst! 🎉</div>
            </div>
         )}
         <div className="grid grid-cols-3 w-full h-full bg-slate-100">
           {tiles.map((tileNumber, index) => {
             if (tileNumber === SIZE * SIZE - 1) return <div key={`empty-${index}`} className="bg-slate-100/50" />;
             const x = (tileNumber % SIZE) * 100 / (SIZE - 1);
             const y = Math.floor(tileNumber / SIZE) * 100 / (SIZE - 1);
             return (
               <div key={tileNumber} onClick={() => moveTile(index)} className="w-full h-full cursor-pointer transition-all duration-200 border-[0.5px] border-white/40 hover:brightness-110"
                 style={{ backgroundImage: `url(${image})`, backgroundSize: `${SIZE * 100}% ${SIZE * 100}%`, backgroundPosition: `${x}% ${y}%` }}
               />
             );
           })}
         </div>
       </div>
       <button onClick={shuffleTiles} className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition-colors bg-slate-100 px-4 py-2 rounded-full">Mischen</button>
    </div>
  );
};

const MathDashGame = ({ highScore, onNewHighScore }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [problem, setProblem] = useState(null);
  const [input, setInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2000);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const generateProblem = () => {
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;
    if (op === '+') {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
    } else {
      a = Math.floor(Math.random() * 10) + 5;
      b = Math.floor(Math.random() * 5) + 1;
    }
    return { text: `${a} ${op} ${b}`, answer: op === '+' ? a + b : a - b };
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setStreak(0);
    nextProblem();
  };

  const nextProblem = () => {
    const p = generateProblem();
    setProblem(p);
    setInput('');
    setTimeLeft(2000);
    startTimeRef.current = Date.now();
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = 2000 - elapsed;
      if (remaining <= 0) {
        endGame();
      } else {
        setTimeLeft(remaining);
      }
    }, 50);
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setGameOver(true);
    setProblem(null);
    if (streak > (highScore || 0)) {
      onNewHighScore(streak);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (parseInt(val) === problem.answer) {
      setStreak(s => s + 1);
      nextProblem();
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {!isPlaying && !gameOver && (
        <div className="text-center">
           <div className="bg-blue-50 p-6 rounded-full mb-4 mx-auto w-24 h-24 flex items-center justify-center">
             <Calculator size={40} className="text-blue-500" />
           </div>
           <button onClick={startGame} className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-sm hover:bg-blue-600 transition-colors shadow-lg active:scale-95">Starten</button>
           <p className="text-xs font-bold text-slate-400 mt-4">2 Sekunden pro Aufgabe!</p>
        </div>
      )}
      
      {isPlaying && problem && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs font-black text-slate-400 uppercase mb-2">
            <span>Streak: {streak}</span>
            <span>Zeit: {(timeLeft/1000).toFixed(1)}s</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-blue-500 transition-all duration-75 ease-linear" style={{ width: `${(timeLeft/2000)*100}%` }}></div>
          </div>
          <div className="text-center">
            <p className="text-5xl font-black text-slate-800 mb-6">{problem.text}</p>
            <input 
              type="number" 
              value={input} 
              onChange={handleChange} 
              autoFocus 
              className="w-full bg-slate-50 border-2 border-blue-100 rounded-2xl py-4 text-center text-2xl font-black text-blue-600 outline-none focus:border-blue-500 transition-colors" 
              placeholder="?"
            />
          </div>
        </div>
      )}

      {gameOver && (
        <div className="text-center animate-in zoom-in-95">
          <p className="text-4xl mb-2">⏰</p>
          <h3 className="text-2xl font-black text-slate-800 mb-1">Vorbei!</h3>
          <p className="text-sm font-bold text-slate-500 mb-6">Du hast {streak} Aufgaben gelöst.</p>
          <button onClick={startGame} className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-sm hover:bg-blue-600 transition-colors shadow-lg active:scale-95">Nochmal</button>
        </div>
      )}
    </div>
  );
};

const WordleGame = ({ targetWord }) => {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const solution = (targetWord || '').toUpperCase();
  const WORD_LENGTH = solution.length;
  const MAX_GUESSES = 6;

  const handleType = (char) => {
    if (gameStatus !== 'playing') return;
    if (char === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) return;
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');
      if (currentGuess === solution) {
        setGameStatus('won');
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameStatus('lost');
      }
    } else if (char === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else {
      if (currentGuess.length < WORD_LENGTH && /^[A-ZÄÖÜ]$/.test(char)) {
        setCurrentGuess(prev => prev + char);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-ZÄÖÜ]$/.test(key)) {
        handleType(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameStatus, guesses]);

  const checkGuess = (guess) => {
    const res = Array(WORD_LENGTH).fill('gray');
    const solChars = solution.split('');
    const gChars = guess.split('');
    
    gChars.forEach((c, i) => {
      if (c === solChars[i]) { res[i] = 'green'; solChars[i] = null; }
    });
    gChars.forEach((c, i) => {
      if (res[i] !== 'green' && solChars.includes(c)) {
        res[i] = 'yellow';
        solChars[solChars.indexOf(c)] = null;
      }
    });
    return res;
  };

  const getKeyColor = (key) => {
    let color = 'bg-slate-200';
    guesses.forEach(g => {
      const res = checkGuess(g);
      g.split('').forEach((c, i) => {
        if (c === key) {
          if (res[i] === 'green') color = 'bg-green-500 text-white';
          else if (res[i] === 'yellow' && color !== 'bg-green-500 text-white') color = 'bg-yellow-500 text-white';
          else if (res[i] === 'gray' && color === 'bg-slate-200') color = 'bg-slate-400 text-white';
        }
      });
    });
    return color;
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none w-full max-w-xs mx-auto">
      <div className="grid grid-rows-6 gap-1.5 mb-2">
        {[...Array(MAX_GUESSES)].map((_, i) => {
          const guess = guesses[i] || (i === guesses.length ? currentGuess : '');
          const isCompleted = i < guesses.length;
          const colors = isCompleted ? checkGuess(guess) : [];
          return (
            <div key={i} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${WORD_LENGTH}, minmax(0, 1fr))` }}>
              {[...Array(WORD_LENGTH)].map((_, j) => (
                <div key={j} className={`aspect-square border-2 flex items-center justify-center font-black text-xl uppercase rounded-lg transition-all ${isCompleted ? (colors[j] === 'green' ? 'bg-green-500 border-green-500 text-white' : colors[j] === 'yellow' ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-slate-400 border-slate-400 text-white') : (guess[j] ? 'border-slate-400 text-slate-800' : 'border-slate-200')}`}>
                  {guess[j]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {gameStatus === 'won' && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-black uppercase text-xs animate-bounce">Gewonnen! 🎉</div>}
      {gameStatus === 'lost' && <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-black uppercase text-xs">Lösung: {solution}</div>}
      <div className="w-full space-y-1.5">
        {['QWERTZUIOPÜ', 'ASDFGHJKLÖÄ', 'YXCVBNM'].map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {i === 2 && <button onClick={() => handleType('ENTER')} className="px-2 py-3 rounded-md text-[10px] font-black bg-slate-200 hover:bg-slate-300">ENT</button>}
            {row.split('').map(char => (
              <button key={char} onClick={() => handleType(char)} className={`w-7 h-10 sm:w-8 rounded-md text-xs font-bold transition-colors ${getKeyColor(char)}`}>{char}</button>
            ))}
            {i === 2 && <button onClick={() => handleType('BACKSPACE')} className="px-2 py-3 rounded-md text-[10px] font-black bg-slate-200 hover:bg-slate-300">⌫</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

const CirclePainterGame = ({ highScore, onNewHighScore }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(null);
  const pointsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preventScroll = (e) => e.preventDefault();
    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    return () => canvas.removeEventListener('touchmove', preventScroll);
  }, []);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches && e.touches.length > 0) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#6366f1'; // indigo-500
    setIsDrawing(true);
    pointsRef.current = [{ x, y }];
    setScore(null);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    pointsRef.current.push({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    calculateScore();
  };

  const calculateScore = () => {
    const pts = pointsRef.current;
    if (pts.length < 20) { setScore(0); return; }
    let sumX = 0, sumY = 0;
    pts.forEach(p => { sumX += p.x; sumY += p.y; });
    const centerX = sumX / pts.length;
    const centerY = sumY / pts.length;
    const radii = pts.map(p => Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2)));
    const meanRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
    const stdDev = Math.sqrt(radii.reduce((a, b) => a + Math.pow(b - meanRadius, 2), 0) / radii.length);
    const start = pts[0];
    const end = pts[pts.length - 1];
    const closureDist = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
    const closurePenalty = (closureDist / meanRadius) * 30;
    const deviation = stdDev / meanRadius;
    let calculatedScore = 100 * (1 - deviation * 2) - closurePenalty;
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));
    const finalScore = parseFloat(calculatedScore.toFixed(1));
    setScore(finalScore);
    if (finalScore > (highScore || 0)) onNewHighScore(finalScore, canvasRef.current.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-64 h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden touch-none">
        <canvas ref={canvasRef} width={256} height={256} className="w-full h-full cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
        {!isDrawing && score === null && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 font-black uppercase text-xs tracking-widest">Zeichne einen Kreis</div>}
      </div>
      {score !== null && <div className="text-center"><p className="text-3xl font-black text-slate-800">{score}%</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Genauigkeit</p></div>}
    </div>
  );
};

// --- Konstanten ---

const THEMES = {
  indigo: { name: 'Indigo', text: 'text-indigo-600', textLight: 'text-indigo-400', bg: 'bg-indigo-600', bgLight: 'bg-indigo-50', hover: 'hover:bg-indigo-100', border: 'border-indigo-600', ring: 'focus:ring-indigo-500/20', dashed: 'border-indigo-200' },
  rose: { name: 'Rose', text: 'text-rose-600', textLight: 'text-rose-400', bg: 'bg-rose-600', bgLight: 'bg-rose-50', hover: 'hover:bg-rose-100', border: 'border-rose-600', ring: 'focus:ring-rose-500/20', dashed: 'border-rose-200' },
  emerald: { name: 'Smaragd', text: 'text-emerald-600', textLight: 'text-emerald-400', bg: 'bg-emerald-600', bgLight: 'bg-emerald-50', hover: 'hover:bg-emerald-100', border: 'border-emerald-600', ring: 'focus:ring-emerald-500/20', dashed: 'border-emerald-200' },
  amber: { name: 'Bernstein', text: 'text-amber-600', textLight: 'text-amber-400', bg: 'bg-amber-500', bgLight: 'bg-amber-50', hover: 'hover:bg-amber-100', border: 'border-amber-500', ring: 'focus:ring-amber-500/20', dashed: 'border-amber-200' },
  purple: { name: 'Lila', text: 'text-purple-600', textLight: 'text-purple-400', bg: 'bg-purple-600', bgLight: 'bg-purple-50', hover: 'hover:bg-purple-100', border: 'border-purple-600', ring: 'focus:ring-purple-500/20', dashed: 'border-purple-200' },
  sky: { name: 'Himmelblau', text: 'text-sky-600', textLight: 'text-sky-400', bg: 'bg-sky-500', bgLight: 'bg-sky-50', hover: 'hover:bg-sky-100', border: 'border-sky-500', ring: 'focus:ring-sky-500/20', dashed: 'border-sky-200' },
  slate: { name: 'Graphit', text: 'text-slate-700', textLight: 'text-slate-400', bg: 'bg-slate-700', bgLight: 'bg-slate-100', hover: 'hover:bg-slate-200', border: 'border-slate-700', ring: 'focus:ring-slate-500/20', dashed: 'border-slate-300' }
};

const PROFILE_SUGGESTIONS = [
  { emoji: '👁️', label: 'Augenfarbe' },
  { emoji: '🎨', label: 'Hobby' },
  { emoji: '📏', label: 'Größe' },
  { emoji: '🏡', label: 'Wohnort' }
];

const EMOJI_LIST = ['✨','🔥','✌️','🫶','🚀','🍕','☕','📚','🎮','🎸','🐶','🐱'];

const TRIP_TYPES = [
  { id: 'city', icon: '🏙️', label: 'City' },
  { id: 'beach', icon: '🏖️', label: 'Strand' },
  { id: 'nature', icon: '🌲', label: 'Natur' },
  { id: 'roadtrip', icon: '🚗', label: 'Roadtrip' },
  { id: 'backpack', icon: '🎒', label: 'Backpack' }
];

const TRANSPORT_TYPES = [
  { id: 'plane', icon: '✈️', label: 'Flug' },
  { id: 'train', icon: '🚆', label: 'Zug' },
  { id: 'car', icon: '🚘', label: 'Auto' },
  { id: 'ship', icon: '⛴️', label: 'Schiff' },
  { id: 'bus', icon: '🚌', label: 'Bus' }
];

const TIER_LEVELS = [
  { value: 'S', color: 'bg-red-400' },
  { value: 'A', color: 'bg-orange-400' },
  { value: 'B', color: 'bg-amber-400' },
  { value: 'C', color: 'bg-green-400' },
  { value: 'D', color: 'bg-blue-400' },
  { value: 'F', color: 'bg-slate-400' }
];

const THIS_OR_THAT_QUESTIONS = [
  { id: 'time', left: '🌅 Frühaufsteher', right: '🦉 Nachteule' },
  { id: 'drink', left: '☕ Kaffee', right: '🍵 Tee' },
  { id: 'season', left: '☀️ Sommer', right: '❄️ Winter' },
  { id: 'food', left: '🥨 Salzig', right: '🍫 Süß' },
  { id: 'vacation', left: '🏖️ Strand', right: '🏔️ Berge' }
];

const TIME_CAPSULE_QUESTIONS = [
  { id: 'future', label: 'In 5 Jahren bin ich hoffentlich...' },
  { id: 'dream', label: 'Mein größter Traum aktuell ist...' },
  { id: 'learn', label: 'Etwas, das ich unbedingt noch lernen will...' },
  { id: 'advice', label: 'Mein Rat an mein zukünftiges Ich:' }
];

const POST_IT_COLORS = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200'];
const POST_IT_ROTATIONS = ['rotate-2', '-rotate-2', 'rotate-1', '-rotate-3', 'rotate-3', '-rotate-1'];

// --- Main App Component ---

const App = () => {
  // ⚠️ Wenn Firebase noch nicht konfiguriert wurde, zeige direkt diesen Hinweisscreen!
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 selection:bg-indigo-100 font-sans">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-md w-full text-center border border-slate-200/60">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Database size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Fast geschafft! 🚀</h2>
          <p className="text-sm font-bold text-slate-500 mb-6 leading-relaxed">
            Dein Design steht, aber die App kann ohne Datenbank nicht starten.
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-2">So geht's weiter:</p>
            <ol className="text-xs text-slate-500 space-y-2 list-decimal list-inside ml-2">
              <li>Gehe zu <b>console.firebase.google.com</b></li>
              <li>Erstelle ein neues Web-Projekt.</li>
              <li>Kopiere die <code>firebaseConfig</code> (die IDs und Keys).</li>
              <li>Füge sie ganz oben in der <b>App.jsx</b> ein.</li>
            </ol>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-6">Viel Erfolg!</p>
        </div>
      </div>
    );
  }

  const [profileData, setProfileData] = useState({
    name: '', bio: '', avatar: null, coverImage: null, birthdate: '', tags: [], funFact: '',
    signature: null, voiceNote: null, theme: 'indigo', customColor: '#6366f1',
    profileDetails: [], favSongs: [], favBooks: [], favMovies: [], bucketList: [], thisOrThat: {},
    quote: { text: '', author: '' }, games: [], travels: [],
    tierLists: [{ id: Date.now().toString(), topic: '', items: [] }],
    skills: [], pets: [], relationships: [], timeCapsule: {}, customTimeCapsule: [], friendsQuotes: [], everydayCarry: [],
    career: [], screenTime: [], quiz: [], 
    moodboard: [], 
    twoTruths: [
      { id: '1', text: '', isLie: false },
      { id: '2', text: '', isLie: false },
      { id: '3', text: '', isLie: false }
    ],
    redFlags: [], greenFlags: [],
    coc: { trophies: '', builderTrophies: '', townHall: '', builderHall: '', villageImage: null, builderBaseImage: null, friendLink: '' },
    hayday: { level: '', friendCode: '', farmImage: null },
    concerts: [], // NEU: Konzert Tagebuch
    brawlStars: { trophies: '', favoriteBrawler: '', rank: '', friendLink: '' },
    favVideo: '',
    favPodcast: '',
    favCreators: [],
    setup: { images: [], components: [] },
    secretMessage: { question: '', answer: '', message: '' },
    reactionTime: null,
    cpsScore: 0,
    mathDashScore: 0,
    slidePuzzle: { image: null },
    wordle: { targetWord: '' },
    circleGame: { score: 0, image: null },
    wishlist: [],
    topEmojis: ['', '', '', '', ''],
    duolingo: { initialStreak: '', language: '', startDate: null },
    socials: {}, activeModules: [], lastUpdated: Date.now()
  });

  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showModulePicker, setShowModulePicker] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const [showSocialPicker, setShowSocialPicker] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [newBucketItem, setNewBucketItem] = useState('');
  const [newTagItem, setNewTagItem] = useState('');
  const [newTravelLocation, setNewTravelLocation] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [emojiPickerIdx, setEmojiPickerIdx] = useState(null);
  
  const [newTierItemTexts, setNewTierItemTexts] = useState({});
  const [newTierItemLevels, setNewTierItemLevels] = useState({});
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillValue, setNewSkillValue] = useState(50);
  
  const [newFriendQuoteText, setNewFriendQuoteText] = useState('');
  const [newFriendQuoteAuthor, setNewFriendQuoteAuthor] = useState('');
  const [newEdcItemName, setNewEdcItemName] = useState('');
  const [newEdcItemEmoji, setNewEdcItemEmoji] = useState('🎒');

  const [newCareerRole, setNewCareerRole] = useState('');
  const [newCareerCompany, setNewCareerCompany] = useState('');
  const [newCareerStart, setNewCareerStart] = useState('');
  const [newCareerEnd, setNewCareerEnd] = useState('');
  const [newCareerDesc, setNewCareerDesc] = useState('');

  const [newAppName, setNewAppName] = useState('');
  const [newAppTime, setNewAppTime] = useState('');
  const [newAppEmoji, setNewAppEmoji] = useState('📱');

  const [newQuizQuestion, setNewQuizQuestion] = useState('');
  const [newQuizAnswer, setNewQuizAnswer] = useState('');

  const [newRedFlag, setNewRedFlag] = useState('');
  const [newGreenFlag, setNewGreenFlag] = useState('');

  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(true);
  const [sharedId, setSharedId] = useState(null);
  const [showShareAlert, setShowShareAlert] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
      setSharedId(idParam);
      setShowPreview(true);
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth Error", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    
    const targetUid = sharedId || user.uid;
    setIsOwner(user.uid === targetUid);

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', targetUid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const parsed = docSnap.data();
        if (!parsed.career) parsed.career = [];
        if (!parsed.screenTime) parsed.screenTime = [];
        if (!parsed.quiz) parsed.quiz = [];
        if (!parsed.moodboard) parsed.moodboard = [];
        if (!parsed.redFlags) parsed.redFlags = [];
        if (!parsed.greenFlags) parsed.greenFlags = [];
        if (!parsed.twoTruths) parsed.twoTruths = [
          { id: '1', text: '', isLie: false }, { id: '2', text: '', isLie: false }, { id: '3', text: '', isLie: false }
        ];
        if (!parsed.coc) parsed.coc = { trophies: '', builderTrophies: '', townHall: '', builderHall: '', villageImage: null, builderBaseImage: null, friendLink: '' };
        if (!parsed.hayday) parsed.hayday = { level: '', friendCode: '', farmImage: null };
        if (!parsed.concerts) parsed.concerts = [];
        if (!parsed.brawlStars) parsed.brawlStars = { trophies: '', favoriteBrawler: '', rank: '', friendLink: '' };
        if (!parsed.favVideo) parsed.favVideo = '';
        if (!parsed.favPodcast) parsed.favPodcast = '';
        if (!parsed.favCreators) parsed.favCreators = [];
        if (!parsed.setup) parsed.setup = { images: [], components: [] };
        if (!parsed.secretMessage) parsed.secretMessage = { question: '', answer: '', message: '' };
        if (parsed.reactionTime === undefined) parsed.reactionTime = null;
        if (!parsed.wishlist) parsed.wishlist = [];
        if (!parsed.topEmojis) parsed.topEmojis = ['', '', '', '', ''];
        setProfileData(parsed);
      } else if (user.uid === targetUid) {
        // Migration von lokalem Speicher beim ersten Cloud-Login
        const savedData = localStorage.getItem('mein-freundebuch-v31') || localStorage.getItem('mein-freundebuch-v30') || localStorage.getItem('mein-freundebuch-v25');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (!parsed.theme) parsed.theme = 'indigo';
            if (!parsed.customColor) parsed.customColor = '#6366f1';
            if (!parsed.thisOrThat) parsed.thisOrThat = {};
            if (!parsed.quote) parsed.quote = { text: '', author: '' };
            if (!parsed.games) parsed.games = [];
            if (!parsed.travels) parsed.travels = [];
            if (!parsed.tierLists) parsed.tierLists = [{ id: Date.now().toString(), topic: '', items: [] }];
            if (!parsed.skills) parsed.skills = [];
            if (!parsed.pets) parsed.pets = [];
            if (!parsed.relationships) parsed.relationships = []; 
            if (!parsed.timeCapsule) parsed.timeCapsule = {};
            if (!parsed.customTimeCapsule) parsed.customTimeCapsule = [];
            if (!parsed.friendsQuotes) parsed.friendsQuotes = [];
            if (!parsed.everydayCarry) parsed.everydayCarry = [];
            if (!parsed.career) parsed.career = [];
            if (!parsed.screenTime) parsed.screenTime = [];
            if (!parsed.quiz) parsed.quiz = [];
            if (!parsed.moodboard) parsed.moodboard = [];
            if (!parsed.redFlags) parsed.redFlags = [];
            if (!parsed.greenFlags) parsed.greenFlags = [];
            if (!parsed.twoTruths) parsed.twoTruths = [
              { id: '1', text: '', isLie: false },
              { id: '2', text: '', isLie: false },
              { id: '3', text: '', isLie: false }
            ];
            if (!parsed.coc) parsed.coc = { trophies: '', builderTrophies: '', townHall: '', builderHall: '', villageImage: null, builderBaseImage: null, friendLink: '' };
            if (parsed.coc && parsed.coc.builderTrophies === undefined) parsed.coc.builderTrophies = '';
            if (!parsed.hayday) parsed.hayday = { level: '', friendCode: '', farmImage: null };
            if (!parsed.concerts) parsed.concerts = [];
            if (!parsed.brawlStars) parsed.brawlStars = { trophies: '', favoriteBrawler: '', rank: '', friendLink: '' };
            if (parsed.favVideo === undefined) parsed.favVideo = '';
            if (parsed.favPodcast === undefined) parsed.favPodcast = '';
            if (!parsed.favCreators) parsed.favCreators = [];
            if (!parsed.setup) parsed.setup = { images: [], components: [] };
            if (!parsed.secretMessage) parsed.secretMessage = { question: '', answer: '', message: '' };
            if (parsed.reactionTime === undefined) parsed.reactionTime = null;
            if (parsed.cpsScore === undefined) parsed.cpsScore = 0;
            if (parsed.mathDashScore === undefined) parsed.mathDashScore = 0;
            if (!parsed.slidePuzzle) parsed.slidePuzzle = { image: null };
            if (!parsed.wordle) parsed.wordle = { targetWord: '' };
            if (!parsed.circleGame) parsed.circleGame = { score: 0, image: null };
            if (!parsed.wishlist) parsed.wishlist = [];
            if (!parsed.topEmojis) parsed.topEmojis = ['', '', '', '', ''];

            if (parsed.coverImage === undefined) parsed.coverImage = null;
            if (!parsed.tags) parsed.tags = [];
            if (parsed.birthdate === undefined) parsed.birthdate = '';
            if (parsed.funFact === undefined) parsed.funFact = '';
            if (parsed.signature === undefined) parsed.signature = null;
            if (parsed.voiceNote === undefined) parsed.voiceNote = null;
            if (parsed.profileDetails) {
              parsed.profileDetails = parsed.profileDetails.map(d => ({ ...d, emoji: d.emoji || '' }));
            }
            delete parsed.flags; delete parsed.customThisOrThatQuestions; delete parsed.uselessSuperpower; delete parsed.profileSong;
            setProfileData(parsed);
            setDoc(docRef, parsed);
          } catch (e) {
            console.error("Migration Fehler", e);
          }
        }
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, sharedId]);

  const isCustomTheme = profileData.theme === 'custom';
  const t = isCustomTheme ? {
    name: 'Eigene Farbe', text: 'theme-custom-text', textLight: 'theme-custom-text-light', bg: 'theme-custom-bg',
    bgLight: 'theme-custom-bg-light', hover: 'hover:opacity-80 transition-opacity', border: 'theme-custom-border',
    ring: 'theme-custom-ring', dashed: 'theme-custom-border border-dashed'
  } : THEMES[profileData.theme] || THEMES.indigo;

  const allModules = [
    { id: 'concerts', name: 'Konzert-Tagebuch', icon: <Ticket className="text-fuchsia-500" />, desc: 'Festivals & Live Gigs' },
    { id: 'wishlist', name: 'Wunschliste', icon: <Gift className="text-pink-500" />, desc: 'Wünsche & Links' },
    { id: 'favVideo', name: 'Lieblingsvideo', icon: <Youtube className="text-red-600" />, desc: 'Mein YouTube Favorit' },
    { id: 'favPodcast', name: 'Lieblingspodcast', icon: <Podcast className="text-green-500" />, desc: 'Mein aktueller Ohrwurm' },
    { id: 'favCreators', name: 'Lieblings Creator', icon: <Video className="text-purple-600" />, desc: 'YouTuber & Streamer' },
    { id: 'secretMessage', name: 'Secret Message', icon: <Lock className="text-slate-600" />, desc: 'Verschlüsselte Nachricht' },
    { id: 'reactionTime', name: 'Reaktionstest', icon: <Zap className="text-yellow-500" />, desc: 'Wie schnell bist du?', isMinigame: true },
    { id: 'mathDash', name: 'Math Dash', icon: <Calculator className="text-blue-500" />, desc: 'Kopfrechnen gegen die Zeit', isMinigame: true },
    { id: 'cps', name: 'Pizza Clicker', icon: <MousePointerClick className="text-orange-500" />, desc: 'Speed Challenge', isMinigame: true },
    { id: 'slidePuzzle', name: 'Slide Puzzle', icon: <Puzzle className="text-indigo-500" />, desc: 'Schiebepuzzle für Freunde', isMinigame: true },
    { id: 'wordle', name: 'Wordle', icon: <Grid3x3 className="text-emerald-600" />, desc: 'Errate das Wort', isMinigame: true },
    { id: 'circleGame', name: 'Kreis Zeichnen', icon: <Circle className="text-indigo-500" />, desc: 'Wie rund kannst du malen?', isMinigame: true },
    { id: 'setup', name: 'Mein Setup', icon: <Monitor className="text-cyan-500" />, desc: 'PC, Konsole & Desk' },
    { id: 'topEmojis', name: 'Top 5 Emojis', icon: <Smile className="text-yellow-500" />, desc: 'Meine meistgenutzten Emojis' },
    { id: 'brawlStars', name: 'Brawl Stars', icon: <Skull className="text-yellow-500" />, desc: 'Trophäen & Brawler' },
    { id: 'hayday', name: 'Hay Day', icon: <Tractor className="text-yellow-600" />, desc: 'Farm Lvl & Code' }, 
    { id: 'coc', name: 'Clash of Clans', icon: <Swords className="text-amber-500" />, desc: 'Rathaus, Trophäen & Base' }, 
    { id: 'relationships', name: 'Beziehung', icon: <Heart className="text-rose-500 fill-rose-500" />, desc: 'Dein Partner & Dauer' },
    { id: 'duolingo', name: 'Duolingo Streak', icon: <Languages className="text-emerald-500" />, desc: 'Automatischer Zähler' },
    { id: 'career', name: 'Werdegang', icon: <Briefcase className="text-blue-600" />, desc: 'Beruf & Ausbildung' },
    { id: 'screenTime', name: 'Screen-Time', icon: <Smartphone className="text-slate-800" />, desc: 'Meine meistgenutzten Apps' },
    { id: 'quiz', name: 'Q&A Quiz', icon: <HelpCircle className="text-indigo-500" />, desc: 'Fragen & Antworten (Karten)' },
    { id: 'moodboard', name: 'Moodboard', icon: <Images className="text-pink-400" />, desc: 'Deine Ästhetik in Bildern' },
    { id: 'twoTruths', name: '2 Wahrheiten 1 Lüge', icon: <Lightbulb className="text-yellow-500" />, desc: 'Rate mal, was nicht stimmt' },
    { id: 'books', name: 'Bücher', icon: <Book className="text-amber-500" />, desc: 'Deine Favoriten' },
    { id: 'movies', name: 'Filme/Serien', icon: <Film className="text-rose-500" />, desc: 'Was du liebst' },
    { id: 'songs', name: 'Musik', icon: <Music className="text-indigo-500" />, desc: 'Top Songs' },
    { id: 'travels', name: 'Reisetagebuch', icon: <Globe className="text-teal-500" />, desc: 'Länder & Fotos' },
    { id: 'pets', name: 'Haustiere', icon: <PawPrint className="text-amber-700" />, desc: 'Meine tierischen Begleiter' },
    { id: 'friendsQuotes', name: 'Zitate-Wand', icon: <StickyNote className="text-pink-500" />, desc: 'Insider & Sprüche' },
    { id: 'everydayCarry', name: 'Everyday Carry', icon: <Backpack className="text-orange-500" />, desc: 'Immer dabei (EDC)' },
    { id: 'tierList', name: 'Tier List', icon: <Trophy className="text-yellow-500" />, desc: 'Das ultimative Ranking' },
    { id: 'skills', name: 'Skill-Tree', icon: <BarChart2 className="text-blue-500" />, desc: 'Deine Fähigkeiten in %' },
    { id: 'timeCapsule', name: 'Zeitkapsel', icon: <Hourglass className="text-violet-500" />, desc: 'Blick in die Zukunft' },
    { id: 'bucketList', name: 'Bucket List', icon: <MapPin className="text-red-500" />, desc: 'Ziele & Träume' },
    { id: 'thisOrThat', name: 'Entweder / Oder', icon: <ArrowRightLeft className="text-purple-500" />, desc: 'Schwere Fragen' },
    { id: 'quote', name: 'Lieblingszitat', icon: <Quote className="text-slate-500" />, desc: 'Lebensmotto' },
    { id: 'games', name: 'Gaming', icon: <Gamepad2 className="text-sky-500" />, desc: 'Aktuelle Spiele' },
    { id: 'flags', name: 'Red/Green Flags', icon: <Flag className="text-red-500" />, desc: 'No-Gos & Must-Haves' }
  ];

  const filteredModules = useMemo(() => {
    return allModules.filter(m => m.name.toLowerCase().includes(moduleSearch.toLowerCase()) || m.desc.toLowerCase().includes(moduleSearch.toLowerCase()));
  }, [moduleSearch]);

  const addModule = (type) => {
    if (!profileData.activeModules.includes(type)) {
      setProfileData(prev => ({ ...prev, activeModules: [...prev.activeModules, type] }));
    }
    setShowModulePicker(false);
    setModuleSearch('');
  };

  const removeModule = (type) => {
    setProfileData(prev => ({ ...prev, activeModules: prev.activeModules.filter(m => m !== type) }));
  };

  const addItem = (type, item) => {
    const key = type === 'music' ? 'favSongs' : type === 'books' ? 'favBooks' : type === 'movies' ? 'favMovies' : type === 'games' ? 'games' : type === 'creators' ? 'favCreators' : null;
    if (!key) return;
    if (!profileData[key].find(i => i.id === item.id)) {
      const newItem = type === 'games' ? { ...item, playtime: '' } : item;
      setProfileData(prev => ({ ...prev, [key]: [...prev[key], newItem] }));
    }
  };

  const addProfileDetail = (label = '', emoji = '') => {
    setProfileData(prev => ({ ...prev, profileDetails: [...(prev.profileDetails || []), { emoji, label, value: '' }] }));
  };

  const updateProfileDetail = (index, field, value) => {
    const newDetails = [...profileData.profileDetails];
    newDetails[index][field] = value;
    setProfileData({ ...profileData, profileDetails: newDetails });
  };

  const removeProfileDetail = (index) => {
    setProfileData({ ...profileData, profileDetails: profileData.profileDetails.filter((_, i) => i !== index) });
  };

  const handleDuolingoStreakChange = (val) => {
    const days = parseInt(val) || 0;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    setProfileData({ ...profileData, duolingo: { ...profileData.duolingo, initialStreak: val, startDate: startDate.toISOString() } });
  };

  const handleAddTravel = async () => {
    if (!newTravelLocation.trim()) return;
    setIsFetchingLocation(true);
    let lat, lon, flagEmoji = '', resolvedName = "";
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newTravelLocation)}&format=json&addressdetails=1&limit=1`, { headers: { 'Accept-Language': 'de-DE, de;q=0.9' } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const place = data[0];
          lat = parseFloat(place.lat);
          lon = parseFloat(place.lon);
          resolvedName = place.address?.city || place.address?.town || place.address?.village || place.address?.country || place.display_name.split(',')[0];
          if (place.address && place.address.country_code) flagEmoji = getFlagEmoji(place.address.country_code);
        }
      }
    } catch (e) {
      console.error("Ort nicht gefunden oder Netzwerkfehler.");
    }
    const newTravel = {
      id: Date.now().toString(), name: newTravelLocation.trim(), resolvedName: resolvedName || newTravelLocation.trim(),
      lat, lon, flag: flagEmoji, images: [], status: 'visited', type: '', companions: '', song: null, favorite: false, transport: '', food: ''
    };
    setProfileData(prev => ({ ...prev, travels: [...(prev.travels || []), newTravel] }));
    setNewTravelLocation('');
    setIsFetchingLocation(false);
  };

  const handleTravelImageUpload = (travelId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travelId ? { ...t, images: [...(t.images || []), reader.result] } : t) }));
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileData(prev => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileData(prev => ({ ...prev, coverImage: reader.result }));
    reader.readAsDataURL(file);
  };

  // --- Helpers for existing modules ---

  const addTierList = () => setProfileData(prev => ({ ...prev, tierLists: [...(prev.tierLists || []), { id: Date.now().toString(), topic: '', items: [] }] }));
  const removeTierList = (id) => setProfileData(prev => ({ ...prev, tierLists: prev.tierLists.filter(list => list.id !== id) }));
  const updateTierListTopic = (id, topic) => setProfileData(prev => ({ ...prev, tierLists: prev.tierLists.map(list => list.id === id ? { ...list, topic } : list) }));
  
  const addTierItem = (listId) => {
    const text = newTierItemTexts[listId] || '';
    if (!text.trim()) return;
    const tier = newTierItemLevels[listId] || 'S';
    setProfileData(prev => ({
      ...prev,
      tierLists: prev.tierLists.map(list => list.id === listId ? { ...list, items: [...(list.items || []), { id: Date.now().toString(), text: text.trim(), tier }] } : list)
    }));
    setNewTierItemTexts(prev => ({ ...prev, [listId]: '' }));
  };
  const removeTierItem = (listId, itemId) => setProfileData(prev => ({ ...prev, tierLists: prev.tierLists.map(list => list.id === listId ? { ...list, items: list.items.filter(i => i.id !== itemId) } : list) }));

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setProfileData(prev => ({ ...prev, skills: [...(prev.skills || []), { id: Date.now().toString(), name: newSkillName.trim(), value: newSkillValue }] }));
    setNewSkillName('');
    setNewSkillValue(50);
  };
  const updateSkill = (id, val) => setProfileData(prev => ({ ...prev, skills: prev.skills.map(s => s.id === id ? { ...s, value: parseInt(val) } : s) }));
  const removeSkill = (id) => setProfileData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));

  const addCustomTimeCapsule = () => setProfileData(prev => ({ ...prev, customTimeCapsule: [...(prev.customTimeCapsule || []), { id: `custom_${Date.now()}`, question: '', answer: '' }] }));
  const updateCustomTimeCapsule = (id, field, value) => setProfileData(prev => ({ ...prev, customTimeCapsule: prev.customTimeCapsule.map(item => item.id === id ? { ...item, [field]: value } : item) }));
  const removeCustomTimeCapsule = (id) => setProfileData(prev => ({ ...prev, customTimeCapsule: prev.customTimeCapsule.filter(item => item.id !== id) }));

  const addPet = () => setProfileData(prev => ({ ...prev, pets: [...(prev.pets || []), { id: Date.now().toString(), name: '', type: '', breed: '', birthdate: '', image: null }] }));
  const updatePet = (id, field, value) => setProfileData(prev => ({ ...prev, pets: prev.pets.map(p => p.id === id ? { ...p, [field]: value } : p) }));
  const removePet = (id) => setProfileData(prev => ({ ...prev, pets: prev.pets.filter(p => p.id !== id) }));
  const handlePetImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileData(prev => ({ ...prev, pets: prev.pets.map(p => p.id === id ? { ...p, image: reader.result } : p) }));
    reader.readAsDataURL(file);
  };

  const addRelationship = () => setProfileData(prev => ({ ...prev, relationships: [...(prev.relationships || []), { id: Date.now().toString(), name: '', startDate: '', image: null }] }));
  const updateRelationship = (id, field, value) => setProfileData(prev => ({ ...prev, relationships: prev.relationships.map(r => r.id === id ? { ...r, [field]: value } : r) }));
  const removeRelationship = (id) => setProfileData(prev => ({ ...prev, relationships: prev.relationships.filter(r => r.id !== id) }));
  const handleRelationshipImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileData(prev => ({ ...prev, relationships: prev.relationships.map(r => r.id === id ? { ...r, image: reader.result } : r) }));
    reader.readAsDataURL(file);
  };

  const addFriendQuote = () => {
    if (!newFriendQuoteText.trim()) return;
    setProfileData(prev => ({
      ...prev, friendsQuotes: [...(prev.friendsQuotes || []), { id: Date.now().toString(), text: newFriendQuoteText.trim(), author: newFriendQuoteAuthor.trim() || 'Anonym' }]
    }));
    setNewFriendQuoteText('');
    setNewFriendQuoteAuthor('');
  };
  const removeFriendQuote = (id) => setProfileData(prev => ({ ...prev, friendsQuotes: prev.friendsQuotes.filter(q => q.id !== id) }));

  const addEdcItem = () => {
    if (!newEdcItemName.trim()) return;
    setProfileData(prev => ({
      ...prev, everydayCarry: [...(prev.everydayCarry || []), { id: Date.now().toString(), name: newEdcItemName.trim(), emoji: newEdcItemEmoji }]
    }));
    setNewEdcItemName('');
  };
  const removeEdcItem = (id) => setProfileData(prev => ({ ...prev, everydayCarry: prev.everydayCarry.filter(item => item.id !== id) }));

  const addCareerItem = () => {
    if (!newCareerRole.trim() || !newCareerCompany.trim()) return;
    setProfileData(prev => ({
      ...prev, career: [...(prev.career || []), { id: Date.now().toString(), role: newCareerRole.trim(), company: newCareerCompany.trim(), start: newCareerStart.trim(), end: newCareerEnd.trim() || 'Heute', description: newCareerDesc.trim() }]
    }));
    setNewCareerRole(''); setNewCareerCompany(''); setNewCareerStart(''); setNewCareerEnd(''); setNewCareerDesc('');
  };
  const removeCareerItem = (id) => setProfileData(prev => ({ ...prev, career: prev.career.filter(item => item.id !== id) }));

  const addScreenTimeApp = () => {
    if (!newAppName.trim()) return;
    setProfileData(prev => ({
      ...prev, screenTime: [...(prev.screenTime || []), { id: Date.now().toString(), name: newAppName.trim(), time: newAppTime.trim(), emoji: newAppEmoji }]
    }));
    setNewAppName(''); setNewAppTime('');
  };
  const removeScreenTimeApp = (id) => setProfileData(prev => ({ ...prev, screenTime: prev.screenTime.filter(item => item.id !== id) }));

  const addQuizItem = () => {
    if (!newQuizQuestion.trim() || !newQuizAnswer.trim()) return;
    setProfileData(prev => ({
      ...prev, quiz: [...(prev.quiz || []), { id: Date.now().toString(), question: newQuizQuestion.trim(), answer: newQuizAnswer.trim() }]
    }));
    setNewQuizQuestion(''); setNewQuizAnswer('');
  };
  const removeQuizItem = (id) => setProfileData(prev => ({ ...prev, quiz: prev.quiz.filter(item => item.id !== id) }));

  const handleMoodboardImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, moodboard: [...(prev.moodboard || []), reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };
  const removeMoodboardImage = (index) => {
    setProfileData(prev => ({ ...prev, moodboard: prev.moodboard.filter((_, i) => i !== index) }));
  };

  const handleTwoTruthsChange = (id, text) => {
    setProfileData(prev => ({ ...prev, twoTruths: prev.twoTruths.map(t => t.id === id ? { ...t, text } : t) }));
  };
  const handleTwoTruthsLieSelect = (id) => {
    setProfileData(prev => ({ ...prev, twoTruths: prev.twoTruths.map(t => ({ ...t, isLie: t.id === id })) }));
  };

  const handleCocImageUpload = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, coc: { ...prev.coc, [field]: reader.result } }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleHaydayImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, hayday: { ...prev.hayday, farmImage: reader.result } }));
    };
    reader.readAsDataURL(file);
  };

  // --- NEU: Helpers for Concerts ---
  const addConcert = () => {
    setProfileData(prev => ({
      ...prev,
      concerts: [...(prev.concerts || []), { id: Date.now().toString(), band: '', location: '', date: '', rating: 0, image: null }]
    }));
  };
  const updateConcert = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      concerts: prev.concerts.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };
  const removeConcert = (id) => {
    setProfileData(prev => ({ ...prev, concerts: prev.concerts.filter(c => c.id !== id) }));
  };
  const handleConcertImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, concerts: prev.concerts.map(c => c.id === id ? { ...c, image: reader.result } : c) }));
    };
    reader.readAsDataURL(file);
  };

  // --- Helpers for Wishlist ---
  const addWish = () => {
    setProfileData(prev => ({
      ...prev,
      wishlist: [...(prev.wishlist || []), { id: Date.now().toString(), name: '', link: '', urgency: 3, image: null }]
    }));
  };
  const updateWish = (id, field, value) => {
    setProfileData(prev => ({ ...prev, wishlist: prev.wishlist.map(w => w.id === id ? { ...w, [field]: value } : w) }));
  };
  const removeWish = (id) => setProfileData(prev => ({ ...prev, wishlist: prev.wishlist.filter(w => w.id !== id) }));
  const handleWishImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileData(prev => ({ ...prev, wishlist: prev.wishlist.map(w => w.id === id ? { ...w, image: reader.result } : w) }));
    reader.readAsDataURL(file);
  };

  const updateTopEmoji = (index, emoji) => {
    const newEmojis = [...(profileData.topEmojis || ['', '', '', '', ''])];
    newEmojis[index] = emoji;
    setProfileData(prev => ({ ...prev, topEmojis: newEmojis }));
  };

  // --- Helpers for Setup ---
  const addSetupComponent = () => {
    setProfileData(prev => ({
      ...prev,
      setup: {
        ...prev.setup,
        components: [...(prev.setup?.components || []), { id: Date.now().toString(), label: '', value: '' }]
      }
    }));
  };
  const updateSetupComponent = (id, field, val) => {
    setProfileData(prev => ({
      ...prev,
      setup: {
        ...prev.setup,
        components: prev.setup.components.map(c => c.id === id ? { ...c, [field]: val } : c)
      }
    }));
  };
  const removeSetupComponent = (id) => {
    setProfileData(prev => ({
      ...prev,
      setup: { ...prev.setup, components: prev.setup.components.filter(c => c.id !== id) }
    }));
  };
  const handleSetupImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const currentCount = profileData.setup?.images?.length || 0;
    const allowedCount = 5 - currentCount;
    if (allowedCount <= 0) return;
    const filesToProcess = files.slice(0, allowedCount);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setProfileData(prev => ({ ...prev, setup: { ...prev.setup, images: [...(prev.setup?.images || []), reader.result] } }));
      reader.readAsDataURL(file);
    });
  };
  const removeSetupImage = (index) => setProfileData(prev => ({ ...prev, setup: { ...prev.setup, images: prev.setup.images.filter((_, i) => i !== index) } }));

  // --- Helpers for Slide Puzzle ---
  const handleSlidePuzzleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileData(prev => ({ ...prev, slidePuzzle: { image: reader.result } }));
    reader.readAsDataURL(file);
  };

  // --- Helpers for Flags ---
  const addRedFlag = () => {
    if (!newRedFlag.trim()) return;
    setProfileData(prev => ({ ...prev, redFlags: [...(prev.redFlags || []), { id: Date.now().toString(), text: newRedFlag.trim() }] }));
    setNewRedFlag('');
  };
  const removeRedFlag = (id) => setProfileData(prev => ({ ...prev, redFlags: prev.redFlags.filter(i => i.id !== id) }));

  const addGreenFlag = () => {
    if (!newGreenFlag.trim()) return;
    setProfileData(prev => ({ ...prev, greenFlags: [...(prev.greenFlags || []), { id: Date.now().toString(), text: newGreenFlag.trim() }] }));
    setNewGreenFlag('');
  };
  const removeGreenFlag = (id) => setProfileData(prev => ({ ...prev, greenFlags: prev.greenFlags.filter(i => i.id !== id) }));

  // --- Saving & Export ---

  const handleSave = async () => {
    if (!isFirebaseConfigured || !user || !isOwner) return;
    try {
      setSaveError('');
      const updatedData = { ...profileData, lastUpdated: Date.now() };
      setProfileData(updatedData);
      
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
      await setDoc(docRef, updatedData);
      
      localStorage.setItem('mein-freundebuch-v31', JSON.stringify(updatedData));
      
      setShowSaveAlert(true);
      setTimeout(() => setShowSaveAlert(false), 3000);
    } catch (e) {
      console.error(e);
      setSaveError('Cloud-Speicher Fehler (Datei zu groß?)');
      setTimeout(() => setSaveError(''), 5000);
    }
  };

  const handleShare = () => {
    if (!user) return;
    const url = `${window.location.origin}${window.location.pathname}?id=${user.uid}`;
    try {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setShowShareAlert(true);
      setTimeout(() => setShowShareAlert(false), 3000);
    } catch(e) {
      console.error("Copy failed", e);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setShowPreview(true);
    try {
      if (!window.html2canvas) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      if (!window.jspdf) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      setTimeout(async () => {
        const modalContainer = document.getElementById('preview-modal-scroll-container');
        if (modalContainer) modalContainer.scrollTop = 0;
        const element = document.getElementById('pdf-content-wrapper');
        if (!element) {
          setIsGeneratingPDF(false);
          return;
        }
        const canvas = await window.html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
          position = position - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        pdf.save(`Freundebuch_${profileData.name || 'Profil'}.pdf`);
        setIsGeneratingPDF(false);
      }, 1500);
    } catch (error) {
      console.error('Fehler bei der PDF-Generierung:', error);
      setIsGeneratingPDF(false);
    }
  };

  const socialTypes = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={18} />, color: 'from-pink-500 to-purple-600' },
    { id: 'snapchat', name: 'Snapchat', icon: <Ghost size={18} />, color: 'from-yellow-400 to-yellow-500' },
    { id: 'tiktok', name: 'TikTok', icon: <TikTokIcon size={18} />, color: 'from-slate-900 to-black' },
    { id: 'twitch', name: 'Twitch', icon: <Twitch size={18} />, color: 'from-purple-600 to-purple-900' },
    { id: 'twitter', name: 'X', icon: <Twitter size={18} />, color: 'from-blue-400 to-blue-600' },
    { id: 'email', name: 'E-Mail', icon: <Mail size={18} />, color: 'from-teal-400 to-emerald-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={18} />, color: 'from-blue-600 to-blue-800' },
    { id: 'website', name: 'Website', icon: <Globe size={18} />, color: 'from-slate-500 to-slate-700' }
  ];

  const currentDynamicStreak = profileData.duolingo?.startDate ? calculateCurrentStreak(profileData.duolingo.startDate) : 0;
  const currentAge = getAge(profileData.birthdate);
  const currentZodiac = getZodiac(profileData.birthdate);

  const PreviewVoiceNote = ({ audioData }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const togglePlay = async () => {
      if (!audioRef.current) return;
      try {
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
        else { await audioRef.current.play(); setIsPlaying(true); }
      } catch (err) {
        console.error("Fehler beim Abspielen:", err);
        setIsPlaying(false);
      }
    };
    if (!audioData) return null;
    return (
      <div className={`mt-4 bg-white border border-slate-100 p-2.5 rounded-2xl shadow-sm flex items-center gap-3 w-64 max-w-full print-hide`}>
        <audio ref={audioRef} src={audioData} onEnded={() => setIsPlaying(false)} />
        <button onClick={togglePlay} className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full ${t.bg} text-white shadow-md hover:scale-105 transition-transform`}>
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] font-black uppercase text-slate-800 leading-tight">Audio-Gruß</p>
          <div className="flex items-center gap-1.5 mt-1 text-slate-400">
            <AudioLines size={14} className={isPlaying ? `${t.text} animate-pulse` : ''} />
            <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${t.bg} transition-all duration-300`} style={{ width: isPlaying ? '100%' : '0%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 font-sans selection:bg-indigo-100">
      {isCustomTheme && (
        <style>
          {`
            .theme-custom-bg { background-color: ${profileData.customColor} !important; }
            .theme-custom-text { color: ${profileData.customColor} !important; }
            .theme-custom-text-light { color: ${profileData.customColor}cc !important; }
            .theme-custom-border { border-color: ${profileData.customColor} !important; }
            .theme-custom-ring { --tw-ring-color: ${profileData.customColor}40 !important; }
            .theme-custom-bg-light { background-color: ${profileData.customColor}1a !important; color: ${profileData.customColor} !important; }
          `}
        </style>
      )}
      <style>
        {`
          @media print {
            @page { margin: 0; size: auto; }
            body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            header, main, .fixed.bottom-0 { display: none !important; }
            #preview-modal-backdrop { position: absolute !important; background: white !important; padding: 0 !important; display: block !important; }
            #preview-modal-content { max-height: none !important; overflow: visible !important; box-shadow: none !important; margin: 0 auto !important; padding: 40px 20px !important; width: 100% !important; border-radius: 0 !important; }
            .print-hide { display: none !important; }
          }
          /* 3D Flip CSS for Quiz Cards */
          .perspective-1000 { perspective: 1000px; }
          .preserve-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}
      </style>

      <header className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className={`${t.bg} p-2 rounded-xl text-white shadow-lg transition-colors`}><Smile size={24} /></div>
          <h1 className="font-black text-lg uppercase tracking-tighter">Mein Freundebuch</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} title="Herunterladen" className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 ${t.bgLight} ${t.text} rounded-2xl font-bold transition-all ${t.hover} active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}>
            {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span className="hidden sm:inline">{isGeneratingPDF ? 'Lädt...' : 'Download'}</span>
          </button>
          {isOwner && (
            <button onClick={handleShare} className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 ${t.bgLight} ${t.text} rounded-2xl font-bold transition-all ${t.hover} active:scale-95`}>
              <LinkIcon size={18} /> <span className="hidden sm:inline">Teilen</span>
            </button>
          )}
          <button onClick={() => setShowPreview(true)} className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 ${t.bgLight} ${t.text} rounded-2xl font-bold transition-all ${t.hover} active:scale-95`}>
            <Eye size={18} /> <span className="hidden sm:inline">Vorschau</span>
          </button>
        </div>
      </header>

      {showSaveAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-3 rounded-full shadow-2xl z-50 animate-in slide-in-from-top-4">
          <span className="font-bold text-sm">Gespeichert! </span>
        </div>
      )}
      {showShareAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-3 rounded-full shadow-2xl z-50 animate-in slide-in-from-top-4">
          <span className="font-bold text-sm">Link kopiert! 🔗</span>
        </div>
      )}
      {saveError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-3 rounded-full shadow-2xl z-50 animate-in slide-in-from-top-4">
          <span className="font-bold text-sm">{saveError}</span>
        </div>
      )}

      <main className="max-w-xl mx-auto p-6 space-y-8">
        {/* Das bin ich - Basis Modul */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 overflow-hidden relative">
          <div className={`absolute top-0 left-0 right-0 h-32 ${t.bgLight} transition-colors z-0`}>
            {profileData.coverImage && <img src={profileData.coverImage} className="w-full h-full object-cover opacity-60" alt="Banner" />}
            <label className="absolute top-4 right-4 flex items-center justify-center cursor-pointer bg-white/80 hover:bg-white backdrop-blur-md px-3 py-2 rounded-xl text-slate-700 gap-2 text-xs font-bold shadow-sm transition-all active:scale-95 z-20 border border-white/50">
              <ImagePlus size={16} /> <span className="hidden sm:inline">Banner ändern</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          </div>
          
          <div className="relative pt-16 space-y-4 z-10">
            <div className="flex gap-4 items-end">
              <label className={`w-24 h-24 shrink-0 rounded-[1.5rem] flex items-center justify-center cursor-pointer shadow-lg border-4 border-white relative overflow-hidden group ${t.bgLight} ${t.text}`}>
                {profileData.avatar ? <img src={profileData.avatar} className="w-full h-full object-cover" alt="Profilbild" /> : <Camera size={32} />}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              <div className="flex-1 space-y-2">
                <input type="text" value={profileData.name} placeholder="Dein Name" onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className={`w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-black focus:ring-2 ${t.ring} outline-none text-lg transition-colors`} />
              </div>
            </div>

            <div className="space-y-3">
              <input type="text" value={profileData.bio} placeholder="Bio" onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} className={`w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-sm focus:ring-2 ${t.ring} outline-none transition-colors`} />
              <div className="flex flex-wrap items-center gap-2">
                {profileData.tags?.map((tag, idx) => (
                  <div key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 ${t.bgLight} ${t.text} rounded-xl text-[10px] font-black uppercase shadow-sm`}>
                    <Hash size={10} /> {tag}
                    <button onClick={() => setProfileData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }))} className="ml-1 hover:text-red-500"><X size={12}/></button>
                  </div>
                ))}
                {(profileData.tags || []).length < 3 && (
                  <div className="flex items-center">
                    <input type="text" value={newTagItem} onChange={(e) => setNewTagItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newTagItem.trim()) { setProfileData(prev => ({ ...prev, tags: [...(prev.tags || []), newTagItem.trim()] })); setNewTagItem(''); } }} onBlur={() => { if (newTagItem.trim()) { setProfileData(prev => ({ ...prev, tags: [...(prev.tags || []), newTagItem.trim()] })); setNewTagItem(''); } }} placeholder="Neuer Tag..." className="bg-slate-50 border-none rounded-xl px-3 py-1.5 font-bold text-[10px] uppercase outline-none focus:ring-2 focus:ring-slate-200 w-32" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest mb-2 flex items-center gap-1.5"><Calendar size={12}/> Geburtstag</label>
              <div className="flex gap-2 items-center">
                <input type="date" value={profileData.birthdate} onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })} className={`bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 ${t.ring} flex-1 text-slate-700`} />
                {(currentAge !== null || currentZodiac) && (
                  <div className="flex gap-2">
                    {currentAge !== null && <span className="bg-white border border-slate-100 shadow-sm px-3 py-3 rounded-xl font-black text-xs text-slate-700">{currentAge} J.</span>}
                    {currentZodiac && <span className={`bg-white border border-slate-100 shadow-sm px-3 py-3 rounded-xl font-black text-xs ${t.text} flex items-center gap-1`}>{currentZodiac.emoji} {currentZodiac.sign}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest mb-2 block">Steckbrief</label>
              <div className="space-y-3">
                {profileData.profileDetails?.map((detail, idx) => (
                  <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2 relative">
                    <button onClick={() => setEmojiPickerIdx(emojiPickerIdx === idx ? null : idx)} className={`w-12 h-12 flex-shrink-0 bg-slate-100/50 rounded-xl flex items-center justify-center text-xl hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 ${t.ring}`}>
                      {detail.emoji || '✨'}
                    </button>
                    {emojiPickerIdx === idx && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setEmojiPickerIdx(null)} />
                        <div className="absolute top-14 left-0 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 z-50 w-64 animate-in zoom-in-95">
                          <div className="grid grid-cols-6 gap-2 mb-3">
                            {EMOJI_LIST.map(e => (
                              <button key={e} onClick={() => { updateProfileDetail(idx, 'emoji', e); setEmojiPickerIdx(null); }} className="text-xl w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg hover:scale-125 transition-all">{e}</button>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-slate-100">
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Alle Emojis (Tastatur)</p>
                            <input type="text" value={detail.emoji} onChange={(e) => updateProfileDetail(idx, 'emoji', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-center text-xl focus:ring-2 focus:ring-slate-200 outline-none" placeholder="😊" />
                          </div>
                        </div>
                      </>
                    )}
                    <input type="text" value={detail.label} placeholder="z.B. Alter" onChange={(e) => updateProfileDetail(idx, 'label', e.target.value)} className={`w-1/3 bg-slate-100/50 border-none rounded-xl px-4 py-3 font-black uppercase text-[10px] ${t.text} outline-none transition-colors`} />
                    <input type="text" value={detail.value} placeholder="Wert" onChange={(e) => updateProfileDetail(idx, 'value', e.target.value)} className={`flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 ${t.ring} transition-colors`} />
                    <button onClick={() => removeProfileDetail(idx)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 mt-2">
                  {PROFILE_SUGGESTIONS.map(suggestion => (
                    <button key={suggestion.label} onClick={() => addProfileDetail(suggestion.label, suggestion.emoji)} className={`px-3 py-1.5 ${t.bgLight} ${t.text} rounded-full text-[10px] font-black uppercase ${t.hover} transition-colors flex items-center gap-1.5`}>
                      <span>{suggestion.emoji}</span> {suggestion.label}
                    </button>
                  ))}
                  <button onClick={() => addProfileDetail('', '')} className="px-3 py-1.5 border border-dashed border-slate-200 text-slate-400 rounded-full text-[10px] font-black uppercase hover:border-slate-300 hover:text-slate-600 transition-colors">+ Eigenes</button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest mb-2 flex items-center gap-1.5"><Sparkles size={12}/> Fun Fact</label>
              <textarea value={profileData.funFact} onChange={(e) => setProfileData({ ...profileData, funFact: e.target.value })} placeholder="Ich esse meine Pizza immer von innen nach außen..." className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 ${t.ring} outline-none resize-none min-h-[80px] text-slate-700`} />
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">@ Social Media</label>
              {Object.entries(profileData.socials).map(([type, value]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${socialTypes.find(s => s.id === type)?.color || 'from-slate-500 to-slate-700'} text-white`}>
                    {socialTypes.find(s => s.id === type)?.icon || <Globe size={18}/>}
                  </div>
                  <input type="text" value={value} placeholder="@handle oder link" onChange={(e) => setProfileData({ ...profileData, socials: { ...profileData.socials, [type]: e.target.value } })} className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none" />
                  <button onClick={() => { const next = { ...profileData.socials }; delete next[type]; setProfileData({ ...profileData, socials: next }); }} className="text-red-500 p-2"><Trash2 size={20} /></button>
                </div>
              ))}
              <button onClick={() => setShowSocialPicker(true)} className={`w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-400 ${t.hover} hover:${t.text} font-bold text-sm transition-colors`}>
                <Plus size={18} /> Social hinzufügen
              </button>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest mb-2 flex items-center gap-1.5"><Mic size={12}/> Sprachnachricht</label>
              <VoiceNoteWidget audioData={profileData.voiceNote} onSave={(audio) => setProfileData({ ...profileData, voiceNote: audio })} themeConfig={t} />
            </div>

            <div className="pt-6 border-t border-slate-50">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest mb-2 flex items-center gap-1.5"><PenTool size={12}/> Digitale Unterschrift</label>
              <SignaturePad initialSignature={profileData.signature} onSave={(sig) => setProfileData(prev => ({ ...prev, signature: sig }))} themeConfig={t} />
            </div>

            <div className="pt-6 border-t border-slate-50">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest mb-3 flex items-center gap-2"><Palette size={12}/> Lieblingsfarbe (Design)</label>
              <div className="flex flex-wrap gap-3 items-center">
                {Object.keys(THEMES).map(color => (
                  <button key={color} onClick={() => setProfileData({ ...profileData, theme: color })} title={THEMES[color].name} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${THEMES[color].bg} ${profileData.theme === color ? 'scale-110 shadow-lg ring-4 ring-slate-200' : 'scale-90 opacity-60 hover:scale-100 hover:opacity-100'}`}>
                    {profileData.theme === color && <Check size={18} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
                <label title="Eigene Farbe wählen" className={`relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${profileData.theme === 'custom' ? 'scale-110 shadow-lg ring-4 ring-slate-200' : 'scale-90 opacity-60 hover:scale-100 hover:opacity-100'}`} style={{ backgroundColor: profileData.customColor || '#6366f1' }}>
                  <input type="color" value={profileData.customColor || '#6366f1'} onChange={(e) => setProfileData({ ...profileData, theme: 'custom', customColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 opacity-0 cursor-pointer" />
                  {profileData.theme === 'custom' ? <Check size={18} className="text-white drop-shadow-md relative z-10" strokeWidth={3} /> : <Palette size={16} className="text-white/80 relative z-10" />}
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Aktive Module */}
        {profileData.activeModules.map(modId => (
          <div key={modId} className="animate-in slide-in-from-bottom-4">
            
            {/* KONZERT TAGEBUCH */}
            {modId === 'concerts' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('concerts')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-fuchsia-500 mb-6 flex items-center gap-2"><Ticket size={20} /> Konzerte & Festivals</h3>
                <div className="space-y-6">
                  {profileData.concerts?.map(concert => (
                    <div key={concert.id} className="bg-slate-50 p-5 rounded-[2rem] relative border border-slate-100">
                      <button onClick={() => removeConcert(concert.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 z-10"><Trash2 size={16} /></button>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="w-full sm:w-28 aspect-video sm:aspect-square shrink-0 rounded-2xl flex items-center justify-center cursor-pointer shadow-sm border-2 border-dashed border-slate-300 relative overflow-hidden group bg-white hover:bg-slate-50 transition-colors">
                          {concert.image ? ( <img src={concert.image} className="w-full h-full object-cover" alt="Konzert" /> ) : (
                            <div className="flex flex-col items-center text-slate-400"><Camera size={20} /><span className="text-[8px] font-black uppercase mt-1">Foto/Ticket</span></div>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleConcertImageUpload(concert.id, e)} />
                        </label>
                        <div className="flex-1 space-y-2">
                          <input type="text" value={concert.band} onChange={(e) => updateConcert(concert.id, 'band', e.target.value)} placeholder="Artist oder Band..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black focus:ring-2 focus:ring-fuchsia-500/20 text-sm outline-none" />
                          <input type="text" value={concert.location} onChange={(e) => updateConcert(concert.id, 'location', e.target.value)} placeholder="Location / Festival (z.B. Olypmiahalle, Parookaville)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
                          <div className="flex gap-2 items-center">
                            <input type="date" value={concert.date} onChange={(e) => updateConcert(concert.id, 'date', e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-fuchsia-500/20 flex-1 text-slate-700" />
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={14} className={`cursor-pointer transition-colors ${concert.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-50'}`} onClick={() => updateConcert(concert.id, 'rating', star)} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addConcert} className="w-full py-4 border-2 border-dashed border-fuchsia-200 text-fuchsia-500 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-fuchsia-50 transition-colors"><Plus size={18} /> Erlebnis hinzufügen</button>
                </div>
              </section>
            )}

            {/* Wishlist Modul */}
            {modId === 'wishlist' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('wishlist')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-pink-500 mb-6 flex items-center gap-2"><Gift size={20} /> Wunschliste</h3>
                <div className="space-y-6">
                  {profileData.wishlist?.map(wish => (
                    <div key={wish.id} className="bg-slate-50 p-5 rounded-[2rem] relative border border-slate-100">
                      <button onClick={() => removeWish(wish.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 z-10"><Trash2 size={16} /></button>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="w-full sm:w-28 aspect-square shrink-0 rounded-2xl flex items-center justify-center cursor-pointer shadow-sm border-2 border-dashed border-slate-300 relative overflow-hidden group bg-white hover:bg-slate-50 transition-colors">
                          {wish.image ? ( <img src={wish.image} className="w-full h-full object-cover" alt="Wunsch" /> ) : (
                            <div className="flex flex-col items-center text-slate-400"><ImagePlus size={20} /><span className="text-[8px] font-black uppercase mt-1">Foto</span></div>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWishImageUpload(wish.id, e)} />
                        </label>
                        <div className="flex-1 space-y-3">
                          <input type="text" value={wish.name} onChange={(e) => updateWish(wish.id, 'name', e.target.value)} placeholder="Was wünschst du dir?" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black focus:ring-2 focus:ring-pink-500/20 text-sm outline-none" />
                          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-pink-500/20">
                            <LinkIcon size={14} className="text-slate-400 shrink-0" />
                            <input type="text" value={wish.link} onChange={(e) => updateWish(wish.id, 'link', e.target.value)} placeholder="Link zum Produkt (z.B. Amazon)..." className="flex-1 bg-transparent border-none font-bold text-xs outline-none text-slate-600" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">Dringlichkeit:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={16} className={`cursor-pointer transition-colors ${wish.urgency >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-50'}`} onClick={() => updateWish(wish.id, 'urgency', star)} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addWish} className="w-full py-4 border-2 border-dashed border-pink-200 text-pink-500 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-pink-50 transition-colors"><Plus size={18} /> Wunsch hinzufügen</button>
                </div>
              </section>
            )}

            {/* Top 5 Emojis Modul */}
            {modId === 'topEmojis' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('topEmojis')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-yellow-500 mb-6 flex items-center gap-2"><Smile size={20} /> Top 5 Emojis</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="relative">
                      <button onClick={() => setEmojiPickerIdx(emojiPickerIdx === `top_${i}` ? null : `top_${i}`)} className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl hover:bg-slate-100 border-2 border-slate-100 transition-all hover:scale-105 active:scale-95">
                        {profileData.topEmojis?.[i] || <Plus size={24} className="text-slate-300" />}
                      </button>
                      {emojiPickerIdx === `top_${i}` && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setEmojiPickerIdx(null)} />
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 z-50 w-64 animate-in zoom-in-95">
                            <div className="grid grid-cols-6 gap-2 mb-3">
                              {EMOJI_LIST.map(e => (
                                <button key={e} onClick={() => { updateTopEmoji(i, e); setEmojiPickerIdx(null); }} className="text-xl w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg hover:scale-125 transition-all">{e}</button>
                              ))}
                            </div>
                            <div className="pt-3 border-t border-slate-100">
                              <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Tastatur</p>
                              <input type="text" value={profileData.topEmojis?.[i] || ''} onChange={(e) => updateTopEmoji(i, e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-center text-xl focus:ring-2 focus:ring-yellow-500/20 outline-none" placeholder="😊" />
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">{i + 1}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* BRAWL STARS MODUL */}
            {modId === 'brawlStars' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('brawlStars')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-yellow-500 mb-6 flex items-center gap-2"><Skull size={20} /> Brawl Stars</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">🏆 Trophäen</label>
                      <input type="number" placeholder="z.B. 15000" value={profileData.brawlStars?.trophies || ''} onChange={(e) => setProfileData(p => ({ ...p, brawlStars: { ...p.brawlStars, trophies: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg" />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">💎 Rang</label>
                      <input type="text" placeholder="z.B. Mythisch I" value={profileData.brawlStars?.rank || ''} onChange={(e) => setProfileData(p => ({ ...p, brawlStars: { ...p.brawlStars, rank: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg" />
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">💀 Lieblings Brawler</label>
                    <input type="text" placeholder="z.B. Spike" value={profileData.brawlStars?.favoriteBrawler || ''} onChange={(e) => setProfileData(p => ({ ...p, brawlStars: { ...p.brawlStars, favoriteBrawler: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg" />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-yellow-500/20 transition-all">
                    <LinkIcon size={18} className="text-yellow-500 shrink-0" />
                    <input type="text" placeholder="Dein Brawl Stars Freundeslink..." value={profileData.brawlStars?.friendLink || ''} onChange={(e) => setProfileData(p => ({ ...p, brawlStars: { ...p.brawlStars, friendLink: e.target.value } }))} className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder-slate-400" />
                  </div>
                </div>
              </section>
            )}

            {/* LIEBLINGSVIDEO MODUL */}
            {modId === 'favVideo' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('favVideo')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-red-600 mb-6 flex items-center gap-2"><Youtube size={20} /> Lieblingsvideo</h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">YouTube Link</label>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
                      <LinkIcon size={18} className="text-red-500 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        value={profileData.favVideo || ''} 
                        onChange={(e) => setProfileData(prev => ({ ...prev, favVideo: e.target.value }))} 
                        className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder-slate-400" 
                      />
                    </div>
                  </div>
                  {getYoutubeId(profileData.favVideo) && (
                    <div className="aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-black">
                      <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYoutubeId(profileData.favVideo)}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* LIEBLINGSPODCAST MODUL */}
            {modId === 'favPodcast' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('favPodcast')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-green-500 mb-6 flex items-center gap-2"><Podcast size={20} /> Lieblingspodcast</h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Spotify Link (Show oder Episode)</label>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                      <LinkIcon size={18} className="text-green-500 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="https://open.spotify.com/show/..." 
                        value={profileData.favPodcast || ''} 
                        onChange={(e) => setProfileData(prev => ({ ...prev, favPodcast: e.target.value }))} 
                        className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder-slate-400" 
                      />
                    </div>
                  </div>
                  {getSpotifyEmbedUrl(profileData.favPodcast) && (
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                      <iframe style={{borderRadius: '12px'}} src={getSpotifyEmbedUrl(profileData.favPodcast)} width="100%" height="152" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* LIEBLINGS CREATOR MODUL */}
            {modId === 'favCreators' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('favCreators')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-purple-600 mb-6 flex items-center gap-2"><Video size={20} /> Lieblings Creator</h3>
                <SearchBar type="creators" onSelect={(item) => addItem('creators', item)} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {profileData.favCreators?.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl relative group flex flex-col items-center text-center border border-slate-100">
                      <img src={item.image} className="w-20 h-20 rounded-full object-cover mb-2 shadow-sm border-2 border-white" alt={item.title} />
                      <p className="text-[10px] font-black uppercase leading-tight line-clamp-2">{item.title}</p>
                      <button onClick={() => setProfileData({ ...profileData, favCreators: profileData.favCreators.filter(i => i.id !== item.id) })} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* REACTION TIME MODUL */}
            {modId === 'reactionTime' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('reactionTime')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-yellow-500 mb-6 flex items-center gap-2"><Zap size={20} /> Reaktionstest</h3>
                <ReactionGame highScore={profileData.reactionTime} onNewHighScore={(score) => setProfileData(prev => ({ ...prev, reactionTime: score }))} />
                <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-slate-500">Dein Highscore: <span className="text-slate-900 font-black">{profileData.reactionTime ? `${profileData.reactionTime} ms` : '-'}</span></p>
                </div>
              </section>
            )}

            {/* MATH DASH MODUL */}
            {modId === 'mathDash' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('mathDash')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-blue-500 mb-6 flex items-center gap-2"><Calculator size={20} /> Math Dash</h3>
                <MathDashGame highScore={profileData.mathDashScore} onNewHighScore={(score) => setProfileData(prev => ({ ...prev, mathDashScore: score }))} />
                <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-slate-500">Dein Highscore: <span className="text-slate-900 font-black">{profileData.mathDashScore || 0}</span></p>
                </div>
              </section>
            )}

            {/* PIZZA CLICKER MODUL */}
            {modId === 'cps' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('cps')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-orange-500 mb-6 flex items-center gap-2"><MousePointerClick size={20} /> Pizza Clicker</h3>
                <PizzaClickerGame highScore={profileData.cpsScore} onNewHighScore={(score) => setProfileData(prev => ({ ...prev, cpsScore: score }))} />
                <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-slate-500">Dein Highscore: <span className="text-slate-900 font-black">{profileData.cpsScore || 0} Klicks</span></p>
                </div>
              </section>
            )}

            {/* SLIDE PUZZLE MODUL */}
            {modId === 'slidePuzzle' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('slidePuzzle')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-indigo-500 mb-6 flex items-center gap-2"><Puzzle size={20} /> Slide Puzzle</h3>
                
                <div className="flex flex-col items-center">
                  <label className="w-full aspect-square max-w-xs rounded-3xl flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-300 relative overflow-hidden group bg-slate-50 hover:bg-slate-100 transition-colors">
                    {profileData.slidePuzzle?.image ? (
                      <img src={profileData.slidePuzzle.image} className="w-full h-full object-cover" alt="Puzzle" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400"><ImagePlus size={32}/><span className="text-xs font-black uppercase mt-2">Bild hochladen</span></div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleSlidePuzzleImageUpload} />
                  </label>
                  {profileData.slidePuzzle?.image && <p className="text-xs font-bold text-slate-400 mt-4 text-center">Dieses Bild wird in der Vorschau als Puzzle angezeigt.</p>}
                </div>
              </section>
            )}

            {/* CIRCLE GAME MODUL */}
            {modId === 'circleGame' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('circleGame')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-indigo-500 mb-6 flex items-center gap-2"><Circle size={20} /> Kreis Zeichnen</h3>
                <CirclePainterGame highScore={profileData.circleGame?.score} onNewHighScore={(score, img) => setProfileData(prev => ({ ...prev, circleGame: { score, image: img } }))} />
                <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-slate-500">Dein Highscore: <span className="text-slate-900 font-black">{profileData.circleGame?.score || 0}%</span></p>
                </div>
              </section>
            )}

            {/* WORDLE MODUL */}
            {modId === 'wordle' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('wordle')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-emerald-600 mb-6 flex items-center gap-2"><Grid3x3 size={20} /> Wordle</h3>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Lösungswort (4-7 Buchstaben)</label>
                  <input type="text" maxLength={7} value={profileData.wordle?.targetWord || ''} onChange={(e) => setProfileData(prev => ({ ...prev, wordle: { targetWord: e.target.value.toUpperCase().replace(/[^A-ZÄÖÜ]/g, '') } }))} placeholder="z.B. PIZZA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-lg tracking-widest uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 text-center" />
                </div>
              </section>
            )}

            {/* SECRET MESSAGE MODUL */}
            {modId === 'secretMessage' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('secretMessage')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-slate-700 mb-2 flex items-center gap-2"><Lock size={20} /> Secret Message</h3>
                <p className="text-xs font-bold text-slate-500 mb-6 leading-relaxed">
                  Hinterlasse eine geheime Nachricht! Nur Freunde, die die Antwort auf deine Frage wissen, können den Text lesen. (Groß-/Kleinschreibung wird ignoriert)
                </p>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block ml-1">Sicherheitsfrage</label>
                      <input type="text" value={profileData.secretMessage?.question || ''} onChange={(e) => setProfileData(prev => ({ ...prev, secretMessage: { ...prev.secretMessage, question: e.target.value } }))} placeholder="z.B. Wie hieß mein erster Hund?" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-500/20" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block ml-1">Antwort (Passwort)</label>
                      <div className="relative">
                        <input type="text" value={profileData.secretMessage?.answer || ''} onChange={(e) => setProfileData(prev => ({ ...prev, secretMessage: { ...prev.secretMessage, answer: e.target.value } }))} placeholder="Die geheime Antwort..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-500/20 pr-10" />
                        <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block ml-1">Geheime Nachricht</label>
                    <textarea value={profileData.secretMessage?.message || ''} onChange={(e) => setProfileData(prev => ({ ...prev, secretMessage: { ...prev.secretMessage, message: e.target.value } }))} placeholder="Schreibe hier, was nur deine echten Freunde lesen sollen..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-slate-500/20 outline-none resize-none min-h-[120px] text-slate-700" />
                  </div>
                </div>
              </section>
            )}

            {/* SETUP MODUL */}
            {modId === 'setup' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('setup')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-cyan-500 mb-6 flex items-center gap-2"><Monitor size={20} /> Mein Setup</h3>
                
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Bilder (Max 5)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {profileData.setup?.images?.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100">
                        <img src={img} className="w-full h-full object-cover" alt="Setup" />
                        <button onClick={() => removeSetupImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                      </div>
                    ))}
                    {(profileData.setup?.images?.length || 0) < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
                        <ImagePlus size={20} /><span className="text-[9px] font-black uppercase mt-1">Upload</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleSetupImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">Komponenten</p>
                  {profileData.setup?.components?.map(comp => (
                    <div key={comp.id} className="flex gap-2">
                      <input type="text" value={comp.label} onChange={(e) => updateSetupComponent(comp.id, 'label', e.target.value)} placeholder="Teil (z.B. GPU)" className="w-1/3 bg-slate-50 border-none rounded-xl px-3 py-2 font-black text-xs outline-none focus:ring-2 focus:ring-cyan-500/20" />
                      <input type="text" value={comp.value} onChange={(e) => updateSetupComponent(comp.id, 'value', e.target.value)} placeholder="Name (z.B. RTX 3060)" className="flex-1 bg-slate-50 border-none rounded-xl px-3 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-cyan-500/20" />
                      <button onClick={() => removeSetupComponent(comp.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button onClick={addSetupComponent} className="w-full py-3 border-2 border-dashed border-cyan-200 text-cyan-500 rounded-xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-cyan-50 transition-colors"><Plus size={16} /> Komponente hinzufügen</button>
                </div>
              </section>
            )}

            {/* HAY DAY MODUL */}
            {modId === 'hayday' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('hayday')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-yellow-600 mb-6 flex items-center gap-2"><Tractor size={20} /> Hay Day</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">⭐ Farm Level</label>
                      <input type="number" placeholder="z.B. 45" value={profileData.hayday?.level || ''} onChange={(e) => setProfileData(p => ({ ...p, hayday: { ...p.hayday, level: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg" />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">🤝 Freundescode</label>
                      <input type="text" placeholder="#..." value={profileData.hayday?.friendCode || ''} onChange={(e) => setProfileData(p => ({ ...p, hayday: { ...p.hayday, friendCode: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg uppercase" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2">Farm Screenshot</label>
                    <label className="w-full aspect-video rounded-3xl flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-300 relative overflow-hidden group bg-slate-50 hover:bg-slate-100 transition-colors">
                      {profileData.hayday?.farmImage ? (
                        <img src={profileData.hayday.farmImage} className="w-full h-full object-cover" alt="Meine Farm" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400"><ImagePlus size={24}/><span className="text-[10px] font-black uppercase mt-1">Foto hochladen</span></div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleHaydayImageUpload} />
                    </label>
                    {profileData.hayday?.farmImage && (
                      <button onClick={() => setProfileData(p => ({ ...p, hayday: { ...p.hayday, farmImage: null } }))} className="mt-2 self-start text-[10px] text-red-500 font-bold uppercase hover:underline ml-2">Bild entfernen</button>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* CLASH OF CLANS MODUL */}
            {modId === 'coc' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('coc')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-amber-500 mb-6 flex items-center gap-2"><Swords size={20} /> Clash of Clans</h3>
                
                <div className="space-y-6">
                  {/* Stats Eingabe */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">🏆 Trophäen</label>
                      <input type="number" placeholder="z.B. 4500" value={profileData.coc?.trophies || ''} onChange={(e) => setProfileData(p => ({ ...p, coc: { ...p.coc, trophies: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg" />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">🏛️ Rathaus Lvl</label>
                      <input type="number" placeholder="z.B. 15" value={profileData.coc?.townHall || ''} onChange={(e) => setProfileData(p => ({ ...p, coc: { ...p.coc, townHall: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg" />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">🏆 Bauarbeiter Trophäen</label>
                      <input type="number" placeholder="z.B. 3000" value={profileData.coc?.builderTrophies || ''} onChange={(e) => setProfileData(p => ({ ...p, coc: { ...p.coc, builderTrophies: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg" />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">🔨 Meisterhütte Lvl</label>
                      <input type="number" placeholder="z.B. 9" value={profileData.coc?.builderHall || ''} onChange={(e) => setProfileData(p => ({ ...p, coc: { ...p.coc, builderHall: e.target.value } }))} className="w-full bg-transparent font-black text-slate-800 outline-none text-lg" />
                    </div>
                  </div>

                  {/* Bilder Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2">Normales Dorf</label>
                      <label className="w-full aspect-video rounded-3xl flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-300 relative overflow-hidden group bg-slate-50 hover:bg-slate-100 transition-colors">
                        {profileData.coc?.villageImage ? (
                          <img src={profileData.coc.villageImage} className="w-full h-full object-cover" alt="Normales Dorf" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400"><ImagePlus size={24}/><span className="text-[10px] font-black uppercase mt-1">Screenshot</span></div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCocImageUpload('villageImage', e)} />
                      </label>
                      {profileData.coc?.villageImage && (
                        <button onClick={() => setProfileData(p => ({ ...p, coc: { ...p.coc, villageImage: null } }))} className="mt-2 self-start text-[10px] text-red-500 font-bold uppercase hover:underline ml-2">Bild entfernen</button>
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2">Bauarbeiterbasis</label>
                      <label className="w-full aspect-video rounded-3xl flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-300 relative overflow-hidden group bg-slate-50 hover:bg-slate-100 transition-colors">
                        {profileData.coc?.builderBaseImage ? (
                          <img src={profileData.coc.builderBaseImage} className="w-full h-full object-cover" alt="Bauarbeiterbasis" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400"><ImagePlus size={24}/><span className="text-[10px] font-black uppercase mt-1">Screenshot</span></div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCocImageUpload('builderBaseImage', e)} />
                      </label>
                      {profileData.coc?.builderBaseImage && (
                        <button onClick={() => setProfileData(p => ({ ...p, coc: { ...p.coc, builderBaseImage: null } }))} className="mt-2 self-start text-[10px] text-red-500 font-bold uppercase hover:underline ml-2">Bild entfernen</button>
                      )}
                    </div>
                  </div>

                  {/* Freundeslink */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                    <LinkIcon size={18} className="text-amber-500 shrink-0" />
                    <input type="text" placeholder="Dein CoC Freundeslink (https://link.clashofclans.com/...)" value={profileData.coc?.friendLink || ''} onChange={(e) => setProfileData(p => ({ ...p, coc: { ...p.coc, friendLink: e.target.value } }))} className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder-slate-400" />
                  </div>
                </div>
              </section>
            )}

            {/* BEZIEHUNG MODUL */}
            {modId === 'relationships' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('relationships')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-rose-500 mb-6 flex items-center gap-2"><Heart size={20} className="fill-rose-500" /> Beziehung</h3>
                <div className="space-y-6">
                  {profileData.relationships?.map(rel => (
                    <div key={rel.id} className="bg-slate-50 p-5 rounded-[2rem] relative border border-slate-100">
                      <button onClick={() => removeRelationship(rel.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                      <div className="flex gap-4">
                        <label className="w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center cursor-pointer shadow-sm border-2 border-dashed border-slate-300 relative overflow-hidden group bg-white hover:bg-slate-50 transition-colors">
                          {rel.image ? ( <img src={rel.image} className="w-full h-full object-cover" alt="Partner" /> ) : (
                            <div className="flex flex-col items-center text-slate-400"><Camera size={20} /><span className="text-[8px] font-black uppercase mt-1">Foto</span></div>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleRelationshipImageUpload(rel.id, e)} />
                        </label>
                        <div className="flex-1 space-y-2">
                          <input type="text" value={rel.name} onChange={(e) => updateRelationship(rel.id, 'name', e.target.value)} placeholder="Name deines Partners..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black focus:ring-2 focus:ring-rose-500/20 text-sm outline-none" />
                          <div className="flex gap-2 items-center">
                            <label className="text-[10px] font-black uppercase text-slate-400 shrink-0">Zusammen seit</label>
                            <input type="date" value={rel.startDate} onChange={(e) => updateRelationship(rel.id, 'startDate', e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700" />
                          </div>
                        </div>
                      </div>
                      {rel.startDate && (
                        <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-center">
                          <p className="text-sm font-black text-rose-500 bg-rose-100/50 px-4 py-2 rounded-xl border border-rose-100">
                            Wir sind schon seit {calculateCurrentStreak(rel.startDate)} Tagen zusammen! 💖
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={addRelationship} className="w-full py-4 border-2 border-dashed border-rose-200 text-rose-500 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-rose-50 transition-colors"><Plus size={18} /> Partner hinzufügen</button>
                </div>
              </section>
            )}

            {/* Werdegang Modul */}
            {modId === 'career' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('career')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-blue-600 mb-6 flex items-center gap-2"><Briefcase size={20} /> Werdegang</h3>
                <div className="space-y-4 mb-8 bg-slate-50 p-5 rounded-3xl">
                  <input type="text" value={newCareerRole} onChange={(e) => setNewCareerRole(e.target.value)} placeholder="Titel / Position (z.B. Software Entwickler)..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input type="text" value={newCareerCompany} onChange={(e) => setNewCareerCompany(e.target.value)} placeholder="Unternehmen / Schule..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={newCareerStart} onChange={(e) => setNewCareerStart(e.target.value)} placeholder="Von (z.B. 2020)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <input type="text" value={newCareerEnd} onChange={(e) => setNewCareerEnd(e.target.value)} placeholder="Bis (z.B. Heute)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <textarea value={newCareerDesc} onChange={(e) => setNewCareerDesc(e.target.value)} placeholder="Kurzbeschreibung (Optional)..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[60px]" />
                  <button onClick={addCareerItem} disabled={!newCareerRole.trim() || !newCareerCompany.trim()} className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center font-black uppercase text-xs hover:bg-blue-700 transition-colors disabled:opacity-50">Hinzufügen</button>
                </div>
                <div className="space-y-4">
                  {profileData.career?.map(item => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-2xl relative border border-slate-100 flex justify-between items-start group">
                      <div>
                        <h4 className="font-black text-slate-800 text-sm leading-tight">{item.role}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 mb-2">{item.company} {item.start} - {item.end}</p>
                        {item.description && <p className="text-xs font-bold text-slate-600">{item.description}</p>}
                      </div>
                      <button onClick={() => removeCareerItem(item.id)} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {(!profileData.career || profileData.career.length === 0) && (
                    <p className="text-center text-slate-400 font-bold text-xs py-2">Füge deine Stationen hinzu!</p>
                  )}
                </div>
              </section>
            )}

            {/* Moodboard Modul */}
            {modId === 'moodboard' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('moodboard')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-pink-400 mb-6 flex items-center gap-2"><Images size={20} /> Moodboard</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {profileData.moodboard?.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={img} className="w-full h-full object-cover" alt="Mood" />
                      <button onClick={() => removeMoodboardImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center bg-pink-50 border-2 border-dashed border-pink-200 text-pink-400 rounded-2xl cursor-pointer hover:bg-pink-100 transition-colors">
                    <ImagePlus size={24} />
                    <span className="text-[10px] font-black uppercase mt-2">Bilder</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleMoodboardImageUpload} />
                  </label>
                </div>
              </section>
            )}

            {/* Zwei Wahrheiten eine Lüge */}
            {modId === 'twoTruths' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('twoTruths')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-yellow-500 mb-6 flex items-center gap-2"><Lightbulb size={20} /> 2 Wahrheiten, 1 Lüge</h3>
                <p className="text-xs font-bold text-slate-500 mb-4">Trage drei Fakten ein und markiere (x), welcher davon die Lüge ist.</p>
                <div className="space-y-3">
                  {(profileData.twoTruths || []).map((item, idx) => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${item.isLie ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <button onClick={() => handleTwoTruthsLieSelect(item.id)} className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${item.isLie ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300 text-transparent hover:border-slate-400'}`}>
                        <X size={14} strokeWidth={3} />
                      </button>
                      <input type="text" value={item.text} onChange={(e) => handleTwoTruthsChange(item.id, e.target.value)} placeholder={`Fakt ${idx + 1}...`} className="flex-1 bg-transparent border-none font-bold text-sm outline-none" />
                      {item.isLie && <span className="text-[10px] font-black uppercase text-red-500 mr-2 shrink-0">Lüge</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Screen-Time Modul */}
            {modId === 'screenTime' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('screenTime')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-slate-800 mb-6 flex items-center gap-2"><Smartphone size={20} /> Screen-Time</h3>
                <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-3xl">
                  <div className="flex gap-2 items-center">
                    <div className="relative">
                      <button onClick={() => setEmojiPickerIdx(emojiPickerIdx === 'new_app' ? null : 'new_app')} className="w-12 h-12 flex-shrink-0 bg-white rounded-xl flex items-center justify-center text-xl hover:bg-slate-100 border border-slate-200 shadow-sm transition-colors">{newAppEmoji}</button>
                      {emojiPickerIdx === 'new_app' && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setEmojiPickerIdx(null)} />
                          <div className="absolute top-14 left-0 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 z-50 w-64 animate-in zoom-in-95">
                            <div className="grid grid-cols-6 gap-2 mb-3">
                              {['📱','🎮','📸','🎵','🐦','💼'].map(e => (
                                <button key={e} onClick={() => { setNewAppEmoji(e); setEmojiPickerIdx(null); }} className="text-xl w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg hover:scale-125 transition-all">{e}</button>
                              ))}
                            </div>
                            <div className="pt-3 border-t border-slate-100">
                              <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Alle Emojis (Tastatur)</p>
                              <input type="text" value={newAppEmoji} onChange={(e) => setNewAppEmoji(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-center text-xl focus:ring-2 focus:ring-slate-200 outline-none" placeholder="📱" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <input type="text" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} placeholder="App Name (z.B. TikTok)..." className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-500/20" />
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newAppTime} onChange={(e) => setNewAppTime(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addScreenTimeApp()} placeholder="Nutzungszeit (z.B. 3h 12m) - Optional" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs outline-none focus:ring-2 focus:ring-slate-500/20 text-slate-600" />
                    <button onClick={addScreenTimeApp} disabled={!newAppName.trim()} className="bg-slate-800 text-white px-5 rounded-xl disabled:opacity-50 hover:bg-slate-900 transition-colors"><Plus size={20} /></button>
                  </div>
                </div>
                <div className="space-y-3">
                  {profileData.screenTime?.map((app, idx) => {
                    const APP_GRADIENTS = ['from-blue-400 to-indigo-600', 'from-emerald-400 to-emerald-600', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500', 'from-purple-400 to-violet-600'];
                    return (
                      <div key={app.id} className="bg-white p-3 rounded-2xl flex justify-between items-center gap-4 border border-slate-100 shadow-sm group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${APP_GRADIENTS[idx % APP_GRADIENTS.length]} text-white shadow-sm shrink-0`}>{app.emoji}</div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-800 leading-tight">{app.name}</p>
                          {app.time && <p className="font-black text-[10px] text-slate-400 mt-0.5">{app.time}</p>}
                        </div>
                        <button onClick={() => removeScreenTimeApp(app.id)} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                    )
                  })}
                  {(!profileData.screenTime || profileData.screenTime.length === 0) && (
                    <p className="text-center text-slate-400 font-bold text-xs py-2">Welche Apps rauben dir die meiste Zeit?</p>
                  )}
                </div>
              </section>
            )}

            {/* Quiz Modul */}
            {modId === 'quiz' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('quiz')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-indigo-500 mb-6 flex items-center gap-2"><HelpCircle size={20} /> Q&A Quiz</h3>
                <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-3xl">
                  <input type="text" value={newQuizQuestion} onChange={(e) => setNewQuizQuestion(e.target.value)} placeholder="Frage (z.B. Was ist mein Lieblingsessen?)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <div className="flex gap-2">
                    <input type="text" value={newQuizAnswer} onChange={(e) => setNewQuizAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addQuizItem(); }} placeholder="Antwort (z.B. Pizza)" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-indigo-600" />
                    <button onClick={addQuizItem} disabled={!newQuizQuestion.trim() || !newQuizAnswer.trim()} className="bg-indigo-500 text-white px-5 rounded-xl disabled:opacity-50 hover:bg-indigo-600 transition-colors"><Plus size={20} /></button>
                  </div>
                </div>
                <div className="space-y-3">
                  {profileData.quiz?.map(item => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-start gap-4 border border-slate-100 group">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-800 mb-1">F: {item.question}</p>
                        <p className="font-black text-xs text-indigo-500">A: {item.answer}</p>
                      </div>
                      <button onClick={() => removeQuizItem(item.id)} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {(!profileData.quiz || profileData.quiz.length === 0) && (
                    <p className="text-center text-slate-400 font-bold text-xs py-4">Füge deine erste Quiz-Frage hinzu!</p>
                  )}
                </div>
              </section>
            )}

            {/* Zitate-Wand Modul */}
            {modId === 'friendsQuotes' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('friendsQuotes')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-pink-500 mb-6 flex items-center gap-2"><StickyNote size={20} /> Zitate-Wand</h3>
                <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-3xl">
                  <textarea value={newFriendQuoteText} onChange={(e) => setNewFriendQuoteText(e.target.value)} placeholder="Wir müssen unbedingt mal wieder..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20 resize-none min-h-[80px]" />
                  <div className="flex gap-2">
                    <input type="text" value={newFriendQuoteAuthor} onChange={(e) => setNewFriendQuoteAuthor(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addFriendQuote(); }} placeholder="- Wer hat's gesagt? -" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-xs outline-none focus:ring-2 focus:ring-pink-500/20 text-slate-600" />
                    <button onClick={addFriendQuote} disabled={!newFriendQuoteText} className="bg-pink-500 text-white px-5 rounded-xl flex items-center justify-center hover:bg-pink-600 transition-colors disabled:opacity-50"><Plus size={20} /></button>
                  </div>
                </div>
                <div className="space-y-3">
                  {profileData.friendsQuotes?.map(quote => (
                    <div key={quote.id} className="flex gap-3 bg-pink-50/50 p-4 rounded-2xl group border border-pink-100">
                      <Quote className="text-pink-200 shrink-0" size={24} />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-700 italic mb-1">"{quote.text}"</p>
                        <p className="font-black text-[10px] text-pink-500 uppercase tracking-wider">- {quote.author}</p>
                      </div>
                      <button onClick={() => removeFriendQuote(quote.id)} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity self-start"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {(!profileData.friendsQuotes || profileData.friendsQuotes.length === 0) && (
                    <p className="text-center text-slate-400 font-bold text-xs py-4">Pinn das erste Zitat an die Wand!</p>
                  )}
                </div>
              </section>
            )}

            {/* Everyday Carry Modul */}
            {modId === 'everydayCarry' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('everydayCarry')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-orange-500 mb-6 flex items-center gap-2"><Backpack size={20} /> Tascheninhalt</h3>
                <div className="flex gap-2 mb-6 items-center">
                  <div className="relative">
                    <button onClick={() => setEmojiPickerIdx(emojiPickerIdx === 'new_edc' ? null : 'new_edc')} className="w-12 h-12 flex-shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-xl hover:bg-slate-100 transition-colors border border-slate-100">{newEdcItemEmoji}</button>
                    {emojiPickerIdx === 'new_edc' && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setEmojiPickerIdx(null)} />
                        <div className="absolute top-14 left-0 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 z-50 w-64 animate-in zoom-in-95">
                          <div className="grid grid-cols-6 gap-2 mb-3">
                            {['🎒','🔑','📱','🎧','💳','🖊️'].map(e => (
                              <button key={e} onClick={() => { setNewEdcItemEmoji(e); setEmojiPickerIdx(null); }} className="text-xl w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg hover:scale-125 transition-all">{e}</button>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-slate-100">
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Alle Emojis</p>
                            <input type="text" value={newEdcItemEmoji} onChange={(e) => setNewEdcItemEmoji(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-center text-xl focus:ring-2 focus:ring-slate-200 outline-none" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <input type="text" value={newEdcItemName} onChange={(e) => setNewEdcItemName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addEdcItem(); }} placeholder="Gegenstand (z.B. AirPods)..." className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <button onClick={addEdcItem} disabled={!newEdcItemName.trim()} className="bg-orange-500 text-white px-4 rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50"><Plus size={20} /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.everydayCarry?.map(item => (
                    <div key={item.id} className="flex items-center gap-2 bg-orange-50/50 border border-orange-100 px-3 py-2 rounded-2xl group">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="font-bold text-sm text-slate-700">{item.name}</span>
                      <button onClick={() => removeEdcItem(item.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1"><X size={14} /></button>
                    </div>
                  ))}
                  {(!profileData.everydayCarry || profileData.everydayCarry.length === 0) && (
                    <p className="w-full text-center text-slate-400 font-bold text-xs py-4">Was hast du immer in der Tasche?</p>
                  )}
                </div>
              </section>
            )}

            {/* Haustiere Modul */}
            {modId === 'pets' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('pets')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-amber-700 mb-6 flex items-center gap-2"><PawPrint size={20} /> Meine Haustiere</h3>
                <div className="space-y-6">
                  {profileData.pets?.map(pet => (
                    <div key={pet.id} className="bg-slate-50 p-5 rounded-[2rem] relative border border-slate-100">
                      <button onClick={() => removePet(pet.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                      <div className="flex gap-4">
                        <label className="w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center cursor-pointer shadow-sm border-2 border-dashed border-slate-300 relative overflow-hidden group bg-white hover:bg-slate-50 transition-colors">
                          {pet.image ? ( <img src={pet.image} className="w-full h-full object-cover" alt="Haustier" /> ) : (
                            <div className="flex flex-col items-center text-slate-400"><Camera size={20} /><span className="text-[8px] font-black uppercase mt-1">Foto</span></div>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePetImageUpload(pet.id, e)} />
                        </label>
                        <div className="flex-1 space-y-2">
                          <input type="text" value={pet.name} onChange={(e) => updatePet(pet.id, 'name', e.target.value)} placeholder="Name des Tieres..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black focus:ring-2 focus:ring-amber-500/20 text-sm outline-none" />
                          <div className="flex gap-2">
                            <input type="text" value={pet.type} onChange={(e) => updatePet(pet.id, 'type', e.target.value)} placeholder="Art (z.B. Hund)" className="flex-1 w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-amber-500/20" />
                            <input type="text" value={pet.breed} onChange={(e) => updatePet(pet.id, 'breed', e.target.value)} placeholder="Rasse (Optional)" className="flex-1 w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-amber-500/20" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5 w-24 shrink-0"><Calendar size={12}/> Geboren am</label>
                        <input type="date" value={pet.birthdate} onChange={(e) => updatePet(pet.id, 'birthdate', e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-amber-500/20 flex-1 text-slate-700" />
                      </div>
                    </div>
                  ))}
                  <button onClick={addPet} className="w-full py-4 border-2 border-dashed border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-amber-50 transition-colors"><Plus size={18} /> Weiteres Haustier hinzufügen</button>
                </div>
              </section>
            )}

            {/* Zeitkapsel Modul */}
            {modId === 'timeCapsule' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('timeCapsule')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-violet-500 mb-6 flex items-center gap-2"><Hourglass size={20} /> Zeitkapsel</h3>
                <div className="space-y-4">
                  {TIME_CAPSULE_QUESTIONS.map(q => (
                    <div key={q.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                      <label className="text-[10px] font-black uppercase text-violet-400 block mb-2">{q.label}</label>
                      <textarea value={profileData.timeCapsule?.[q.id] || ''} onChange={(e) => setProfileData(prev => ({ ...prev, timeCapsule: { ...prev.timeCapsule, [q.id]: e.target.value } }))} placeholder="Deine Gedanken dazu..." className="w-full bg-transparent border-none font-bold text-sm text-slate-700 focus:outline-none resize-none min-h-[40px]" />
                    </div>
                  ))}
                  {profileData.customTimeCapsule?.map(cq => (
                    <div key={cq.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all relative group">
                      <button onClick={() => removeCustomTimeCapsule(cq.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1 md:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      <input type="text" value={cq.question} onChange={(e) => updateCustomTimeCapsule(cq.id, 'question', e.target.value)} placeholder="Eigene Frage (z.B. Mein Lieblingswort aktuell...)" className="w-[calc(100%-2rem)] bg-transparent border-none font-black uppercase text-[10px] text-violet-500 mb-2 outline-none placeholder:text-violet-300" />
                      <textarea value={cq.answer} onChange={(e) => updateCustomTimeCapsule(cq.id, 'answer', e.target.value)} placeholder="Deine Gedanken dazu..." className="w-full bg-transparent border-none font-bold text-sm text-slate-700 focus:outline-none resize-none min-h-[40px]" />
                    </div>
                  ))}
                  <button onClick={addCustomTimeCapsule} className="w-full py-4 border-2 border-dashed border-violet-200 text-violet-500 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-violet-50 transition-colors"><Plus size={18} /> Eigene Frage hinzufügen</button>
                </div>
              </section>
            )}

            {/* Skill Tree Modul */}
            {modId === 'skills' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('skills')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-blue-500 mb-6 flex items-center gap-2"><BarChart2 size={20} /> Skill-Tree</h3>
                <div className="flex flex-col gap-4 mb-6 bg-slate-50 p-4 rounded-3xl">
                  <div className="flex items-center gap-2">
                    <input type="text" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }} placeholder="Neue Fähigkeit (z.B. Kochen)..." className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <span className="font-black text-blue-500 w-12 text-right">{newSkillValue}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="range" min="0" max="100" value={newSkillValue} onChange={(e) => setNewSkillValue(e.target.value)} className="flex-1 accent-blue-500 cursor-pointer" />
                    <button onClick={addSkill} disabled={!newSkillName} className="bg-blue-500 text-white p-3 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"><Plus size={20} /></button>
                  </div>
                </div>
                <div className="space-y-4">
                  {profileData.skills?.map(skill => (
                    <div key={skill.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl group border border-transparent hover:border-slate-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-sm text-slate-700">{skill.name}</span>
                          <span className="font-black text-xs text-blue-500">{skill.value}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={skill.value} onChange={(e) => updateSkill(skill.id, e.target.value)} className="w-full accent-blue-500 cursor-pointer" />
                      </div>
                      <button onClick={() => removeSkill(skill.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  {(!profileData.skills || profileData.skills.length === 0) && (
                    <p className="text-center text-slate-400 font-bold text-xs py-4">Füge deine erste Fähigkeit hinzu!</p>
                  )}
                </div>
              </section>
            )}

            {/* Tier List */}
            {modId === 'tierList' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('tierList')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-yellow-500 mb-6 flex items-center gap-2"><Trophy size={20} /> Tier List Ranking</h3>
                <div className="space-y-8">
                  {(profileData.tierLists || []).map((list) => (
                    <div key={list.id} className="bg-slate-50 p-5 rounded-[2rem] relative border border-slate-100">
                      <button onClick={() => removeTierList(list.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                      <input type="text" value={list.topic} onChange={(e) => updateTierListTopic(list.id, e.target.value)} placeholder="Thema (z.B. Fast Food, Spiele...)" className="w-[calc(100%-2rem)] bg-white border-none rounded-xl px-5 py-4 font-black focus:ring-2 focus:ring-yellow-500/20 text-lg outline-none mb-4 text-slate-700 shadow-sm" />
                      <div className="flex gap-2 mb-6 items-center">
                        <select value={newTierItemLevels[list.id] || 'S'} onChange={(e) => setNewTierItemLevels(prev => ({ ...prev, [list.id]: e.target.value }))} className="bg-white border border-slate-200 rounded-xl px-3 py-3 font-black text-sm outline-none focus:ring-2 focus:ring-yellow-500/20 cursor-pointer">
                          {TIER_LEVELS.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
                        </select>
                        <input type="text" value={newTierItemTexts[list.id] || ''} onChange={(e) => setNewTierItemTexts(prev => ({ ...prev, [list.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') addTierItem(list.id); }} placeholder="Neuer Begriff..." className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-yellow-500/20" />
                        <button onClick={() => addTierItem(list.id)} disabled={!newTierItemTexts[list.id]} className="bg-yellow-400 text-white p-3 rounded-xl flex items-center justify-center hover:bg-yellow-500 transition-colors disabled:opacity-50"><Plus size={20} /></button>
                      </div>
                      <div className="space-y-1.5 bg-slate-800 p-2 rounded-2xl">
                        {TIER_LEVELS.map(tier => {
                          const tierItems = list.items?.filter(i => i.tier === tier.value) || [];
                          return (
                            <div key={tier.value} className="flex bg-slate-900 rounded-xl overflow-hidden min-h-[3rem] border border-slate-700/50">
                              <div className={`w-12 sm:w-16 flex-shrink-0 flex items-center justify-center font-black text-xl text-slate-900 ${tier.color}`}>{tier.value}</div>
                              <div className="flex-1 p-2 flex flex-wrap gap-2 items-center">
                                {tierItems.map(item => (
                                  <div key={item.id} className="bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-2 group">
                                    {item.text}
                                    <button onClick={() => removeTierItem(list.id, item.id)} className="opacity-50 hover:opacity-100 hover:text-red-400 transition-opacity"><X size={12} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  <button onClick={addTierList} className="w-full py-4 border-2 border-dashed border-yellow-300 text-yellow-600 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-yellow-50 transition-colors"><Plus size={18} /> Weitere Tier List hinzufügen</button>
                </div>
              </section>
            )}

            {/* Duolingo */}
            {modId === 'duolingo' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
                <button onClick={() => removeModule('duolingo')} className="absolute top-8 right-8 text-red-400 p-2 z-10"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-emerald-500 mb-6 flex items-center gap-2"><Languages size={20} /> Duolingo Streak</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Sprache</label>
                    <input type="text" value={profileData.duolingo.language} placeholder="Spanisch..." onChange={(e) => setProfileData({ ...profileData, duolingo: { ...profileData.duolingo, language: e.target.value } })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Aktueller Streak </label>
                    <input type="number" value={profileData.duolingo.initialStreak} placeholder="Tage" onChange={(e) => handleDuolingoStreakChange(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                  </div>
                </div>
              </section>
            )}

            {/* Reisetagebuch */}
            {modId === 'travels' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('travels')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-teal-500 mb-6 flex items-center gap-2"><PlaneTakeoff size={20} /> Reisetagebuch</h3>
                <div className="flex gap-2 mb-6 bg-slate-50 p-4 rounded-3xl">
                  <input type="text" value={newTravelLocation} onChange={(e) => setNewTravelLocation(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newTravelLocation) handleAddTravel(); }} placeholder="Ort oder Land (z.B. Paris, Japan)..." className="flex-1 bg-white border-none rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-teal-500/10 text-sm outline-none" />
                  <button onClick={handleAddTravel} disabled={isFetchingLocation || !newTravelLocation} className="bg-teal-500 text-white py-3 px-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors disabled:opacity-50">
                    {isFetchingLocation ? <Loader2 className="animate-spin" size={20} /> : <Plus size={24} />}
                  </button>
                </div>
                <div className="space-y-4">
                  {profileData.travels?.map(travel => (
                    <div key={travel.id} className={`bg-white border-2 ${travel.status === 'planned' ? 'border-orange-100' : 'border-slate-50'} rounded-3xl p-5 relative group overflow-hidden transition-colors`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{travel.flag}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-lg text-slate-800 leading-tight">{travel.name || travel.city}</p>
                              {travel.status !== 'planned' && (
                                <input type="text" value={travel.year || ''} onChange={(e) => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, year: e.target.value } : t) }))} placeholder="Jahr..." className="w-16 bg-slate-50 border-none rounded-lg px-2 py-1 font-bold text-[10px] outline-none text-slate-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, status: 'visited' } : t) }))} className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-colors ${travel.status !== 'planned' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>Besucht</button>
                              <button onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, status: 'planned' } : t) }))} className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-colors ${travel.status === 'planned' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>Traumziel</button>
                            </div>
                            {travel.status !== 'planned' && (
                              <div className="flex items-center gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} size={14} className={`cursor-pointer transition-colors ${travel.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-50'}`} onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, rating: star } : t) }))} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, favorite: !t.favorite } : t) }))} className={`p-2 rounded-full transition-colors ${travel.favorite ? 'bg-rose-100 text-rose-500' : 'bg-slate-50 text-slate-300 hover:text-rose-400'}`}><Heart size={18} className={travel.favorite ? 'fill-rose-500' : ''} /></button>
                          <button onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.filter(t => t.id !== travel.id) }))} className="text-slate-300 hover:text-red-500 p-2 bg-slate-50 rounded-full"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 mb-4 bg-slate-50 p-3 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <input type="text" value={travel.companions || ''} onChange={(e) => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, companions: e.target.value } : t) }))} placeholder="Mit wem? (z.B. Familie, Anna...)" className="flex-1 bg-transparent border-none font-bold text-xs outline-none text-slate-600 placeholder:text-slate-400" />
                        </div>
                        <div className="mt-1">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1"><Music size={12}/> Soundtrack</p>
                          {travel.song ? (
                            typeof travel.song === 'string' ? (
                              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100"><p className="flex-1 text-xs font-bold text-slate-600 truncate">{travel.song}</p><button onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, song: null } : t) }))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14}/></button></div>
                            ) : (
                              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 relative"><img src={travel.song.image} className="w-10 h-10 rounded-lg object-cover" alt="" /><div className="flex-1 overflow-hidden"><p className="text-[10px] font-black uppercase truncate text-slate-800">{travel.song.title}</p><p className="text-[8px] font-bold text-slate-400 truncate">{travel.song.subtitle}</p></div><button onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, song: null } : t) }))} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={14}/></button></div>
                            )
                          ) : (
                            <div className="-mb-6"><SearchBar type="music" onSelect={(item) => { setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, song: item } : t) })) }} /></div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50">
                          {TRIP_TYPES.map(type => (
                            <button key={type.id} onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, type: t.type === type.id ? '' : type.id } : t) }))} className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors ${travel.type === type.id ? 'bg-white shadow-sm border border-slate-200' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}><span>{type.icon}</span> {type.label}</button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50">
                          {TRANSPORT_TYPES.map(trans => (
                            <button key={trans.id} onClick={() => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, transport: t.transport === trans.id ? '' : trans.id } : t) }))} className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors ${travel.transport === trans.id ? 'bg-white shadow-sm border border-slate-200' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}><span>{trans.icon}</span> {trans.label}</button>
                          ))}
                        </div>
                      </div>
                      {travel.status !== 'planned' && (
                        <div className="mb-4 space-y-2">
                          <input type="text" value={travel.memory || ''} onChange={(e) => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, memory: e.target.value } : t) }))} placeholder="Dein Highlight (z.B. bestes Gelato!)..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-xs focus:ring-2 focus:ring-teal-500/10 outline-none" />
                          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500/10"><Utensils size={14} className="text-slate-400 shrink-0" /><input type="text" value={travel.food || ''} onChange={(e) => setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, food: e.target.value } : t) }))} placeholder="Kulinarisches Highlight (z.B. Trüffelpasta)..." className="flex-1 bg-transparent border-none font-bold text-xs outline-none" /></div>
                        </div>
                      )}
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {(travel.images || []).map((img, i) => (
                          <div key={i} className="relative flex-shrink-0 group/img">
                            <img src={img} className="w-20 h-20 object-cover rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity" alt="Reise" onClick={() => setSelectedImage(img)} />
                            <button onClick={(e) => { e.stopPropagation(); setProfileData(prev => ({ ...prev, travels: prev.travels.map(t => t.id === travel.id ? { ...t, images: t.images.filter((_, idx) => idx !== i) } : t) })); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"><X size={12} /></button>
                          </div>
                        ))}
                        <label className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center bg-teal-50 border-2 border-dashed border-teal-200 text-teal-500 rounded-2xl cursor-pointer hover:bg-teal-100 transition-colors"><ImagePlus size={20} /><span className="text-[8px] font-black uppercase mt-1">Foto</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleTravelImageUpload(travel.id, e)} /></label>
                      </div>
                    </div>
                  ))}
                  {(!profileData.travels || profileData.travels.length === 0) && (
                    <p className="text-center text-slate-400 font-bold text-xs py-4">Füge deine erste Reise hinzu!</p>
                  )}
                </div>
                <TravelMap travels={profileData.travels || []} />
              </section>
            )}

            {/* Bücher */}
            {modId === 'books' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('books')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-amber-600 mb-6 flex items-center gap-2"><Book size={20} /> Lieblingsbücher</h3>
                <SearchBar type="books" onSelect={(item) => addItem('books', item)} />
                <div className="grid grid-cols-2 gap-4">
                  {profileData.favBooks.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl relative group">
                      <img src={item.image} className="w-full aspect-[2/3] object-cover rounded-xl mb-2" alt={item.title} />
                      <p className="text-[10px] font-black uppercase leading-tight line-clamp-2 h-6">{item.title}</p>
                      <button onClick={() => setProfileData({ ...profileData, favBooks: profileData.favBooks.filter(i => i.id !== item.id) })} className="absolute top-5 right-5 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Filme */}
            {modId === 'movies' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('movies')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-rose-600 mb-6 flex items-center gap-2"><Film size={20} /> Filme & Serien</h3>
                <SearchBar type="movies" onSelect={(item) => addItem('movies', item)} />
                <div className="grid grid-cols-2 gap-4">
                  {profileData.favMovies.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl relative group">
                      <img src={item.image} className="w-full aspect-[2/3] object-cover rounded-xl mb-2" alt={item.title} />
                      <p className="text-[10px] font-black uppercase leading-tight line-clamp-2 h-6">{item.title}</p>
                      <button onClick={() => setProfileData({ ...profileData, favMovies: profileData.favMovies.filter(i => i.id !== item.id) })} className="absolute top-5 right-5 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Musik */}
            {modId === 'songs' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('songs')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className={`text-xl font-black uppercase ${t.text} mb-6 flex items-center gap-2`}><Music size={20} /> Lieblingsmusik</h3>
                <SearchBar type="music" onSelect={(item) => addItem('music', item)} />
                <div className="grid grid-cols-2 gap-4">
                  {profileData.favSongs.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl relative group">
                      <img src={item.image} className="w-full aspect-square object-cover rounded-xl mb-2" alt={item.title} />
                      <p className="text-[10px] font-black uppercase leading-tight line-clamp-1">{item.title}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{item.subtitle}</p>
                      <button onClick={() => setProfileData({ ...profileData, favSongs: profileData.favSongs.filter(i => i.id !== item.id) })} className="absolute top-5 right-5 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bucket List */}
            {modId === 'bucketList' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('bucketList')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-red-500 mb-6 flex items-center gap-2"><MapPin size={20} /> Bucket List</h3>
                <div className="flex gap-2 mb-6">
                  <input type="text" value={newBucketItem} onChange={(e) => setNewBucketItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newBucketItem.trim()) { setProfileData(prev => ({ ...prev, bucketList: [...(prev.bucketList || []), { id: Date.now().toString(), text: newBucketItem.trim(), completed: false }] })); setNewBucketItem(''); } }} placeholder="Neues Ziel (z.B. Fallschirmspringen...)" className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-red-500/10 text-sm outline-none" />
                  <button onClick={() => { if (newBucketItem.trim()) { setProfileData(prev => ({ ...prev, bucketList: [...(prev.bucketList || []), { id: Date.now().toString(), text: newBucketItem.trim(), completed: false }] })); setNewBucketItem(''); } }} className="bg-red-50 text-red-500 px-5 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-colors"><Plus size={24} /></button>
                </div>
                <div className="space-y-3">
                  {profileData.bucketList?.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl group border border-transparent hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => { setProfileData(prev => ({ ...prev, bucketList: prev.bucketList.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i) })) }}>
                        <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                          {item.completed && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <span className={`font-bold text-sm transition-all ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
                      </div>
                      <button onClick={() => setProfileData(prev => ({ ...prev, bucketList: prev.bucketList.filter(i => i.id !== item.id) }))} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  {(!profileData.bucketList || profileData.bucketList.length === 0) && (
                    <p className="text-center text-slate-400 font-bold text-xs py-4">Noch keine Ziele auf deiner Bucket List.</p>
                  )}
                </div>
              </section>
            )}

            {/* Entweder / Oder */}
            {modId === 'thisOrThat' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('thisOrThat')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-purple-500 mb-6 flex items-center gap-2"><ArrowRightLeft size={20} /> Entweder / Oder</h3>
                <div className="space-y-3">
                  {THIS_OR_THAT_QUESTIONS.map(q => (
                    <div key={q.id} className="flex p-1 bg-slate-50 rounded-2xl gap-1">
                      <button onClick={() => setProfileData(prev => ({ ...prev, thisOrThat: { ...prev.thisOrThat, [q.id]: 'left' } }))} className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all ${profileData.thisOrThat?.[q.id] === 'left' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:bg-slate-100/50'}`}>
                        {q.left}
                      </button>
                      <button onClick={() => setProfileData(prev => ({ ...prev, thisOrThat: { ...prev.thisOrThat, [q.id]: 'right' } }))} className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all ${profileData.thisOrThat?.[q.id] === 'right' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:bg-slate-100/50'}`}>
                        {q.right}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Lieblingszitat */}
            {modId === 'quote' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('quote')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-slate-700 mb-6 flex items-center gap-2"><Quote size={20} /> Lebensmotto</h3>
                <div className="bg-slate-50 p-6 rounded-3xl relative">
                  <Quote className="absolute top-4 left-4 text-slate-200" size={40} />
                  <textarea value={profileData.quote?.text || ''} onChange={(e) => setProfileData(prev => ({ ...prev, quote: { ...prev.quote, text: e.target.value } }))} placeholder="Schreibe hier ein Zitat, das dich inspiriert..." className="w-full bg-transparent border-none resize-none font-bold text-lg text-slate-700 placeholder-slate-400 focus:outline-none relative z-10 min-h-[100px]" />
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200/60 relative z-10">
                    <span className="text-slate-400 font-bold">-</span>
                    <input type="text" value={profileData.quote?.author || ''} onChange={(e) => setProfileData(prev => ({ ...prev, quote: { ...prev.quote, author: e.target.value } }))} placeholder="Autor (Optional)" className="flex-1 bg-transparent border-none font-bold text-sm text-slate-600 focus:outline-none" />
                  </div>
                </div>
              </section>
            )}

            {/* Gaming Modul */}
            {modId === 'games' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('games')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-sky-500 mb-6 flex items-center gap-2"><Gamepad2 size={20} /> Lieblingsspiele</h3>
                <SearchBar type="games" onSelect={(item) => addItem('games', item)} />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {profileData.games?.map(game => (
                    <div key={game.id} className="p-3 bg-slate-50 rounded-2xl relative group flex flex-col border border-slate-100">
                      <img src={game.image} className="w-full aspect-video object-cover rounded-xl mb-3 shadow-sm" alt={game.title} />
                      <p className="text-[10px] font-black uppercase leading-tight line-clamp-2 mb-3 text-slate-800">{game.title}</p>
                      <div className="mt-auto relative">
                        <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sky-400" size={14} />
                        <input type="text" value={game.playtime || ''} onChange={(e) => { setProfileData(prev => ({ ...prev, games: prev.games.map(g => g.id === game.id ? { ...g, playtime: e.target.value } : g) })) }} placeholder="z.B. 120h" className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                      </div>
                      <button onClick={() => setProfileData(prev => ({ ...prev, games: prev.games.filter(g => g.id !== game.id) }))} className="absolute top-5 right-5 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {(!profileData.games || profileData.games.length === 0) && (
                    <p className="text-center text-slate-400 font-bold text-xs py-4 col-span-2">Suche nach einem Spiel, um es hinzuzufügen.</p>
                  )}
                </div>
              </section>
            )}

            {/* Red/Green Flags Modul */}
            {modId === 'flags' && (
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative">
                <button onClick={() => removeModule('flags')} className="absolute top-8 right-8 text-red-400 p-2"><Trash2 size={20} /></button>
                <h3 className="text-xl font-black uppercase text-slate-800 mb-6 flex items-center gap-2"><Flag size={20} className="text-red-500" /> Red & Green Flags</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Red Flags */}
                  <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
                    <h4 className="font-black text-red-500 uppercase text-sm mb-4 flex items-center gap-2"><Flag size={16} fill="currentColor" /> Red Flags</h4>
                    <div className="flex gap-2 mb-4 w-full">
                      <input type="text" value={newRedFlag} onChange={(e) => setNewRedFlag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addRedFlag()} placeholder="z.B. Unpünktlichkeit..." className="flex-1 min-w-0 bg-white border-none rounded-xl px-3 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-red-500/20" />
                      <button onClick={addRedFlag} disabled={!newRedFlag.trim()} className="shrink-0 bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"><Plus size={18} /></button>
                    </div>
                    <div className="space-y-2">
                      {profileData.redFlags?.map(flag => (
                        <div key={flag.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm group">
                          <span className="font-bold text-xs text-slate-700">{flag.text}</span>
                          <button onClick={() => removeRedFlag(flag.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Green Flags */}
                  <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
                    <h4 className="font-black text-emerald-500 uppercase text-sm mb-4 flex items-center gap-2"><Flag size={16} fill="currentColor" /> Green Flags</h4>
                    <div className="flex gap-2 mb-4 w-full">
                      <input type="text" value={newGreenFlag} onChange={(e) => setNewGreenFlag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addGreenFlag()} placeholder="z.B. Humor..." className="flex-1 min-w-0 bg-white border-none rounded-xl px-3 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500/20" />
                      <button onClick={addGreenFlag} disabled={!newGreenFlag.trim()} className="shrink-0 bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"><Plus size={18} /></button>
                    </div>
                    <div className="space-y-2">
                      {profileData.greenFlags?.map(flag => (
                        <div key={flag.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm group">
                          <span className="font-bold text-xs text-slate-700">{flag.text}</span>
                          <button onClick={() => removeGreenFlag(flag.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>
        ))}

        <button onClick={() => setShowModulePicker(true)} className={`w-full ${t.bgLight} border-2 border-dashed ${t.dashed} rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-3 ${t.textLight} transition-all active:scale-98`}>
          <div className="bg-white p-5 rounded-full shadow-sm"><Plus size={36} className={t.text} /></div>
          <p className="font-black uppercase tracking-tight">Modul hinzufügen</p>
        </button>

      </main>

      {/* Picker Modals */}
      {showModulePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModulePicker(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl p-8 max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-black uppercase tracking-tighter ${t.text}`}>Module</h2>
              <button onClick={() => setShowModulePicker(false)} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={20} /></button>
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" value={moduleSearch} onChange={(e) => setModuleSearch(e.target.value)} placeholder="Modul suchen..." className={`w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-sm outline-none focus:ring-2 ${t.ring}`} />
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              <div className="grid grid-cols-2 gap-3">
                {filteredModules.map(mod => (
                  <button key={mod.id} disabled={profileData.activeModules.includes(mod.id)} onClick={() => addModule(mod.id)} className={`flex flex-col items-start gap-3 p-5 rounded-3xl border-2 transition-all ${profileData.activeModules.includes(mod.id) ? 'opacity-40 grayscale border-slate-50 bg-slate-50 cursor-not-allowed' : `border-slate-50 hover:${t.border} active:scale-95`}`}>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">{mod.icon}</div>
                    <div className="flex flex-col items-start">
                      <p className="font-black uppercase text-slate-900 text-[10px] leading-tight">{mod.name}</p>
                      {mod.isMinigame && <span className={`mt-1 text-[7px] px-1.5 py-0.5 rounded-md ${t.bg} text-white tracking-normal font-bold`}>MINIGAME</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSocialPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSocialPicker(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95">
            <h2 className={`text-xl font-black mb-6 uppercase tracking-tighter ${t.text}`}>Profil wählen</h2>
            <div className="grid grid-cols-2 gap-3">
              {socialTypes.map(social => (
                <button key={social.id} onClick={() => { if (!(social.id in profileData.socials)) setProfileData({ ...profileData, socials: { ...profileData.socials, [social.id]: '' } }); setShowSocialPicker(false); }} className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${social.id in profileData.socials ? 'opacity-40 pointer-events-none' : `border-slate-50 hover:${t.border} active:scale-95`}`}>
                  <div className={`p-4 rounded-2xl bg-gradient-to-tr ${social.color} text-white`}>{social.icon}</div>
                  <span className="text-[10px] font-black uppercase text-slate-600">{social.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VORSCHAU MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-md print-hide" onClick={() => isOwner && setShowPreview(false)}></div>
          <div id="preview-modal-scroll-container" className="relative w-full max-w-md h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto bg-white sm:rounded-[3.5rem] no-scrollbar shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div id="pdf-content-wrapper" className="text-center bg-white sm:rounded-[3.5rem] overflow-hidden relative pb-10">
              
              <div className={`w-full h-32 ${t.bgLight} relative`}>
                {profileData.coverImage && ( <img src={profileData.coverImage} className="w-full h-full object-cover" alt="Banner" /> )}
              </div>

              <div className={`w-28 h-28 bg-slate-100 rounded-full mx-auto -mt-14 mb-4 flex items-center justify-center border-[6px] border-white overflow-hidden shadow-xl relative z-10`}>
                {profileData.avatar ? ( <img src={profileData.avatar} className="w-full h-full object-cover" alt="Profilbild" /> ) : ( <Smile size={48} className="text-slate-300" /> )}
              </div>

              <div className="px-10">
                <h2 className={`text-3xl font-black uppercase tracking-tighter mb-2 ${t.text}`}>{profileData.name || 'Mein Freundebuch'}</h2>

                {(currentAge !== null || currentZodiac) && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {currentAge !== null && <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-full shadow-sm">{currentAge} Jahre</span>}
                    {currentZodiac && <span className={`text-[10px] font-black uppercase ${t.bgLight} ${t.text} px-3 py-1 rounded-full shadow-sm flex items-center gap-1`}>{currentZodiac.emoji} {currentZodiac.sign}</span>}
                  </div>
                )}

                {(profileData.tags || []).length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                    {profileData.tags.map((tag, idx) => (
                      <span key={idx} className={`text-[9px] font-black uppercase ${t.bg} text-white px-2 py-1 rounded-md shadow-sm`}>#{tag}</span>
                    ))}
                  </div>
                )}

                {profileData.bio && (
                  <div className="bg-slate-50 p-5 rounded-3xl mb-8 border border-slate-100 italic font-bold text-sm text-slate-600">"{profileData.bio}"</div>
                )}

                <PreviewVoiceNote audioData={profileData.voiceNote} />
                {(profileData.voiceNote) && <div className="h-8"></div>}

                {profileData.profileDetails?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {profileData.profileDetails.map((detail, i) => (
                      <div key={i} className={`bg-white rounded-2xl p-3 border-2 ${t.dashed} text-left flex items-center gap-3 shadow-sm`}>
                        <div className="text-2xl">{detail.emoji || ''}</div>
                        <div className="overflow-hidden">
                          <p className={`text-[8px] font-black uppercase ${t.text} mb-0.5 tracking-wider truncate`}>{detail.label || 'Details'}</p>
                          <p className="text-xs font-bold text-slate-700 leading-tight truncate">{detail.value || '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {profileData.funFact && (
                  <div className={`mb-8 p-6 rounded-3xl ${t.bgLight} border ${t.border} relative text-left overflow-hidden shadow-sm`}>
                    <Sparkles className={`absolute -right-4 -top-4 w-20 h-20 ${t.text} opacity-10`} />
                    <p className={`text-[10px] font-black uppercase ${t.text} tracking-widest mb-2 flex items-center gap-1.5`}><Sparkles size={12}/> Fun Fact</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed relative z-10">{profileData.funFact}</p>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {Object.entries(profileData.socials).map(([type, handle]) => {
                    if (!handle) return null;
                    const social = socialTypes.find(s => s.id === type);
                    return <div key={type} className={`flex items-center gap-2 bg-gradient-to-tr ${social?.color || 'from-slate-500 to-slate-700'} text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase shadow-sm`}>{social?.icon || <Globe size={18}/>}<span>@{handle}</span></div>;
                  })}
                </div>

                <div className="space-y-12 text-left">

                  {/* VORSCHAU: KONZERTE & FESTIVALS */}
                  {profileData.activeModules.includes('concerts') && profileData.concerts?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Ticket size={12}/> Live-Erlebnisse</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profileData.concerts.map(concert => (
                          <div key={concert.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#F8FAFC] rounded-full border-r border-slate-200 -translate-y-1/2"></div>
                            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#F8FAFC] rounded-full border-l border-slate-200 -translate-y-1/2"></div>
                            
                            {concert.image && (
                              <div className="h-24 overflow-hidden border-b border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                                <img src={concert.image} className="w-full h-full object-cover" alt="Konzert Foto" />
                              </div>
                            )}
                            <div className={`p-4 flex-1 flex flex-col ${!concert.image ? 'border-t-4 border-fuchsia-500' : ''}`}>
                              <h4 className="font-black text-sm text-slate-800 leading-tight mb-1 truncate">{concert.band || 'Unbekannt'}</h4>
                              <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2 truncate"><MapPin size={10} /> {concert.location || 'Location'}</p>
                              
                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 flex items-center gap-1"><Calendar size={10}/> {concert.date ? new Date(concert.date).toLocaleDateString('de-DE') : '-'}</p>
                                {concert.rating > 0 && (
                                  <div className="flex gap-0.5">
                                    {[...Array(concert.rating)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: WISHLIST */}
                  {profileData.activeModules.includes('wishlist') && profileData.wishlist?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Gift size={12}/> Wunschliste</p>
                      <div className="grid grid-cols-1 gap-4">
                        {profileData.wishlist.map(wish => (
                          <div key={wish.id} className="bg-white p-3 rounded-[2rem] flex items-center gap-4 border border-slate-100 shadow-sm relative overflow-hidden group">
                            {wish.image ? (
                              <img src={wish.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm shrink-0" alt={wish.name} />
                            ) : (
                              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shrink-0"><Gift size={24} /></div>
                            )}
                            <div className="flex-1 overflow-hidden pr-2 z-10">
                              <h4 className="font-black text-slate-800 text-sm truncate mb-1">{wish.name || 'Wunsch'}</h4>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(wish.urgency || 0)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                              </div>
                              {wish.link && (
                                <a href={wish.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors">
                                  <LinkIcon size={10} /> Zum Produkt
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: TOP 5 EMOJIS */}
                  {profileData.activeModules.includes('topEmojis') && profileData.topEmojis?.some(e => e) && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Smile size={12}/> Top 5 Emojis</p>
                      <div className="bg-yellow-50/50 p-6 rounded-[2.5rem] border border-yellow-100 flex justify-center flex-wrap gap-4 sm:gap-6">
                        {profileData.topEmojis.map((emoji, i) => (
                          emoji ? (
                            <div key={i} className="flex flex-col items-center gap-2 animate-in zoom-in-50 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-sm border border-yellow-100 flex items-center justify-center text-3xl sm:text-4xl relative">
                                {emoji}
                                <div className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-400 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-sm">
                                  {i + 1}
                                </div>
                              </div>
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: BRAWL STARS */}
                  {profileData.activeModules.includes('brawlStars') && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Skull size={12} /> Brawl Stars</p>
                      <div className="bg-yellow-50 p-5 rounded-[2rem] border border-yellow-100/50">
                        <div className="grid grid-cols-3 gap-2 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-yellow-100">
                          <div className="text-center">
                            <p className="text-xl mb-1 drop-shadow-sm">🏆</p>
                            <p className="font-black text-sm text-slate-800">{profileData.brawlStars?.trophies || '-'}</p>
                            <p className="text-[7px] font-black uppercase text-yellow-500">Trophäen</p>
                          </div>
                          <div className="text-center border-l border-yellow-100">
                            <p className="text-xl mb-1 drop-shadow-sm">💀</p>
                            <p className="font-black text-sm text-slate-800 truncate px-1">{profileData.brawlStars?.favoriteBrawler || '-'}</p>
                            <p className="text-[7px] font-black uppercase text-yellow-500">Main</p>
                          </div>
                          <div className="text-center border-l border-yellow-100">
                            <p className="text-xl mb-1 drop-shadow-sm">💎</p>
                            <p className="font-black text-sm text-slate-800 truncate px-1">{profileData.brawlStars?.rank || '-'}</p>
                            <p className="text-[7px] font-black uppercase text-yellow-500">Rang</p>
                          </div>
                        </div>
                        {profileData.brawlStars?.friendLink && (
                          <a href={profileData.brawlStars.friendLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-colors text-white rounded-xl font-black uppercase text-xs shadow-md">
                            <LinkIcon size={16} /> Als Freund hinzufügen
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: LIEBLINGSVIDEO */}
                  {profileData.activeModules.includes('favVideo') && getYoutubeId(profileData.favVideo) && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Youtube size={12} /> Lieblingsvideo</p>
                      <div className="aspect-video rounded-[2rem] overflow-hidden shadow-md border border-slate-100 bg-black">
                        <iframe 
                          width="100%" height="100%" 
                          src={`https://www.youtube.com/embed/${getYoutubeId(profileData.favVideo)}`} 
                          title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: LIEBLINGSPODCAST */}
                  {profileData.activeModules.includes('favPodcast') && getSpotifyEmbedUrl(profileData.favPodcast) && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Podcast size={12} /> Lieblingspodcast</p>
                      <div className="rounded-[1rem] overflow-hidden shadow-md border border-slate-100 bg-white">
                        <iframe style={{borderRadius: '12px'}} src={getSpotifyEmbedUrl(profileData.favPodcast)} width="100%" height="152" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: LIEBLINGS CREATOR */}
                  {profileData.activeModules.includes('favCreators') && profileData.favCreators?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Video size={12} /> Lieblings Creator</p>
                      <div className="flex flex-wrap justify-center gap-6">
                        {profileData.favCreators.map(c => (
                          <div key={c.id} className="flex flex-col items-center gap-2">
                            <img src={c.image} className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-white" alt={c.title} />
                            <p className="text-[10px] font-black uppercase text-slate-800 text-center max-w-[80px] leading-tight">{c.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: REACTION TIME */}
                  {profileData.activeModules.includes('reactionTime') && profileData.reactionTime !== null && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <Zap size={12} /> Reaktionszeit
                        <span className={`ml-auto text-[7px] px-1.5 py-0.5 rounded-md ${t.bg} text-white tracking-normal`}>MINIGAME</span>
                      </p>
                      <div className="bg-yellow-50 p-6 rounded-[2.5rem] border border-yellow-100 text-center">
                        <Zap size={40} className="mx-auto text-yellow-500 mb-2" />
                        <p className="text-4xl font-black text-slate-800 mb-1">{profileData.reactionTime} ms</p>
                        <p className="text-[10px] font-black uppercase text-yellow-600 tracking-widest">Highscore</p>
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: MATH DASH */}
                  {profileData.activeModules.includes('mathDash') && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <Calculator size={12} /> Math Dash
                        <span className={`ml-auto text-[7px] px-1.5 py-0.5 rounded-md ${t.bg} text-white tracking-normal`}>MINIGAME</span>
                      </p>
                      <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 text-center">
                        <Calculator size={40} className="mx-auto text-blue-500 mb-2" />
                        <p className="text-4xl font-black text-slate-800 mb-1">{profileData.mathDashScore || 0}</p>
                        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Streak Highscore</p>
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: PIZZA CLICKER */}
                  {profileData.activeModules.includes('cps') && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <MousePointerClick size={12} /> Pizza Clicker
                        <span className={`ml-auto text-[7px] px-1.5 py-0.5 rounded-md ${t.bg} text-white tracking-normal`}>MINIGAME</span>
                      </p>
                      <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100 text-center">
                        <div className="text-4xl mb-2">🍕</div>
                        <p className="text-4xl font-black text-slate-800 mb-1">{profileData.cpsScore || 0}</p>
                        <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Klicks in 10s</p>
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: SLIDE PUZZLE */}
                  {profileData.activeModules.includes('slidePuzzle') && profileData.slidePuzzle?.image && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <Puzzle size={12} /> Slide Puzzle
                        <span className={`ml-auto text-[7px] px-1.5 py-0.5 rounded-md ${t.bg} text-white tracking-normal`}>MINIGAME</span>
                      </p>
                      <SlidePuzzleGame image={profileData.slidePuzzle.image} />
                    </div>
                  )}

                  {/* VORSCHAU: WORDLE */}
                  {profileData.activeModules.includes('wordle') && profileData.wordle?.targetWord?.length >= 4 && profileData.wordle?.targetWord?.length <= 7 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <Grid3x3 size={12} /> Wordle
                        <span className={`ml-auto text-[7px] px-1.5 py-0.5 rounded-md ${t.bg} text-white tracking-normal`}>MINIGAME</span>
                      </p>
                      <WordleGame targetWord={profileData.wordle.targetWord} />
                    </div>
                  )}

                  {/* VORSCHAU: CIRCLE GAME */}
                  {profileData.activeModules.includes('circleGame') && profileData.circleGame?.score > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <Circle size={12} /> Kreis Zeichnen
                        <span className={`ml-auto text-[7px] px-1.5 py-0.5 rounded-md ${t.bg} text-white tracking-normal`}>MINIGAME</span>
                      </p>
                      <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 text-center flex flex-col items-center">
                        {profileData.circleGame.image && (
                          <div className="w-32 h-32 bg-white rounded-2xl border-2 border-indigo-100 mb-4 overflow-hidden shadow-sm">
                            <img src={profileData.circleGame.image} alt="Kreis" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <p className="text-4xl font-black text-slate-800 mb-1">{profileData.circleGame.score}%</p>
                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Genauigkeit</p>
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: SECRET MESSAGE */}
                  {profileData.activeModules.includes('secretMessage') && profileData.secretMessage?.message && (
                    <PreviewSecretMessage data={profileData.secretMessage} themeConfig={t} />
                  )}

                  {/* VORSCHAU: SETUP */}
                  {profileData.activeModules.includes('setup') && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Monitor size={12} /> Mein Setup</p>
                      {profileData.setup?.images?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 snap-x">
                          {profileData.setup.images.map((img, i) => (
                            <img key={i} src={img} onClick={() => setSelectedImage(img)} className="w-40 h-28 object-cover rounded-2xl snap-center shrink-0 border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity" alt="Setup" />
                          ))}
                        </div>
                      )}
                      {profileData.setup?.components?.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                          {profileData.setup.components.map(comp => (
                            <div key={comp.id} className="flex justify-between items-center border-b border-slate-200/50 last:border-0 pb-2 last:pb-0">
                              <span className="text-[10px] font-black uppercase text-slate-400">{comp.label}</span>
                              <span className="text-xs font-bold text-slate-700 text-right">{comp.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* VORSCHAU: HAY DAY */}
                  {profileData.activeModules.includes('hayday') && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Tractor size={12} /> Hay Day</p>
                      <div className="bg-yellow-50 p-5 rounded-[2rem] border border-yellow-100/50">
                        <div className="flex justify-around items-center mb-5 bg-white p-4 rounded-2xl shadow-sm border border-yellow-100">
                          <div className="text-center">
                            <p className="text-2xl mb-1 drop-shadow-sm">⭐</p>
                            <p className="font-black text-lg text-slate-800">{profileData.hayday?.level || '-'}</p>
                            <p className="text-[8px] font-black uppercase text-yellow-600">Level</p>
                          </div>
                          <div className="w-px h-12 bg-yellow-100"></div>
                          <div className="text-center">
                            <p className="text-2xl mb-1 drop-shadow-sm">🤝</p>
                            <p className="font-black text-sm text-slate-800 tracking-wider break-all px-2">{profileData.hayday?.friendCode || '-'}</p>
                            <p className="text-[8px] font-black uppercase text-yellow-600 mt-1">Freundescode</p>
                          </div>
                        </div>

                        {profileData.hayday?.farmImage && (
                          <div className="flex flex-col">
                            <p className="text-[9px] font-black uppercase text-yellow-600 mb-1 text-center">Meine Farm</p>
                            <img src={profileData.hayday.farmImage} className="w-full aspect-video object-cover rounded-xl shadow-sm border border-yellow-200" alt="Farm" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: CLASH OF CLANS */}
                  {profileData.activeModules.includes('coc') && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Swords size={12} /> Clash of Clans</p>
                      <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-100/50">
                        
                        <div className="grid grid-cols-4 gap-2 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-amber-100">
                          <div className="text-center">
                            <p className="text-xl mb-1 drop-shadow-sm">🏆</p>
                            <p className="font-black text-sm text-slate-800">{profileData.coc?.trophies || '-'}</p>
                            <p className="text-[7px] font-black uppercase text-amber-500">Trophäen</p>
                          </div>
                          <div className="text-center border-l border-amber-100">
                            <p className="text-xl mb-1 drop-shadow-sm">🏛️</p>
                            <p className="font-black text-sm text-slate-800">Lvl {profileData.coc?.townHall || '-'}</p>
                            <p className="text-[7px] font-black uppercase text-amber-500">Rathaus</p>
                          </div>
                          <div className="text-center border-l border-amber-100">
                            <p className="text-xl mb-1 drop-shadow-sm">🏆</p>
                            <p className="font-black text-sm text-slate-800">{profileData.coc?.builderTrophies || '-'}</p>
                            <p className="text-[7px] font-black uppercase text-amber-500">BB Trophäen</p>
                          </div>
                          <div className="text-center border-l border-amber-100">
                            <p className="text-xl mb-1 drop-shadow-sm">🔨</p>
                            <p className="font-black text-sm text-slate-800">Lvl {profileData.coc?.builderHall || '-'}</p>
                            <p className="text-[7px] font-black uppercase text-amber-500">Meisterhütte</p>
                          </div>
                        </div>

                        {(profileData.coc?.villageImage || profileData.coc?.builderBaseImage) && (
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            {profileData.coc?.villageImage && (
                              <div className="flex flex-col">
                                <p className="text-[9px] font-black uppercase text-amber-600 mb-1 text-center">Normales Dorf</p>
                                <img src={profileData.coc.villageImage} className="w-full aspect-video object-cover rounded-xl shadow-sm border border-amber-200" alt="Village" />
                              </div>
                            )}
                            {profileData.coc?.builderBaseImage && (
                              <div className="flex flex-col">
                                <p className="text-[9px] font-black uppercase text-amber-600 mb-1 text-center">Bauarbeiterbasis</p>
                                <img src={profileData.coc.builderBaseImage} className="w-full aspect-video object-cover rounded-xl shadow-sm border border-amber-200" alt="Builder Base" />
                              </div>
                            )}
                          </div>
                        )}

                        {profileData.coc?.friendLink && (
                          <a href={profileData.coc.friendLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-colors text-white rounded-xl font-black uppercase text-xs shadow-md">
                            <LinkIcon size={16} /> Als Freund hinzufügen
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* VORSCHAU: BEZIEHUNG */}
                  {profileData.activeModules.includes('relationships') && profileData.relationships?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Heart size={12} className="fill-current" /> Beziehung</p>
                      <div className="space-y-4">
                        {profileData.relationships.map(rel => {
                          const days = rel.startDate ? calculateCurrentStreak(rel.startDate) : null;
                          return (
                            <div key={rel.id} className="bg-rose-50 p-4 rounded-[2rem] flex items-center gap-4 border border-rose-100 shadow-sm relative overflow-hidden">
                              {rel.image ? (
                                <img src={rel.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm shrink-0 z-10" alt={rel.name} />
                              ) : (
                                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-rose-200 shrink-0 z-10"><Heart size={32} className="fill-rose-100" /></div>
                              )}
                              <div className="flex-1 z-10 pr-2">
                                <h4 className="font-black text-slate-800 text-lg leading-tight mb-2 truncate">{rel.name || 'Partner'}</h4>
                                {days !== null && (
                                  <span className={`text-[10px] font-black uppercase bg-white text-rose-500 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap`}>{days} Tage 💖</span>
                                )}
                              </div>
                              <Heart className="absolute -right-4 -bottom-4 w-32 h-32 text-rose-500/10 fill-rose-500/10 z-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: QUIZ */}
                  {profileData.activeModules.includes('quiz') && profileData.quiz?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <HelpCircle size={12}/> Q&A Quiz
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {profileData.quiz.map(q => (
                          <PreviewQuizCard key={q.id} item={q} themeConfig={t} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: WERDEGANG */}
                  {profileData.activeModules.includes('career') && profileData.career?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <Briefcase size={12}/> Werdegang
                      </p>
                      <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-6 mt-4">
                        {profileData.career.map((item) => (
                          <div key={item.id} className="relative">
                            <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${t.bg} shadow-sm`}></div>
                            <h4 className="font-black text-slate-800 text-sm leading-tight">{item.role}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 mb-2">{item.company} {item.start} - {item.end}</p>
                            {item.description && <p className="text-xs font-bold text-slate-600 mt-2 leading-relaxed">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU: SCREEN-TIME */}
                  {profileData.activeModules.includes('screenTime') && profileData.screenTime?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}>
                        <Smartphone size={12}/> Screen-Time
                      </p>
                      <div className="flex justify-center mt-6 mb-2">
                        <div className="relative w-[220px] bg-slate-800 rounded-[2.5rem] p-1.5 border-[3px] border-slate-200 shadow-2xl">
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-800/50 absolute right-2"></div>
                          </div>
                          <div className="bg-slate-50 w-full h-full rounded-[2.1rem] overflow-hidden relative pt-12 pb-6 px-4">
                            <div className={`absolute top-0 left-0 right-0 h-32 opacity-20 ${t.bg} blur-[40px] rounded-full -translate-y-1/2`}></div>
                            <p className="text-center font-black text-slate-800 text-sm mb-5 relative z-10">Meistgenutzt</p>
                            <div className="space-y-3 relative z-10">
                              {profileData.screenTime.map((app, idx) => {
                                const APP_GRADIENTS = ['from-blue-400 to-indigo-600', 'from-emerald-400 to-emerald-600', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500', 'from-purple-400 to-violet-600'];
                                return (
                                  <div key={app.id} className="flex items-center gap-3 bg-white/90 backdrop-blur p-3 rounded-[1.25rem] shadow-sm border border-slate-100/50">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner bg-gradient-to-br ${APP_GRADIENTS[idx % APP_GRADIENTS.length]} text-white shrink-0`}>
                                      <span className="drop-shadow-sm">{app.emoji}</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <p className="font-bold text-xs text-slate-800 leading-tight truncate">{app.name}</p>
                                      {app.time && <p className="text-[10px] font-black text-slate-400 mt-0.5">{app.time}</p>}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-slate-300 rounded-full z-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU MOODBOARD */}
                  {profileData.activeModules.includes('moodboard') && profileData.moodboard?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Images size={12}/> Moodboard</p>
                      <div className="columns-2 gap-2 space-y-2">
                        {profileData.moodboard.map((img, i) => (
                          <img key={i} src={img} className="w-full rounded-xl object-cover shadow-sm break-inside-avoid border border-slate-100" alt="Mood" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VORSCHAU ZWEI WAHRHEITEN, EINE LÜGE */}
                  {profileData.activeModules.includes('twoTruths') && profileData.twoTruths?.some(t => t.text.trim() !== '') && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Lightbulb size={12}/> 2 Wahrheiten, 1 Lüge</p>
                      <div className="bg-yellow-50 p-6 rounded-[2.5rem] relative shadow-inner">
                        <div className="space-y-3 relative z-10">
                          {profileData.twoTruths.map((item, idx) => {
                            if (!item.text.trim()) return null;
                            return (
                              <div key={item.id} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-yellow-100">
                                <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                                <span className="font-bold text-sm text-slate-700">{item.text}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-8 mb-2 flex justify-center">
                           <p className="text-[9px] font-black uppercase text-slate-400 rotate-180 inline-block tracking-widest text-center opacity-60">
                             Auflösung: Aussage Nr. {profileData.twoTruths.findIndex(t => t.isLie) + 1} ist die Lüge!
                           </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('friendsQuotes') && profileData.friendsQuotes?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><StickyNote size={12}/> Zitate-Wand</p>
                      <div className="grid grid-cols-2 gap-4 p-2">
                        {profileData.friendsQuotes.map((quote, idx) => {
                          const bgColors = POST_IT_COLORS;
                          const rotations = POST_IT_ROTATIONS;
                          const color = bgColors[idx % bgColors.length];
                          const rotation = rotations[idx % rotations.length];
                          return (
                            <div key={quote.id} className={`${color} ${rotation} p-4 aspect-square shadow-md flex flex-col justify-between relative`}>
                              <Quote className="absolute top-2 left-2 text-black/10" size={24} />
                              <p className="font-bold text-sm text-slate-800 italic relative z-10 leading-snug line-clamp-4">"{quote.text}"</p>
                              <p className="font-black text-[10px] text-slate-600 uppercase mt-2 border-t border-black/10 pt-2 line-clamp-1">- {quote.author}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('everydayCarry') && profileData.everydayCarry?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Backpack size={12}/> Everyday Carry</p>
                      <div className="relative pt-6 px-4">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-10 border-4 border-slate-200 rounded-t-3xl -z-10"></div>
                        <div className={`bg-slate-100 rounded-t-[3rem] rounded-b-[2rem] p-6 pt-8 shadow-inner border border-slate-200 relative overflow-hidden`}>
                          <div className="absolute top-12 left-6 right-6 h-px border-b-[3px] border-dashed border-slate-300 opacity-60"></div>
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white p-1.5 rounded-full shadow-sm"><Backpack size={16} className="text-slate-400" /></div>
                          <div className="flex flex-wrap justify-center gap-2 mt-6 relative z-10">
                            {profileData.everydayCarry.map((item, idx) => {
                              const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-0'];
                              const randomRotation = rotations[idx % rotations.length];
                              return (
                                <div key={item.id} className={`bg-white px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 border border-slate-100 ${randomRotation}`}>
                                  <span className="text-lg drop-shadow-sm">{item.emoji}</span>
                                  <span className="text-xs font-black text-slate-700 tracking-tight">{item.name}</span>
                                </div>
                              )
                            })}
                          </div>
                          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-3/4 h-12 border-t-2 border-white/60 bg-slate-200/50 rounded-t-[2rem]"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('pets') && profileData.pets?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><PawPrint size={12}/> Haustiere</p>
                      <div className="grid grid-cols-1 gap-4">
                        {profileData.pets.map(pet => {
                          const petAge = getAge(pet.birthdate);
                          return (
                            <div key={pet.id} className="bg-slate-50 p-3 rounded-[2rem] flex items-center gap-4 border border-slate-100 shadow-sm">
                              {pet.image ? (
                                <img src={pet.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm shrink-0" alt={pet.name} />
                              ) : (
                                <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0"><PawPrint size={24} /></div>
                              )}
                              <div className="flex-1 overflow-hidden pr-2">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-black text-slate-800 text-sm truncate">{pet.name || 'Namenlos'}</h4>
                                  {petAge !== null && <span className={`text-[9px] font-black uppercase bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap ml-2 shrink-0`}>{petAge} J.</span>}
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 truncate">{pet.type || 'Tierart'} {pet.breed ? ` • ${pet.breed}` : ''}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('timeCapsule') && (Object.values(profileData.timeCapsule || {}).some(v => v.trim()) || profileData.customTimeCapsule?.some(cq => cq.question?.trim() && cq.answer?.trim())) && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Hourglass size={12}/> Zeitkapsel</p>
                      <div className="space-y-4">
                        {TIME_CAPSULE_QUESTIONS.map(q => {
                          const answer = profileData.timeCapsule?.[q.id];
                          if (!answer || !answer.trim()) return null;
                          return (
                            <div key={q.id} className="bg-slate-50 p-5 rounded-3xl relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${t.bg} opacity-50`}></div>
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{q.label}</p>
                              <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
                            </div>
                          )
                        })}
                        {profileData.customTimeCapsule?.map(cq => {
                          if (!cq.question.trim() || !cq.answer.trim()) return null;
                          return (
                            <div key={cq.id} className="bg-slate-50 p-5 rounded-3xl relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${t.bg} opacity-50`}></div>
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{cq.question}</p>
                              <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{cq.answer}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('skills') && profileData.skills?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><BarChart2 size={12}/> Skill-Tree</p>
                      <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem]">
                        {profileData.skills.map(skill => (
                          <div key={skill.id}>
                            <div className="flex justify-between mb-1.5">
                              <span className="font-bold text-sm text-slate-700">{skill.name}</span>
                              <span className={`font-black text-xs ${t.text}`}>{skill.value}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full ${t.bg} rounded-full transition-all duration-500`} style={{ width: `${skill.value}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('tierList') && profileData.tierLists?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Trophy size={12}/> Tier List Rankings</p>
                      <div className="space-y-8">
                        {profileData.tierLists.map(list => {
                          if (!list.items || list.items.length === 0) return null;
                          return (
                            <div key={list.id}>
                              {list.topic && <h4 className="text-center font-black text-lg text-slate-800 mb-3">{list.topic}</h4>}
                              <div className="space-y-1 bg-slate-800 p-2 rounded-3xl shadow-md">
                                {TIER_LEVELS.map(tier => {
                                  const tierItems = list.items.filter(i => i.tier === tier.value);
                                  return (
                                    <div key={tier.value} className="flex bg-slate-900 rounded-[1rem] overflow-hidden min-h-[3rem]">
                                      <div className={`w-12 sm:w-16 flex-shrink-0 flex items-center justify-center font-black text-xl text-slate-900 ${tier.color}`}>{tier.value}</div>
                                      <div className="flex-1 p-2 flex flex-wrap gap-2 items-center border-b border-slate-800/50 last:border-0">
                                        {tierItems.map(item => (
                                          <div key={item.id} className="bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm">{item.text}</div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('quote') && profileData.quote?.text && (
                    <div className="relative text-center px-4">
                      <Quote className={`absolute top-0 left-0 -translate-x-2 -translate-y-4 -z-10 ${t.textLight} opacity-30`} size={60} />
                      <p className="font-serif italic text-xl font-bold text-slate-800 leading-relaxed">"{profileData.quote.text}"</p>
                      {profileData.quote.author && <p className={`text-[10px] font-black uppercase ${t.text} mt-4 tracking-widest`}>- {profileData.quote.author}</p>}
                    </div>
                  )}

                  {profileData.activeModules.includes('duolingo') && (
                    <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Languages size={60} /></div>
                      <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] mb-4">Duolingo Streak</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-black text-emerald-700">{profileData.duolingo.language || 'Sprache wählen'}</p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase">Aktiv am Lernen</p>
                        </div>
                        <div className="text-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-emerald-50">
                          <p className="text-3xl font-black text-emerald-500 tracking-tighter">{currentDynamicStreak}</p>
                          <p className="text-[8px] font-black uppercase text-emerald-400">Tage am Stück</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('travels') && profileData.travels?.length > 0 && (
                    <div>
                      <TravelMap travels={profileData.travels} />
                      <div className="space-y-4 mt-6">
                        {profileData.travels.map(travel => (
                          <div key={travel.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl bg-slate-50 p-2 rounded-2xl shadow-inner">{travel.flag}</span>
                                <div>
                                  <h4 className="font-black text-lg text-slate-800 leading-tight flex items-center gap-2">
                                    {travel.name || travel.city}
                                    {travel.favorite && <Heart size={14} className="text-rose-500 fill-rose-500" />}
                                    {travel.status === 'planned' && <span className="text-[9px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md uppercase font-black tracking-wider">Traumziel</span>}
                                    {travel.status !== 'planned' && travel.year && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{travel.year}</span>}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {travel.status !== 'planned' && travel.rating && (
                                      <div className="flex gap-0.5">
                                        {[...Array(travel.rating)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                                      </div>
                                    )}
                                    {travel.type && TRIP_TYPES.find(t => t.id === travel.type) && (
                                      <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">• {TRIP_TYPES.find(t => t.id === travel.type).icon} {TRIP_TYPES.find(t => t.id === travel.type).label}</span>
                                    )}
                                    {travel.transport && TRANSPORT_TYPES.find(t => t.id === travel.transport) && (
                                      <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">• {TRANSPORT_TYPES.find(t => t.id === travel.transport).icon}</span>
                                    )}
                                  </div>
                                  {travel.companions && <p className="text-[9px] font-bold text-teal-600 mt-1 flex items-center gap-1"><Users size={10} /> Mit: {travel.companions}</p>}
                                  {travel.song && (
                                    typeof travel.song === 'string' ? (
                                      <p className="text-[9px] font-bold text-indigo-500 mt-1 flex items-center gap-1 line-clamp-1"><Music size={10} /> Soundtrack: {travel.song}</p>
                                    ) : (
                                      <div className="mt-2 w-full max-w-[200px]">
                                        <p className="text-[9px] font-bold text-indigo-500 mb-1 flex items-center gap-1"><Music size={10} /> Soundtrack</p>
                                        <PreviewMusicCard song={travel.song} />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                            {travel.memory && travel.status !== 'planned' && (
                              <p className="text-xs font-bold text-slate-600 bg-teal-50/50 p-3 rounded-xl border border-teal-100/50 mb-3 italic">"{travel.memory}"</p>
                            )}
                            {travel.food && travel.status !== 'planned' && (
                              <p className="text-xs font-bold text-slate-600 bg-orange-50/50 p-3 rounded-xl border border-orange-100/50 mb-3 flex items-start gap-2">
                                <Utensils size={14} className="text-orange-400 mt-0.5 shrink-0" /><span>{travel.food}</span>
                              </p>
                            )}
                            {(travel.images || []).length > 0 && (
                              <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 snap-x">
                                {travel.images.map((img, i) => (
                                  <img key={i} src={img} onClick={() => setSelectedImage(img)} className="w-24 h-24 object-cover rounded-2xl snap-center shrink-0 border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity" alt="Reisefoto" />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('thisOrThat') && Object.keys(profileData.thisOrThat || {}).length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><ArrowRightLeft size={12}/> Entweder / Oder</p>
                      <div className="space-y-2">
                        {THIS_OR_THAT_QUESTIONS.map(q => {
                          const answer = profileData.thisOrThat[q.id];
                          if (!answer) return null;
                          return (
                            <div key={q.id} className="flex bg-slate-50 rounded-2xl overflow-hidden p-1 text-xs font-bold text-center">
                              <div className={`flex-1 py-2 rounded-xl transition-colors ${answer === 'left' ? `${t.bg} text-white shadow-sm` : 'text-slate-400 opacity-50'}`}>{q.left}</div>
                              <div className={`flex-1 py-2 rounded-xl transition-colors ${answer === 'right' ? `${t.bg} text-white shadow-sm` : 'text-slate-400 opacity-50'}`}>{q.right}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('bucketList') && profileData.bucketList?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-red-100 pb-2"><MapPin size={12}/> Bucket List</p>
                      <div className="space-y-3 bg-red-50 p-6 rounded-[2.5rem]">
                        {profileData.bucketList.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            {item.completed ? <CheckCircle2 className="text-green-500 flex-shrink-0" size={20}/> : <div className="w-5 h-5 rounded-full border-2 border-red-200 flex-shrink-0" />}
                            <span className={`font-bold text-sm ${item.completed ? 'line-through text-red-300' : 'text-red-900'}`}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('games') && profileData.games?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-sky-500 tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-sky-100 pb-2"><Gamepad2 size={12}/> Gaming</p>
                      <div className="grid grid-cols-2 gap-4">
                        {profileData.games.map(game => (
                          <div key={game.id} className="bg-slate-50 rounded-2xl p-2 relative border border-slate-100">
                            <img src={game.image} className="w-full aspect-video object-cover rounded-xl shadow-sm mb-2 bg-slate-200" alt={game.title} />
                            <div className="px-1 pb-1">
                              <p className="text-[10px] font-black uppercase leading-tight line-clamp-1 text-slate-800">{game.title}</p>
                              {game.playtime && <p className="text-[9px] font-bold text-sky-600 mt-1 flex items-center gap-1"><Clock size={10} /> {game.playtime}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('books') && profileData.favBooks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-amber-100 pb-2"><Book size={12} /> Bücher</p>
                      <div className="grid grid-cols-2 gap-4">
                        {profileData.favBooks.map(b => (
                          <div key={b.id}>
                            <img src={b.image} className="aspect-[2/3] rounded-2xl overflow-hidden shadow-md mb-2 bg-slate-100 w-full object-cover" alt={b.title} />
                            <p className="text-[10px] font-black uppercase leading-tight line-clamp-2">{b.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('movies') && profileData.favMovies.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-rose-100 pb-2"><Film size={12} /> Filme & Serien</p>
                      <div className="grid grid-cols-2 gap-4">
                        {profileData.favMovies.map(m => (
                          <div key={m.id}>
                            <img src={m.image} className="aspect-[2/3] rounded-2xl overflow-hidden shadow-md mb-2 bg-slate-100 w-full object-cover" alt={m.title} />
                            <p className="text-[10px] font-black uppercase leading-tight line-clamp-2">{m.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('songs') && profileData.favSongs.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Music size={12} /> Top Songs</p>
                      <div className="flex flex-col gap-3">
                        {profileData.favSongs.map(s => (
                          <PreviewMusicCard key={s.id} song={s} />
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.activeModules.includes('flags') && (profileData.redFlags?.length > 0 || profileData.greenFlags?.length > 0) && (
                    <div>
                      <p className={`text-[10px] font-black uppercase ${t.text} tracking-[0.2em] mb-4 flex items-center gap-2 border-b ${t.dashed} pb-2`}><Flag size={12}/> Red & Green Flags</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                          <h5 className="font-black text-red-500 uppercase text-[10px] mb-3 flex items-center gap-1"><Flag size={10} fill="currentColor" /> Red Flags</h5>
                          <ul className="space-y-2">
                            {profileData.redFlags?.map(flag => (
                              <li key={flag.id} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">✕</span> {flag.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                          <h5 className="font-black text-emerald-500 uppercase text-[10px] mb-3 flex items-center gap-1"><Flag size={10} fill="currentColor" /> Green Flags</h5>
                          <ul className="space-y-2">
                            {profileData.greenFlags?.map(flag => (
                              <li key={flag.id} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">✓</span> {flag.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Unterschrift am Ende der Vorschau */}
                  {profileData.signature && (
                    <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col items-center justify-center">
                      <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-2">xoxo</p>
                      <img src={profileData.signature} className="h-16 object-contain opacity-80 mix-blend-multiply" alt="Unterschrift" />
                    </div>
                  )}

                </div>
              </div>
            </div> {/* END pdf-content-wrapper */}

            <div className="px-10 pb-10">
              {isOwner ? (
                <button onClick={() => setShowPreview(false)} className="mt-4 w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs active:scale-95 transition-all shadow-xl print-hide">Schließen</button>
              ) : (
                <button onClick={() => { window.location.href = window.location.pathname; }} className={`mt-4 w-full py-5 ${t.bg} text-white rounded-3xl font-black uppercase text-xs active:scale-95 transition-all shadow-xl print-hide`}>Erstelle dein eigenes Freundebuch</button>
              )}
            </div>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8FAFC] to-transparent z-40 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button onClick={handleSave} className={`w-full ${t.bg} text-white font-black py-5 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-3 text-lg uppercase tracking-tight active:scale-95 transition-all`}>
              <Save size={24} /> Profil speichern
            </button>
          </div>
        </div>
      )}

      {/* Lightbox für Bilder */}
      {selectedImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors" onClick={() => setSelectedImage(null)}><X size={24} /></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95" alt="Vergrößert" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

    </div>
  );
};

export default App;