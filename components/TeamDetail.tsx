
import React from 'react';
import { Team, Player } from '../types';
import SquadList from './SquadList';
import ClubCrest from './ClubCrest';

interface Props {
  team: Team;
  onInspectPlayer?: (player: Player) => void;
}

const TeamDetail: React.FC<Props> = ({ team, onInspectPlayer }) => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 flex items-center gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 -translate-y-1/4 translate-x-1/4">
          <ClubCrest crest={team.crest} size="xl" />
        </div>

        <ClubCrest crest={team.crest} size="xl" />
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">División {team.division}</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500 text-xs font-mono">{team.capacity.toLocaleString()} Espectadores</span>
          </div>
          <h2 className="text-6xl font-impact text-zinc-100 leading-none mb-4">{team.name}</h2>
          
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Puntos</p>
              <p className="text-3xl font-impact text-white">{team.pts}</p>
            </div>
            <div className="h-10 w-px bg-zinc-800 self-center"></div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Diferencia Goles</p>
              <p className="text-3xl font-impact text-white">{(team.gf - team.gc) > 0 ? `+${team.gf - team.gc}` : team.gf - team.gc}</p>
            </div>
          </div>
        </div>

        <div className="text-right bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-inner">
          <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Presupuesto</p>
          <p className="text-3xl font-mono font-bold text-emerald-400 tracking-tighter">{team.budget.toLocaleString()}€</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 p-8 shadow-xl">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
          <span className="text-2xl">👕</span> 
          <span className="uppercase tracking-tighter">Plantilla Profesional</span>
          <span className="ml-auto text-[10px] font-mono text-zinc-600 uppercase">{team.squad.length} Jugadores</span>
        </h3>
        <SquadList players={team.squad} onInspectPlayer={onInspectPlayer} />
      </div>
    </div>
  );
};

export default TeamDetail;
