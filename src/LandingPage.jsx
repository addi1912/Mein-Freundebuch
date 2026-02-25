import React from 'react';
import { Smile, ArrowRight, Database, Shield, Palette } from 'lucide-react';

const LandingPage = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans selection:bg-indigo-100">
      <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in-up duration-1000">
        <div className="space-y-4">
          <div className="bg-indigo-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-2xl animate-bounce">
            <Smile size={44} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase">
            Das digitale <br />
            <span className="text-indigo-600">Freundebuch</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-bold max-w-xl mx-auto leading-relaxed">
            Erstelle dein persönliches Profil, halte deine Lieblingsmomente fest und teile dein Freundebuch mit der Welt.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onEnter}
            className="group flex items-center justify-center gap-3 bg-indigo-600 px-10 py-5 rounded-[2.5rem] font-black text-white uppercase tracking-tight shadow-xl hover:shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
          >
            <span>Jetzt Freundebuch Eintrag erstellen
            </span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm text-left">
            <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4"><Database size={24}/></div>
            <h3 className="font-black uppercase text-slate-800 mb-2">Cloud Sync</h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">Greife von überall auf dein Profil zu. Deine Daten sind sicher gespeichert.</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm text-left">
            <div className="bg-rose-50 text-rose-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4"><Shield size={24}/></div>
            <h3 className="font-black uppercase text-slate-800 mb-2">Sicher Teilen</h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">Verschicke deinen persönlichen Link an Freunde, damit sie dein Profil sehen können.</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm text-left">
            <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4"><Palette size={24}/></div>
            <h3 className="font-black uppercase text-slate-800 mb-2">Individuell</h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">Wähle eigene Farben und füge Module wie Gaming, Reisen oder Tier-Listen hinzu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;