import React, { useState } from 'react';
import { Scout } from '../types';
import { getScoutReport } from '../services/gemini';

interface Props {
  scout: Scout | null;
  market: Scout[];
  budget: number;
  teamName: string;
  division: number;
  onHire: (id: string) => void;
  onFire: () => void;
  onUpdateScout?: (scout: Scout) => void;
  onStartNegotiation?: (playerData: any) => void;
}

const ScoutView: React.FC<Props> = ({ scout, market, budget, teamName, division, onHire, onFire, onUpdateScout, onStartNegotiation }) => {
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!scout || !onUpdateScout) return;
    setLoading(true);

    try {
      const data = await getScoutReport(teamName, division, scout.level);
      const updatedScout: Scout = {
        ...scout,
        assignment: {
          text: data.text,
          players: data.players
        }
      };
      onUpdateScout(updatedScout);
    } catch (err) {
      console.error("Fallo al obtener reporte:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (level: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < level ? 'text-amber-400' : 'text-zinc-800'}>★</span>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12 animate-in fade-in duration-500">
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Director Deportivo Activo</h3>
        {scout ? (
          <div className="bg-zinc-900 border border-emerald-500/20 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10">
            <div className="md:w-1/3 space-y-6">
               <div className="relative w-40 h-40 mx-auto">
                  <div className="w-full h-full bg-zinc-950 rounded-[2rem] border-2 border-zinc-800 flex items-center justify-center text-7xl shadow-inner">
                     {scout.avatar}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 px-4 py-1 rounded-full border border-zinc-700 text-sm">
                     {renderStars(scout.level)}
                  </div>
               </div>
               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-impact uppercase tracking-tight">{scout.name}</h2>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{scout.specialty}</p>
               </div>
               <div className="flex flex-col gap-2">
                  <button onClick={fetchReport} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50">
                     {loading ? 'BUSCANDO JUGADORES...' : 'INVESTIGAR MERCADO'}
                  </button>
                  <button onClick={onFire} className="w-full bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-zinc-500 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-zinc-700">DESPEDIR</button>
               </div>
            </div>

            <div className="flex-1 bg-zinc-950 rounded-[2rem] p-8 border border-zinc-800 min-h-[400px]">
               {loading ? (
                 <div className="h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">Consultando base de datos mundial...</p>
                 </div>
               ) : scout.assignment ? (
                 <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                       <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3">Análisis Táctico</p>
                       <p className="text-sm italic text-zinc-300 leading-relaxed font-medium">"{scout.assignment.text}"</p>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Recomendaciones de Fichaje</p>
                       {scout.assignment.players.map((p, i) => (
                         <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all group">
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-lg font-bold text-zinc-100">{p.name}</h4>
                                  <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase font-black">{p.pos}</span>
                               </div>
                               <p className="text-[10px] text-zinc-500 mb-2 uppercase font-bold">{p.age} Años • Valor Est. {(p.estimatedValue || 0).toLocaleString()}€</p>
                               <p className="text-[11px] text-zinc-400 italic">"{p.reason}"</p>
                            </div>
                            <button 
                              onClick={() => onStartNegotiation?.(p)}
                              className="bg-zinc-100 hover:bg-emerald-500 hover:text-white text-zinc-950 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md"
                            >
                               NEGOCIAR
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <p className="text-6xl mb-4">🔎</p>
                    <p className="text-sm font-black uppercase tracking-[0.3em] max-w-xs">Ordena una investigación para ver candidatos reales.</p>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[2.5rem] py-24 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-6 opacity-20">👤</div>
             <p className="text-zinc-500 text-sm uppercase font-black tracking-widest max-w-sm">No tienes un Director Deportivo. Contrata a uno de la agencia.</p>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Agencia de Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {market.map(s => (
            <div key={s.id} className="bg-zinc-900 rounded-[2rem] border border-zinc-800 p-8 hover:border-zinc-700 transition-all flex flex-col shadow-lg">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-3xl border border-zinc-800">
                     {s.avatar}
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Nivel</p>
                     <div className="text-[10px]">{renderStars(s.level)}</div>
                  </div>
               </div>
               <h4 className="text-xl font-bold mb-1">{s.name}</h4>
               <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-6">{s.specialty}</p>
               <div className="space-y-2 mb-8 mt-auto">
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-zinc-500 uppercase font-bold">Fichaje</span>
                     <span className="text-zinc-100 font-mono font-bold">{(s.hireCost || 0).toLocaleString()}€</span>
                  </div>
               </div>
               <button onClick={() => onHire(s.id)} disabled={budget < s.hireCost || scout?.id === s.id} className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${budget >= s.hireCost && scout?.id !== s.id ? 'bg-zinc-100 hover:bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
                  {scout?.id === s.id ? 'CONTRATADO' : 'CONTRATAR'}
               </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ScoutView;