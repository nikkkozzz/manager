
import React, { useState, useEffect } from 'react';
import { Match, MatchEvent, EventType, Team } from '../types';
import { GOAL_COMMS } from '../constants';
import ClubCrest from './ClubCrest';

interface Props {
  match: Match;
  onComplete: (result: [number, number], events: MatchEvent[]) => void;
}

const MatchSimulator: React.FC<Props> = ({ match, onComplete }) => {
  const [minute, setMinute] = useState(0);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [ticker, setTicker] = useState<MatchEvent[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (minute >= 90) {
      setIsFinished(true);
      return;
    }

    const timer = setTimeout(() => {
      setMinute(m => m + 1);

      // Helper to calculate power of the Starting XI
      const getPower = (team: Team) => {
        // Extract IDs of players in starter positions (excluding bench 'S1', 'S2' etc)
        const starterIds = Object.entries(team.lineup)
          .filter(([role, id]) => id && !role.startsWith('S'))
          .map(([_, id]) => id);

        return team.squad
          .filter(p => starterIds.includes(p.id))
          .reduce((sum: number, p: any) => {
            const fatiguePenalty = p.fatigue > 70 ? (1 - (p.fatigue - 70) / 100) : 1;
            // Weighted calculation: Goalkeepers contribute less to attacking power generally, but we keep simple sum for now
            return sum + (p.h_anotacion * fatiguePenalty);
          }, 0);
      };

      const locPower = getPower(match.loc) || 10; // Fallback to avoid division by zero
      const visPower = getPower(match.vis) || 10;
      const totalPower = locPower + visPower;

      const randomRoll = Math.random();
      const currentMinute = minute + 1;

      // 1. Goles y Ocasiones (8% de probabilidad por minuto)
      if (randomRoll < 0.08) {
        const isLoc = Math.random() < (locPower / totalPower);
        const attackingTeam = isLoc ? match.loc : match.vis;
        const defendingTeam = isLoc ? match.vis : match.loc;
        
        // Find players who are actually playing
        const starterIds = Object.entries(attackingTeam.lineup)
          .filter(([role, id]) => id && !role.startsWith('S'))
          .map(([_, id]) => id);
        
        const activeSquad = attackingTeam.squad.filter(p => starterIds.includes(p.id));
        const attackers = activeSquad.filter(p => ['DEL', 'MED'].includes(p.pos));
        const player = attackers.length > 0 
           ? attackers[Math.floor(Math.random() * attackers.length)] 
           : activeSquad[Math.floor(Math.random() * activeSquad.length)]; // Fallback if no attackers

        if (player) {
          const goalRoll = Math.random();
          if (goalRoll < 0.25) { 
            setScore(s => isLoc ? [s[0] + 1, s[1]] : [s[0], s[1] + 1]);
            addEvent(currentMinute, `¡GOOOOOOL de ${player.name}! ${GOAL_COMMS[Math.floor(Math.random() * GOAL_COMMS.length)]}`, 'goal');
            player.goals += 1;
          } else if (goalRoll < 0.55) { 
            const keeperId = defendingTeam.lineup['POR'];
            const keeper = defendingTeam.squad.find(p => p.id === keeperId) || defendingTeam.squad[0];
            addEvent(currentMinute, `¡PARADÓN de ${keeper.name}! Evita el tanto de ${player.name} con una estirada increíble.`, 'save');
          } else { 
            addEvent(currentMinute, `Ocasión clara para ${player.name}... ¡el balón se va rozando el poste!`, 'chance');
          }
        }
      }
      else if (randomRoll < 0.10) {
        const team = Math.random() > 0.5 ? match.loc : match.vis;
        // Only target players on the pitch
        const starterIds = Object.entries(team.lineup)
          .filter(([role, id]) => id && !role.startsWith('S'))
          .map(([_, id]) => id);
        const activeSquad = team.squad.filter(p => starterIds.includes(p.id));
        const player = activeSquad[Math.floor(Math.random() * activeSquad.length)];
        
        if (player) {
            if (Math.random() > 0.15) {
              addEvent(currentMinute, `Tarjeta Amarilla para ${player.name} por una entrada a destiempo.`, 'yellow');
            } else {
              addEvent(currentMinute, `¡TARJETA ROJA! ${player.name} es expulsado tras una falta violenta.`, 'red');
            }
        }
      }
      else if (randomRoll < 0.105) {
        const team = Math.random() > 0.5 ? match.loc : match.vis;
        const starterIds = Object.entries(team.lineup)
          .filter(([role, id]) => id && !role.startsWith('S'))
          .map(([_, id]) => id);
        const activeSquad = team.squad.filter(p => starterIds.includes(p.id));
        const player = activeSquad[Math.floor(Math.random() * activeSquad.length)];
        if (player) {
           addEvent(currentMinute, `Atención médica en el campo: ${player.name} parece haberse lesionado solo.`, 'injury');
        }
      }

    }, 80);

    return () => clearTimeout(timer);
  }, [minute, match]);

  const addEvent = (m: number, msg: string, type: EventType) => {
    setTicker(prev => [{ m, msg, type }, ...prev]);
  };

  const getEventStyles = (type: EventType) => {
    switch (type) {
      case 'goal': return 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400';
      case 'yellow': return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500';
      case 'red': return 'bg-red-500/10 border-red-500/50 text-red-500 font-bold';
      case 'injury': return 'bg-orange-500/10 border-orange-500/50 text-orange-400';
      case 'save': return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
      default: return 'bg-zinc-900 border-zinc-800 text-zinc-500';
    }
  };

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

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="bg-zinc-900/50 p-12 border-b border-zinc-800 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
        <div className="flex-1 text-center relative z-10">
           <ClubCrest crest={match.loc.crest} size="lg" className="mx-auto mb-4" />
           <p className="font-impact text-xl text-zinc-100 uppercase tracking-tight">{match.loc.name}</p>
        </div>
        <div className="flex flex-col items-center px-12 relative z-10">
           <div className="flex items-center gap-3 mb-4">
              <span className="text-emerald-500 font-mono text-xl bg-emerald-500/10 px-4 py-1 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                {minute}'
              </span>
           </div>
           <div className="text-8xl font-impact tracking-tighter text-white drop-shadow-2xl">
             {score[0]} <span className="text-zinc-700 text-6xl mx-2">-</span> {score[1]}
           </div>
        </div>
        <div className="flex-1 text-center relative z-10">
           <ClubCrest crest={match.vis.crest} size="lg" className="mx-auto mb-4" />
           <p className="font-impact text-xl text-zinc-100 uppercase tracking-tight">{match.vis.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 font-mono text-xs space-y-3 custom-scrollbar">
        {ticker.map((t, i) => (
          <div key={i} className={`p-4 rounded-2xl border flex items-start gap-4 transition-all animate-in slide-in-from-right duration-500 ${getEventStyles(t.type)}`}>
            <span className="text-lg flex-shrink-0 w-8 text-center">{getEventIcon(t.type)}</span>
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Minuto {t.m}</span>
              <p className="text-sm leading-relaxed">{t.msg}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 border-t border-zinc-800 bg-zinc-900/30 flex justify-center items-center">
         {isFinished ? (
           <button 
             onClick={() => onComplete(score, ticker)} 
             className="bg-emerald-600 hover:bg-emerald-500 text-white px-16 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/40 active:scale-95 animate-in fade-in zoom-in duration-300"
           >
             FINALIZAR JORNADA
           </button>
         ) : (
           <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div> Live Match Simulator v4.0
           </div>
         )}
      </div>
    </div>
  );
};

export default MatchSimulator;
