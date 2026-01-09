
import React from 'react';
import { Player, Position } from '../types';
import { posOrder } from '../utils';
import { POSITION_COLORS } from '../constants';

interface Props {
  players: Player[];
  onToggleTransfer?: (id: string) => void;
  onInspectPlayer?: (player: Player) => void;
  isUser?: boolean;
}

const SquadList: React.FC<Props> = ({ players, onToggleTransfer, onInspectPlayer, isUser }) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (posOrder[a.pos] !== posOrder[b.pos]) return posOrder[a.pos] - posOrder[b.pos];
    return b.tsi - a.tsi;
  });

  const getMoralBadge = (happiness: number) => {
    if (happiness > 80) return { label: 'Excelente', color: 'text-emerald-400', icon: '😊' };
    if (happiness > 50) return { label: 'Normal', color: 'text-zinc-400', icon: '😐' };
    if (happiness > 30) return { label: 'Baja', color: 'text-orange-400', icon: '😟' };
    return { label: 'En Rebeldía', color: 'text-red-500', icon: '😠' };
  };

  const getPersonalityColor = (personality: string) => {
    switch(personality) {
      case 'LEAL': return 'text-cyan-400';
      case 'AMBICIOSO': return 'text-yellow-400';
      case 'REBELDE': return 'text-red-400';
      case 'PROFESIONAL': return 'text-emerald-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="space-y-4">
      <table className="w-full">
        <thead>
          <tr className="text-left text-zinc-500 text-xs uppercase font-black border-b border-zinc-800">
            <th className="pb-6 px-4">Pos</th>
            <th className="pb-6">Jugador</th>
            <th className="pb-6 text-center">Moral</th>
            <th className="pb-6 text-center">Personalidad</th>
            <th className="pb-6 text-center">TSI</th>
            <th className="pb-6 text-right px-4">Estado</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {sortedPlayers.map(p => {
            const colors = POSITION_COLORS[p.pos];
            const isInjured = p.injuryWeeks > 0;
            const moral = getMoralBadge(p.happiness);
            
            return (
              <tr key={p.id} className={`border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors ${isInjured ? 'opacity-40' : ''}`}>
                <td className="py-5 px-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black ${colors.light}`}>{isInjured ? '🏥' : p.pos}</span>
                </td>
                <td className="py-5">
                  <button 
                    onClick={() => onInspectPlayer?.(p)}
                    className="text-left group"
                  >
                    <p className="font-bold text-base group-hover:text-emerald-400 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{p.age} Años</p>
                  </button>
                </td>
                <td className="py-5 text-center">
                   <div className="flex flex-col items-center">
                      <span className="text-lg">{moral.icon}</span>
                      <span className={`text-[8px] font-black uppercase ${moral.color}`}>{moral.label}</span>
                   </div>
                </td>
                <td className="py-5 text-center">
                   <span className={`text-[10px] font-black uppercase tracking-widest ${getPersonalityColor(p.personality)}`}>
                      {p.personality}
                   </span>
                </td>
                <td className="py-5 text-center font-mono text-zinc-300 text-base">{p.tsi.toLocaleString()}</td>
                <td className="py-5 text-right px-4">
                   {isInjured ? (
                     <span className="text-red-500 font-black text-xs uppercase tracking-tighter">{p.injuryWeeks} Semanas</span>
                   ) : (
                     <button 
                      onClick={() => onToggleTransfer?.(p.id)}
                      className={`text-[10px] px-3 py-1.5 rounded-lg border font-black uppercase tracking-widest transition-all ${p.isTransferListed ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                     >
                       {p.isTransferListed ? 'VENDIBLE' : 'FIJO'}
                     </button>
                   )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SquadList;
