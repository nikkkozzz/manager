
import React from 'react';
import { Player, Team, TrainingIntensity } from '../types';
import { POSITION_COLORS } from '../constants';
import { posOrder } from '../utils';

interface Props {
  team: Team;
  onUpdateFocus: (playerId: string, focus: Player['trainingFocus']) => void;
  onUpdateIntensity: (playerId: string, intensity: TrainingIntensity) => void;
}

const TrainingView: React.FC<Props> = ({ team, onUpdateFocus, onUpdateIntensity }) => {
  const sortedSquad = [...team.squad].sort((a, b) => {
    if (posOrder[a.pos] !== posOrder[b.pos]) return posOrder[a.pos] - posOrder[b.pos];
    return b.tsi - a.tsi;
  });

  const getIntensityLabel = (intensity: TrainingIntensity) => {
    switch(intensity) {
      case 'LOW': return 'Relajado';
      case 'MED': return 'Normal';
      case 'HIGH': return 'Intenso';
      case 'EXTREME': return 'Límite';
    }
  };

  const getFatigueColor = (val: number) => {
    if (val < 40) return 'bg-cyan-500';
    if (val < 70) return 'bg-emerald-500';
    if (val < 90) return 'bg-orange-500';
    return 'bg-red-500 animate-pulse';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl border border-blue-500/20">🏋️‍♂️</div>
            <div>
               <h2 className="text-2xl font-impact text-zinc-100 uppercase tracking-tight">Cargas de Entrenamiento</h2>
               <p className="text-xs text-zinc-500 font-mono italic">EQUILIBRA EL DESARROLLO CON EL RIESGO DE LESIÓN</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="text-right px-6 border-r border-zinc-800">
               <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Fatiga Media</p>
               <p className="text-xl font-bold text-zinc-300">
                 {Math.round(team.squad.reduce((a,b)=>a+b.fatigue,0)/team.squad.length)}%
               </p>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Lesionados</p>
               <p className="text-xl font-bold text-red-500">
                 {team.squad.filter(p => p.injuryWeeks > 0).length}
               </p>
            </div>
         </div>
      </div>

      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-xl">
         <table className="w-full text-left">
            <thead className="bg-zinc-950 text-[10px] uppercase font-black tracking-widest text-zinc-500 border-b border-zinc-800">
               <tr>
                  <th className="p-6">Jugador</th>
                  <th className="p-6">Enfoque</th>
                  <th className="p-6">Intensidad</th>
                  <th className="p-6 text-center">Fatiga / Carga</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
               {sortedSquad.map(p => {
                  const colors = POSITION_COLORS[p.pos];
                  const isInjured = p.injuryWeeks > 0;
                  
                  return (
                     <tr key={p.id} className={`hover:bg-zinc-800/30 transition-colors ${isInjured ? 'opacity-50 grayscale' : ''}`}>
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-bold ${colors.bg} ${colors.text}`}>
                                {isInjured ? '🏥' : p.pos}
                              </span>
                              <div>
                                 <p className="font-bold text-sm">{p.name} {isInjured && <span className="text-red-500 text-[10px] font-black ml-1">[{p.injuryWeeks} Sem]</span>}</p>
                                 <p className="text-[10px] text-zinc-500 font-mono">TSI: {p.tsi.toLocaleString()}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <select 
                            disabled={isInjured}
                            value={p.trainingFocus}
                            onChange={(e) => onUpdateFocus(p.id, e.target.value as any)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase text-zinc-400 focus:border-emerald-500 outline-none"
                           >
                              <option value="NONE">Equilibrado</option>
                              {p.pos === 'POR' && <option value="GK">Portería</option>}
                              {p.pos === 'DEF' && <option value="DEF">Defensa</option>}
                              {p.pos === 'MED' && <option value="MID">Creación</option>}
                              {p.pos === 'DEL' && <option value="ATT">Remate</option>}
                           </select>
                        </td>
                        <td className="p-6">
                           <div className="flex gap-1">
                              {(['LOW', 'MED', 'HIGH', 'EXTREME'] as const).map(i => (
                                 <button
                                    key={i}
                                    disabled={isInjured}
                                    onClick={() => onUpdateIntensity(p.id, i)}
                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${p.trainingIntensity === i ? 'bg-zinc-100 border-white text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-300'}`}
                                 >
                                    {i === 'LOW' ? 'Baja' : i === 'MED' ? 'Normal' : i === 'HIGH' ? 'Alta' : 'Límite'}
                                 </button>
                              ))}
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col items-center gap-1.5">
                              <div className="w-32 bg-zinc-950 h-2 rounded-full border border-zinc-800 overflow-hidden shadow-inner">
                                 <div 
                                    className={`h-full transition-all duration-700 ${getFatigueColor(p.fatigue)}`} 
                                    style={{ width: `${p.fatigue}%` }}
                                 ></div>
                              </div>
                              <div className="flex justify-between w-32 px-1">
                                <span className="text-[8px] text-zinc-600 font-black uppercase">Carga actual</span>
                                <span className={`text-[9px] font-mono font-bold ${p.fatigue > 80 ? 'text-red-500' : 'text-zinc-400'}`}>{p.fatigue}%</span>
                              </div>
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { t: 'Relajado', d: '-15% Fatiga. -50% Crecimiento.', c: 'text-cyan-400' },
           { t: 'Normal', d: '+5% Fatiga. 100% Crecimiento.', c: 'text-emerald-400' },
           { t: 'Intenso', d: '+18% Fatiga. 220% Crecimiento.', c: 'text-orange-400' },
           { t: 'Límite', d: '+35% Fatiga. 450% Crecimiento.', c: 'text-red-500 animate-pulse' }
         ].map(item => (
           <div key={item.t} className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 text-center">
              <h4 className={`text-xs font-black uppercase mb-2 ${item.c}`}>{item.t}</h4>
              <p className="text-[10px] text-zinc-500 leading-tight">{item.d}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default TrainingView;
