
import React from 'react';
import { Player } from '../types';
import { POSITION_COLORS } from '../constants';

interface Props {
  player: Player;
  onClose: () => void;
}

const PlayerModal: React.FC<Props> = ({ player, onClose }) => {
  const colors = POSITION_COLORS[player.pos];
  
  const minVal = Math.floor(player.value * 0.95);
  const maxVal = Math.floor(player.value * 1.15);

  const stats = [
    { label: 'Portería', val: player.h_porteria, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { label: 'Defensa', val: player.h_defensa, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'Jugadas', val: player.h_jugadas, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Anotación', val: player.h_anotacion, color: 'text-red-400', bg: 'bg-red-500/20' },
  ];

  const getMoralAnalysis = () => {
    const reasons = [];
    if (player.happiness > 80) reasons.push("Se siente valorado en el club.");
    if (player.currentRole && player.currentRole.startsWith('S')) {
      if (player.personality === 'AMBICIOSO') reasons.push("Descontento por ser suplente.");
      if (player.personality === 'LEAL') reasons.push("Acepta su rol de suplente por amor al club.");
    }
    // Lógica simple de posición (esto debería venir del estado global en una app real)
    // Pero aquí simulamos el análisis
    return reasons.length > 0 ? reasons : ["Situación estable en el club."];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className="max-w-xl w-full bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${colors.bg} p-8 flex justify-between items-start relative`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl font-impact select-none translate-x-1/4 -translate-y-1/4">
            {player.pos}
          </div>
          <div className="relative z-10">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border border-white/20 ${colors.text} bg-white/10`}>
              {player.pos}
            </span>
            <h2 className={`text-4xl font-impact mt-2 uppercase tracking-tight ${colors.text}`}>{player.name}</h2>
            <p className={`text-xs font-bold opacity-70 ${colors.text}`}>{player.team} • {player.age} años</p>
          </div>
          <button 
            onClick={onClose}
            className="relative z-10 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Carácter y Moral */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-black mb-2 tracking-widest">Personalidad</p>
                <p className="text-xl font-impact text-zinc-100 uppercase tracking-tighter">{player.personality}</p>
                <p className="text-[10px] text-zinc-600 mt-1 leading-tight">
                  {player.personality === 'LEAL' && "Prioriza el club ante ofertas externas."}
                  {player.personality === 'AMBICIOSO' && "Quiere minutos y éxitos constantes."}
                  {player.personality === 'REBELDE' && "Difícil de gestionar si no juega en su sitio."}
                  {player.personality === 'PROFESIONAL' && "Mantiene su nivel rinda como rinda el equipo."}
                </p>
             </div>
             <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-black mb-2 tracking-widest">Moral del Jugador</p>
                <div className="flex items-center gap-3">
                   <span className="text-3xl">{player.happiness > 70 ? '😊' : player.happiness > 40 ? '😐' : '😠'}</span>
                   <div>
                      <p className={`text-lg font-impact uppercase ${player.happiness > 70 ? 'text-emerald-400' : 'text-orange-400'}`}>{player.happiness}%</p>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold">Nivel de Satisfacción</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-zinc-800/20 p-5 rounded-3xl border border-zinc-800/50">
             <p className="text-[9px] text-zinc-500 uppercase font-black mb-3 tracking-widest">Informe de Bienestar</p>
             <ul className="space-y-2">
                {getMoralAnalysis().map((r, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {r}
                  </li>
                ))}
             </ul>
          </div>

          {/* Bloque de Atributos */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
                <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">{s.label}</p>
                <p className={`text-lg font-impact ${s.color}`}>{Math.floor(s.val)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800">
              <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">TSI</p>
              <p className="text-2xl font-impact text-zinc-100">{player.tsi.toLocaleString()}</p>
            </div>

            <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800">
              <p className="text-[9px] text-zinc-500 uppercase font-black mb-1 text-emerald-500">Valor Mercado</p>
              <p className="text-xl font-mono font-bold text-zinc-100">{player.value.toLocaleString()}€</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-black rounded-2xl uppercase tracking-widest text-xs transition-all shadow-xl"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;
