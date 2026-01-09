
import React from 'react';
import { Match, MatchEvent, EventType } from '../types';
import ClubCrest from './ClubCrest';

interface Props {
  match: Match;
  onClose: () => void;
}

const MatchDetailsModal: React.FC<Props> = ({ match, onClose }) => {
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'yellow': return '🟨';
      case 'red': return '🟥';
      case 'injury': return '🏥';
      case 'save': return '🧤';
      case 'chance': return '🎯';
      default: return '📢';
    }
  };

  const getEventStyles = (type: EventType) => {
    switch (type) {
      case 'goal': return 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400';
      case 'yellow': return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500';
      case 'red': return 'bg-red-500/10 border-red-500/50 text-red-500 font-bold';
      case 'injury': return 'bg-orange-500/10 border-orange-500/50 text-orange-400';
      default: return 'bg-zinc-900 border-zinc-800 text-zinc-500';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 animate-in fade-in duration-300" onClick={onClose}>
      <div className="max-w-3xl w-full bg-zinc-950 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
        
        {/* Cabecera del Marcador Histórico */}
        <div className="bg-zinc-900/50 p-10 border-b border-zinc-800 flex items-center justify-between relative">
           <div className="flex-1 text-center">
              <ClubCrest crest={match.loc.crest} size="md" className="mx-auto mb-3" />
              <p className="font-impact text-lg uppercase tracking-tight text-white">{match.loc.name}</p>
           </div>
           <div className="flex flex-col items-center px-10">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Jornada {match.week}</p>
              <div className="text-6xl font-impact tracking-tighter text-white">
                {match.score[0]} <span className="text-zinc-700 text-4xl mx-2">-</span> {match.score[1]}
              </div>
              <p className="text-[10px] text-emerald-500 font-bold uppercase mt-4">FINALIZADO</p>
           </div>
           <div className="flex-1 text-center">
              <ClubCrest crest={match.vis.crest} size="md" className="mx-auto mb-3" />
              <p className="font-impact text-lg uppercase tracking-tight text-white">{match.vis.name}</p>
           </div>
           <button onClick={onClose} className="absolute top-6 right-8 text-zinc-500 hover:text-white">✕</button>
        </div>

        {/* Ticker de Eventos Pasados */}
        <div className="flex-1 overflow-y-auto p-10 font-mono text-xs space-y-3 custom-scrollbar">
           <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-6 border-b border-zinc-800 pb-2">CRÓNICA DEL ENCUENTRO</h4>
           {match.events && match.events.length > 0 ? (
             match.events.map((t, i) => (
               <div key={i} className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${getEventStyles(t.type)}`}>
                 <span className="text-lg flex-shrink-0 w-8 text-center">{getEventIcon(t.type)}</span>
                 <div className="flex-1">
                   <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Minuto {t.m}</span>
                   <p className="text-sm leading-relaxed">{t.msg}</p>
                 </div>
               </div>
             ))
           ) : (
             <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
                <p className="text-4xl mb-4">📖</p>
                <p className="text-sm uppercase font-black tracking-widest">Sin registros detallados de eventos</p>
             </div>
           )}
        </div>

        <div className="p-8 border-t border-zinc-800 bg-zinc-900/30">
           <button onClick={onClose} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Cerrar Historial</button>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailsModal;
