
import React, { useState, useMemo } from 'react';
import { Team, Player, Position } from '../types';
import { FORMATIONS, FORMATION_COORDS, POSITION_COLORS } from '../constants';

interface Props {
  team: Team;
  onUpdate: (team: Team) => void;
}

const ROLE_TO_CATEGORY: Record<string, Position> = {
  "POR": "POR",
  "LTI": "DEF", "DCI": "DEF", "DCD": "DEF", "LTD": "DEF", "LIB": "DEF", "LI": "DEF", "LD": "DEF",
  "EIZ": "MED", "MCI": "MED", "MCD": "MED", "MC": "MED", "EDE": "MED", "MI": "MED", "MD": "MED",
  "EI": "DEL", "ED": "DEL", "DC": "DEL", "DI": "DEL", "DD": "DEL", "SD": "DEL"
};

const AUTO_ALIGN_PRIORITY = [
  'POR', 
  'DCI', 'DCD', 'LIB', 'DC', 'MCI', 'MCD', 'MC', 
  'LTI', 'LTD', 'EIZ', 'EDE', 'EI', 'ED', 'DI', 'DD'
];

const TacticsBoard: React.FC<Props> = ({ team, onUpdate }) => {
  const [selectingRole, setSelectingRole] = useState<string | null>(null);

  const setFormation = (form: string) => {
    onUpdate({ ...team, formation: form, lineup: {} });
    setSelectingRole(null);
  };

  const autoAlign = () => {
    let availablePlayers = [...team.squad].filter(p => (p.injuryWeeks || 0) === 0);
    const newLineup: Record<string, string | null> = {};
    const starterRoles = Object.keys(FORMATION_COORDS[team.formation]);
    
    const prioritizedRoles = [...starterRoles].sort((a, b) => {
        const idxA = AUTO_ALIGN_PRIORITY.indexOf(a);
        const idxB = AUTO_ALIGN_PRIORITY.indexOf(b);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

    const getSuitabilityScore = (player: Player, role: string) => {
        let score = player.tsi;
        if (player.preferredRoles.includes(role)) score += 10000000;
        const requiredCat = ROLE_TO_CATEGORY[role];
        if (player.pos === requiredCat) score += 1000000;
        return score;
    };

    prioritizedRoles.forEach(role => {
        availablePlayers.sort((a, b) => getSuitabilityScore(b, role) - getSuitabilityScore(a, role));
        const bestCandidate = availablePlayers[0];
        if (bestCandidate) {
            newLineup[role] = bestCandidate.id;
            availablePlayers = availablePlayers.filter(p => p.id !== bestCandidate.id);
        } else {
            newLineup[role] = null;
        }
    });

    const benchRoles = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
    benchRoles.forEach(role => {
        availablePlayers.sort((a,b) => b.tsi - a.tsi);
        const player = availablePlayers[0];
        if (player) {
            newLineup[role] = player.id;
            availablePlayers = availablePlayers.filter(p => p.id !== player.id);
        } else {
            newLineup[role] = null;
        }
    });

    onUpdate({ ...team, lineup: newLineup });
    setSelectingRole(null);
  };

  const clearSlot = (role: string) => {
    const newLineup = { ...team.lineup };
    newLineup[role] = null;
    onUpdate({ ...team, lineup: newLineup });
    setSelectingRole(null);
  };

  const assignPlayer = (role: string, playerId: string) => {
    const player = team.squad.find(p => p.id === playerId);
    if (player?.injuryWeeks && player.injuryWeeks > 0) {
      alert("⚠️ JUGADOR LESIONADO: No puede ser convocado.");
      return;
    }

    const newLineup = { ...team.lineup };
    const currentRoleOfSelectedPlayer = Object.keys(newLineup).find(r => newLineup[r] === playerId);
    const playerAtTargetRole = newLineup[role];

    if (currentRoleOfSelectedPlayer) {
        newLineup[currentRoleOfSelectedPlayer] = playerAtTargetRole || null;
    }

    newLineup[role] = playerId;
    onUpdate({ ...team, lineup: newLineup });
    setSelectingRole(null);
  };

  const candidates = useMemo(() => {
    if (!selectingRole) return [];
    
    const targetCategory = ROLE_TO_CATEGORY[selectingRole];

    return [...team.squad]
      .filter(p => (p.injuryWeeks || 0) === 0)
      .filter(p => {
         const currentPlayerIdInSlot = team.lineup[selectingRole];
         return p.id !== currentPlayerIdInSlot;
      })
      .sort((a, b) => {
        if (!targetCategory) return b.tsi - a.tsi;
        
        const aPref = a.preferredRoles.includes(selectingRole) ? 1 : 0;
        const bPref = b.preferredRoles.includes(selectingRole) ? 1 : 0;
        if (aPref !== bPref) return bPref - aPref;

        const aMatches = a.pos === targetCategory;
        const bMatches = b.pos === targetCategory;
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        
        return b.tsi - a.tsi;
      });
  }, [team.squad, team.lineup, selectingRole]);

  const targetCategory = selectingRole ? ROLE_TO_CATEGORY[selectingRole] : null;

  const getMoralIcon = (happiness: number) => {
    if (happiness > 80) return "😊";
    if (happiness > 50) return "😐";
    return "😠";
  };

  const benchRoles = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Sección Superior: Campo y Panel de Selección */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Campo de Juego - Dimensiones controladas por aspect-ratio */}
        <div className="relative w-full max-w-[400px] aspect-[3/4] bg-emerald-900 rounded-[2.5rem] border-[8px] border-white/10 shadow-2xl overflow-hidden flex-shrink-0 select-none mx-auto xl:mx-0 ring-1 ring-white/10">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/10"></div>
          
          {Object.entries(FORMATION_COORDS[team.formation]).map(([role, coord]) => {
            const id = team.lineup[role];
            const player = team.squad.find(p => p.id === id);
            const isAssigned = !!player;
            const category = ROLE_TO_CATEGORY[role];
            const outOfPos = isAssigned && player.pos !== category;
            const notPreferred = isAssigned && !player.preferredRoles.includes(role);
            const colors = player ? POSITION_COLORS[player.pos] : POSITION_COLORS[category || 'MED'];

            return (
              <button
                key={role}
                onClick={() => setSelectingRole(role)}
                className="absolute w-20 -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer focus:outline-none touch-manipulation"
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              >
                <div className={`w-14 h-14 rounded-full mx-auto flex flex-col items-center justify-center border-2 transition-all group-hover:scale-110 active:scale-95 ${isAssigned ? `${colors.bg} border-white/40 shadow-lg` : 'bg-black/40 border-white/10 backdrop-blur-sm'} ${outOfPos ? 'ring-4 ring-orange-500/50' : ''}`}>
                   <span className={`text-[8px] font-black uppercase mb-0.5 ${isAssigned ? colors.text : 'text-white/30'}`}>{role}</span>
                   {isAssigned ? (
                     <div className="flex flex-col items-center">
                        <span className={`text-base font-impact leading-none ${colors.text}`}>{player.tsi}</span>
                        <span className="text-[10px] absolute -top-1 -right-1">{getMoralIcon(player.happiness)}</span>
                     </div>
                   ) : (
                     <span className="text-lg opacity-20 group-hover:opacity-100 transition-opacity">?</span>
                   )}
                </div>
                
                {outOfPos && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[7px] font-black px-1 rounded shadow-sm z-20 whitespace-nowrap">
                    INCÓMODO
                  </div>
                )}
                {notPreferred && !outOfPos && (
                   <div title="Rol no preferido" className="absolute -top-2 -left-2 bg-amber-500 text-black w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm z-20 cursor-help border border-white/20">!</div>
                )}

                <p className={`text-[9px] font-bold mt-1.5 truncate rounded px-2 py-0.5 border ${isAssigned ? 'bg-zinc-950 text-white border-white/10' : 'bg-black/20 text-white/20 border-transparent'}`}>
                  {isAssigned ? player.name.split(' ').pop() : 'VACÍO'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Panel de Selección Dinámico - Altura adaptativa */}
        <div className="flex-1 w-full flex flex-col gap-4 h-[600px] xl:h-[533px]">
          <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 flex flex-col gap-4 flex-shrink-0">
             <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Configuración Táctica</h3>
                <button onClick={autoAlign} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">
                  ⚡ Alineación Auto
                </button>
             </div>
             <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {FORMATIONS.map(f => (
                      <button key={f} onClick={() => setFormation(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${team.formation === f ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-zinc-800 text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                        {f}
                      </button>
                    ))}
                </div>
                <button onClick={() => onUpdate({...team, lineup: {}})} className="text-[9px] font-black uppercase text-red-500 hover:text-red-400">Limpiar</button>
             </div>
          </div>

          {selectingRole ? (
            <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 flex-1 flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
               <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4 flex-shrink-0">
                 <div>
                    <h3 className="text-xs font-black uppercase text-zinc-300 tracking-widest">Elegir para <span className="text-emerald-400">{selectingRole}</span></h3>
                    <p className="text-[10px] text-zinc-500 font-bold">
                       {candidates.length} candidatos disponibles
                    </p>
                 </div>
                 <button onClick={() => setSelectingRole(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
               </div>

               <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  <button onClick={() => clearSlot(selectingRole)} className="w-full p-4 rounded-2xl border border-dashed border-zinc-800 text-zinc-600 font-black text-[10px] uppercase hover:bg-zinc-800/50 transition-colors">
                    Dejar posición vacía
                  </button>
                  
                  {candidates.length === 0 && (
                     <div className="text-center py-10 text-zinc-500 text-xs uppercase font-bold tracking-widest border border-zinc-800 border-dashed rounded-2xl mt-4">
                        No hay jugadores disponibles
                     </div>
                  )}

                  {candidates.map(p => {
                    const colors = POSITION_COLORS[p.pos];
                    const isPreferred = p.preferredRoles.includes(selectingRole);
                    const isIdealCategory = p.pos === targetCategory;
                    const currentRole = Object.keys(team.lineup).find(r => team.lineup[r] === p.id);
                    
                    return (
                      <button 
                        key={p.id} 
                        onClick={() => assignPlayer(selectingRole, p.id)} 
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border bg-zinc-950 hover:bg-zinc-900 transition-all border-zinc-800 group ${isPreferred ? 'border-emerald-500/30' : isIdealCategory ? 'border-yellow-500/20' : 'border-orange-500/20'} ${currentRole ? 'opacity-60' : ''}`}
                      >
                         <div className="flex items-center gap-4">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black ${colors.bg} ${colors.text}`}>
                              {p.pos}
                            </span>
                            <div className="text-left">
                               <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400">{p.name}</p>
                                  <span className="text-xs">{getMoralIcon(p.happiness)}</span>
                               </div>
                               <p className="text-[10px] text-zinc-500 font-impact tracking-widest uppercase">TSI: {p.tsi.toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="text-right flex flex-col items-end gap-1">
                           {currentRole && (
                             <span className="text-[8px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-black border border-zinc-700">EN {currentRole}</span>
                           )}
                           
                           {isPreferred ? (
                             <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-black border border-emerald-500/20">PREFERIDO</span>
                           ) : isIdealCategory ? (
                             <span className="text-[8px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded font-black border border-yellow-500/20">POS OK</span>
                           ) : (
                             <span className="text-[8px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded font-black border border-orange-500/20">FUERA POS</span>
                           )}
                         </div>
                      </button>
                    );
                  })}
               </div>
            </div>
          ) : (
            <div className="bg-zinc-900/30 p-10 rounded-[2.5rem] border border-zinc-800 border-dashed flex flex-col items-center justify-center text-center flex-1">
               <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-2xl mb-4 opacity-20">📋</div>
               <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                 Selecciona un puesto en el campo o un hueco del banquillo para completar tu convocatoria.
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Banquillo */}
      <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-xl flex flex-col gap-6 w-full">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Convocatoria de Suplentes</h3>
           <div className="flex gap-1">
              {benchRoles.map(r => (
                <div key={r} className={`w-1.5 h-1.5 rounded-full ${team.lineup[r] ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-zinc-800'}`}></div>
              ))}
           </div>
        </div>
        <div className="flex justify-between gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {benchRoles.map((role) => {
            const id = team.lineup[role];
            const player = team.squad.find(p => p.id === id);
            const isAssigned = !!player;
            const colors = player ? POSITION_COLORS[player.pos] : null;

            return (
              <button 
                key={role} 
                onClick={() => setSelectingRole(role)} 
                className={`flex-1 min-w-[100px] flex flex-col items-center group transition-all p-4 rounded-2xl border-2 ${selectingRole === role ? 'bg-emerald-500/10 border-emerald-500' : isAssigned ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-900/50 border-zinc-800 border-dashed hover:bg-zinc-800/50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all ${isAssigned ? colors?.bg : 'bg-zinc-900'} relative`}>
                  {isAssigned ? (
                    <>
                      <span className={`text-base font-impact ${colors?.text}`}>{player.tsi}</span>
                      <span className="absolute -top-1 -right-1 text-[10px]">{getMoralIcon(player.happiness)}</span>
                    </>
                  ) : (
                    <span className="text-zinc-700 text-xl">+</span>
                  )}
                </div>
                <p className={`text-[9px] font-black uppercase tracking-tighter text-center truncate w-full ${isAssigned ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {isAssigned ? player.name.split(' ').pop() : 'AÑADIR'}
                </p>
                <span className="text-[7px] font-black text-zinc-500 mt-1">{role}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TacticsBoard;
