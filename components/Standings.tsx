
import React, { useState, useMemo } from 'react';
import { LeagueState, Player, Team, Match } from '../types';
import ClubCrest from './ClubCrest';
import { POSITION_COLORS } from '../constants';

interface Props {
  league: LeagueState;
  currentDiv: number;
  onSelectTeam: (id: string) => void;
  onInspectMatch: (match: Match) => void;
}

type SubView = 'TABLE' | 'FIXTURES' | 'SCORERS';

const Standings: React.FC<Props> = ({ league, currentDiv, onSelectTeam, onInspectMatch }) => {
  const [selectedDiv, setSelectedDiv] = useState(currentDiv);
  const [subView, setSubView] = useState<SubView>('TABLE');
  const [viewedWeek, setViewedWeek] = useState(league.week);

  const sortedTeams = useMemo(() => {
    return [...league.teams]
      .filter(t => t.division === selectedDiv)
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        const diffA = a.gf - a.gc;
        const diffB = b.gf - b.gc;
        if (diffB !== diffA) return diffB - diffA;
        return b.gf - a.gf;
      });
  }, [league.teams, selectedDiv]);

  const topScorers = useMemo(() => {
    const players: (Player & { teamName: string, teamCrest: any })[] = [];
    league.teams
      .filter(t => t.division === selectedDiv)
      .forEach(t => {
        t.squad.forEach(p => {
          players.push({ ...p, teamName: t.name, teamCrest: t.crest });
        });
      });
    return players.sort((a, b) => b.goals - a.goals).slice(0, 10);
  }, [league.teams, selectedDiv]);

  const fixturesByWeek = useMemo(() => {
    const weekIdx = viewedWeek - 1;
    if (!league.calendar || !league.calendar[selectedDiv]) return [];
    return league.calendar[selectedDiv][weekIdx] || [];
  }, [league.calendar, selectedDiv, viewedWeek]);

  const totalWeeks = useMemo(() => {
    if (!league.calendar || !league.calendar[selectedDiv]) return 0;
    return league.calendar[selectedDiv].length;
  }, [league.calendar, selectedDiv]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
           <div className="flex gap-3">
            {[1, 2, 3].map(d => (
              <button
                key={d}
                onClick={() => { setSelectedDiv(d); setViewedWeek(league.week); }}
                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedDiv === d ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
              >
                División {d}
              </button>
            ))}
          </div>
          <div className="bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 flex gap-1">
             <TabButton active={subView === 'TABLE'} label="Clasificación" onClick={() => setSubView('TABLE')} />
             <TabButton active={subView === 'FIXTURES'} label="Partidos" onClick={() => setSubView('FIXTURES')} />
             <TabButton active={subView === 'SCORERS'} label="Goleadores" onClick={() => setSubView('SCORERS')} />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
        {subView === 'TABLE' && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                <th className="py-5 px-6 w-16 text-center">Pos</th>
                <th className="py-5">Club</th>
                <th className="py-5 text-center">PJ</th>
                <th className="py-5 text-center">GF</th>
                <th className="py-5 text-center">GC</th>
                <th className="py-5 text-center px-6">PTS</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedTeams.map((t, i) => (
                <tr key={t.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${t.isUser ? 'bg-emerald-500/5' : ''}`}>
                  <td className="py-4 px-6 text-center font-bold text-zinc-500">{i + 1}</td>
                  <td className="py-4">
                    <button onClick={() => onSelectTeam(t.id)} className="group flex items-center gap-4 text-left font-bold w-full">
                      {t.crest && <ClubCrest crest={t.crest} size="sm" />}
                      <div className="flex flex-col">
                        <span className="group-hover:text-emerald-400">{t.name}</span>
                        {t.isUser && <span className="text-[7px] bg-emerald-500 text-zinc-950 px-1 py-0.5 rounded font-black uppercase w-fit">Tu Club</span>}
                      </div>
                    </button>
                  </td>
                  <td className="py-4 text-center font-mono">{t.pj}</td>
                  <td className="py-4 text-center font-mono">{t.gf}</td>
                  <td className="py-4 text-center font-mono">{t.gc}</td>
                  <td className="py-4 text-center px-6 font-black font-mono text-base">{t.pts}</td>
                </tr>
              ))}
              {sortedTeams.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                    No hay equipos en esta división.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {subView === 'FIXTURES' && (
          <div className="p-10 space-y-6">
             <div className="flex justify-between items-center mb-8 bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800">
                <button 
                  disabled={viewedWeek <= 1} 
                  onClick={() => setViewedWeek(w => w - 1)}
                  className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 disabled:opacity-20"
                > ← </button>
                <div className="text-center">
                  <h3 className="text-xl font-impact uppercase tracking-tighter">Jornada {viewedWeek}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{viewedWeek < league.week ? 'RESULTADOS' : viewedWeek === league.week ? 'EN CURSO' : 'PRÓXIMAMENTE'}</p>
                </div>
                <button 
                  disabled={viewedWeek >= totalWeeks} 
                  onClick={() => setViewedWeek(w => w + 1)}
                  className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 disabled:opacity-20"
                > → </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fixturesByWeek.map((m, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => m.played && onInspectMatch(m)}
                    className={`bg-zinc-950 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between transition-all ${m.played ? 'hover:bg-zinc-900 hover:border-emerald-500/50 cursor-pointer' : 'opacity-80 cursor-default'}`}
                  >
                     <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        {m.loc.crest && <ClubCrest crest={m.loc.crest} size="sm" />}
                        <span className="text-sm font-bold truncate">{m.loc.name}</span>
                     </div>
                     <div className="flex items-center gap-4 bg-zinc-900 px-6 py-2 rounded-2xl border border-zinc-800 mx-4 shrink-0">
                        <span className={`text-xl font-impact ${m.played ? 'text-white' : 'text-zinc-700'}`}>{m.played ? m.score[0] : '-'}</span>
                        <span className="text-zinc-800 font-bold">:</span>
                        <span className={`text-xl font-impact ${m.played ? 'text-white' : 'text-zinc-700'}`}>{m.played ? m.score[1] : '-'}</span>
                     </div>
                     <div className="flex items-center gap-3 flex-1 justify-end overflow-hidden">
                        <span className="text-sm font-bold truncate text-right">{m.vis.name}</span>
                        {m.vis.crest && <ClubCrest crest={m.vis.crest} size="sm" />}
                     </div>
                  </button>
                ))}
             </div>
             {viewedWeek < league.week && <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Haz clic en un partido para ver los detalles del encuentro</p>}
          </div>
        )}

        {subView === 'SCORERS' && (
           <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                <th className="py-5 px-6 w-16 text-center">Pos</th>
                <th className="py-5">Jugador</th>
                <th className="py-5">Equipo</th>
                <th className="py-5 text-center px-6">Goles</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {topScorers.map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-4 px-6 text-center font-bold text-zinc-500">{i + 1}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${POSITION_COLORS[p.pos].light}`}>{p.pos}</span>
                       <span className="font-bold">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {p.teamCrest && <ClubCrest crest={p.teamCrest} size="sm" />}
                      <span className="text-zinc-400 font-bold text-xs">{p.teamName}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center px-6 font-impact text-2xl text-emerald-400">{p.goals}</td>
                </tr>
              ))}
              {topScorers.length === 0 && (
                 <tr>
                   <td colSpan={4} className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                     No hay goles registrados todavía.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
    {label}
  </button>
);

export default Standings;
