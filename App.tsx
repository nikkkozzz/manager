
import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, LeagueState, Team, Player, Match, Negotiation, MatchEvent } from './types';
import { createTeam, generateCalendar, generatePlayer, calculateTeamPrestige } from './utils';

// Sub-componentes
import TacticsBoard from './components/TacticsBoard';
import MatchSimulator from './components/MatchSimulator';
import Standings from './components/Standings';
import Market from './components/Market';
import ScoutView from './components/ScoutView';
import SquadList from './components/SquadList';
import TeamDetail from './components/TeamDetail';
import TrainingView from './components/TrainingView';
import PlayerModal from './components/PlayerModal';
import NegotiationModal from './components/NegotiationModal';
import MatchDetailsModal from './components/MatchDetailsModal';

const RIVAL_NAMES = [
  ["Thunder Shogun", 1], ["Crimson Valkyries", 1], ["Iron Citadel", 1], ["Zenith FC", 1], ["Apex Predators", 1], ["Neon Tokyo", 1], ["Cyber Dragons", 1],
  ["Celtic Wraiths", 2], ["Golden Griffins", 2], ["Midnight Galaxy", 2], ["Shadow Ninjas", 2], ["Arctic Wolves", 2], ["Desert Phantoms", 2], ["Void Walkers", 2],
  ["Emerald Guardians", 3], ["Neon Knights", 3], ["Solar Flares", 3], ["Magma Giants", 3], ["Oceanic Blue", 3], ["Titanium FC", 3]
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('TACTICS');
  const [league, setLeague] = useState<LeagueState | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const [activeNegPlayer, setActiveNegPlayer] = useState<Player | null>(null);
  const [inspectedMatch, setInspectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const userTeam = createTeam("Nikkko CF", 3, true);
    const rivals = RIVAL_NAMES.map(([n, d]) => createTeam(n as string, d as number));
    const allTeams = [userTeam, ...rivals];
    const calendar = generateCalendar(allTeams);
    const freeAgents = Array.from({ length: 15 }, () => generatePlayer(Math.floor(Math.random() * 3) + 1, true, "Libre"));
    
    setLeague({ 
      week: 1, 
      seasonCount: 1, 
      teams: allTeams, 
      freeAgents,
      calendar, 
      negotiations: [],
      pendingAuctions: [] 
    });
  }, []);

  const userTeam = useMemo(() => league?.teams.find(t => t.isUser) || null, [league]);

  const nextWeekMatch = useMemo(() => {
    if (!league || !userTeam) return null;
    const div = userTeam.division;
    const weekIdx = league.week - 1;
    const rounds = league.calendar[div];
    if (!rounds || !rounds[weekIdx]) return null;
    return rounds[weekIdx].find(m => m.loc.id === userTeam.id || m.vis.id === userTeam.id) || null;
  }, [league, userTeam]);

  const handleStartNegotiation = (player: Player, amount: number) => {
    if (!league || !userTeam) return;
    const minExpected = player.isTransferListed ? player.value * 0.9 : player.value * 1.4;
    let status: Negotiation['status'] = 'CLUB_REJECTED';
    let msg = "Oferta insuficiente para un jugador de su calibre.";
    if (amount >= minExpected) {
      status = 'PLAYER_NEGOTIATING';
      msg = "Aceptamos la oferta económica. Ahora debes convencer al jugador.";
    }
    const newNeg: Negotiation = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: player.id,
      playerName: player.name,
      sellerTeamName: player.team,
      amount: amount,
      status: status,
      playerBonus: 0,
      promisedRole: 'TITULAR',
      clubMessage: msg,
      playerMessage: status === 'PLAYER_NEGOTIATING' ? "Estoy dispuesto a escuchar tu proyecto deportivo." : ""
    };
    setLeague(prev => prev ? ({ ...prev, negotiations: [newNeg, ...prev.negotiations] }) : null);
    setView('MARKET');
  };

  const handlePlayerOffer = (negId: string, bonus: number, role: Negotiation['promisedRole']) => {
    setLeague(prev => {
      if (!prev || !userTeam) return null;
      return {
        ...prev,
        negotiations: prev.negotiations.map(n => {
          if (n.id !== negId) return n;
          const player = [...prev.teams.flatMap(t => t.squad), ...prev.freeAgents].find(p => p.id === n.playerId);
          if (!player) return n;
          const prestige = calculateTeamPrestige(userTeam);
          const score = (bonus / (player.value * 0.1)) * 30 + (prestige / 100) * 50 + (role === 'CLAVE' ? 20 : 10);
          if (score >= player.ambition) {
            return { ...n, status: 'AGREED', playerBonus: bonus, promisedRole: role, playerMessage: "¡Acepto el reto! Nos vemos al final de la jornada." };
          } else {
            return { ...n, status: 'FAILED', playerMessage: "Tu proyecto no me convence. Prefiero buscar otras opciones." };
          }
        })
      };
    });
  };

  const handleMatchComplete = (score: [number, number], events: MatchEvent[]) => {
    if (!league || !currentMatch || !userTeam) return;
    
    setLeague(prev => {
      if (!prev) return null;
      const updatedCalendar = { ...prev.calendar };
      const weekIdx = currentMatch.week - 1;
      
      // Actualizar el partido del usuario con sus eventos
      updatedCalendar[currentMatch.division][weekIdx] = updatedCalendar[currentMatch.division][weekIdx].map(m => 
        (m.loc.id === currentMatch.loc.id && m.vis.id === currentMatch.vis.id) ? { ...m, played: true, score, events } : m
      );

      // Simular el resto de partidos de la jornada para TODAS las divisiones
      [1, 2, 3].forEach(div => {
        updatedCalendar[div][weekIdx] = updatedCalendar[div][weekIdx].map(m => {
          if (m.played) return m;
          const locP = m.loc.squad.reduce((a, b) => a + b.h_anotacion, 0);
          const visP = m.vis.squad.reduce((a, b) => a + b.h_anotacion, 0);
          const s1 = Math.max(0, Math.floor(Math.random() * (locP / 10)));
          const s2 = Math.max(0, Math.floor(Math.random() * (visP / 10)));
          
          // Generar eventos aleatorios para IA
          const aiEvents: MatchEvent[] = [];
          if (s1 > 0) {
            for(let i=0; i<s1; i++) {
              const strikers = m.loc.squad.filter(p => p.pos !== 'POR');
              const scorer = strikers[Math.floor(Math.random() * strikers.length)];
              aiEvents.push({ m: 10 + Math.floor(Math.random()*75), type: 'goal', msg: `¡GOL de ${scorer.name} para ${m.loc.name}!` });
              scorer.goals += 1;
            }
          }
          if (s2 > 0) {
            for(let i=0; i<s2; i++) {
              const strikers = m.vis.squad.filter(p => p.pos !== 'POR');
              const scorer = strikers[Math.floor(Math.random() * strikers.length)];
              aiEvents.push({ m: 10 + Math.floor(Math.random()*75), type: 'goal', msg: `¡GOL de ${scorer.name} para ${m.vis.name}!` });
              scorer.goals += 1;
            }
          }
          // Añadir alguna amarilla/roja aleatoria
          if (Math.random() < 0.3) aiEvents.push({ m: 40, type: 'yellow', msg: "Tarjeta Amarilla por juego peligroso." });

          return { ...m, played: true, score: [s1, s2], events: aiEvents.sort((a,b) => a.m - b.m) };
        });
      });

      // Actualizar estadísticas de equipos
      let updatedTeams = prev.teams.map(t => {
        const teamMatches = updatedCalendar[t.division][weekIdx].filter(m => m.loc.id === t.id || m.vis.id === t.id);
        let newPts = t.pts;
        let newPj = t.pj;
        let newGf = t.gf;
        let newGc = t.gc;

        teamMatches.forEach(m => {
          newPj++;
          const isLoc = m.loc.id === t.id;
          const tScore = isLoc ? m.score[0] : m.score[1];
          const rScore = isLoc ? m.score[1] : m.score[0];
          newGf += tScore;
          newGc += rScore;
          if (tScore > rScore) newPts += 3;
          else if (tScore === rScore) newPts += 1;

          // Nota: Los goles ya se sumaron en la simulación de arriba
        });

        return { ...t, pts: newPts, pj: newPj, gf: newGf, gc: newGc };
      });

      let updatedFreeAgents = [...prev.freeAgents];
      const agreedNegs = prev.negotiations.filter(n => n.status === 'AGREED');
      agreedNegs.forEach(neg => {
        const player = [...updatedTeams.flatMap(t => t.squad), ...updatedFreeAgents].find(p => p.id === neg.playerId);
        const userT = updatedTeams.find(t => t.isUser)!;
        const sellerT = updatedTeams.find(t => t.name === neg.sellerTeamName);
        if (player && userT.budget >= (neg.amount + neg.playerBonus)) {
          userT.budget -= (neg.amount + neg.playerBonus);
          userT.squad.push({ ...player, team: userT.name, isTransferListed: false });
          if (sellerT) {
            sellerT.budget += neg.amount;
            sellerT.squad = sellerT.squad.filter(p => p.id !== player.id);
          } else {
            updatedFreeAgents = updatedFreeAgents.filter(p => p.id !== player.id);
          }
        }
      });

      return { 
        ...prev, 
        teams: updatedTeams, 
        freeAgents: updatedFreeAgents, 
        calendar: updatedCalendar, 
        week: prev.week + 1,
        negotiations: []
      };
    });
    setCurrentMatch(null);
    setView('LEAGUE');
  };

  const marketPlayers = useMemo(() => {
    if (!league) return [];
    const teamPlayers = league.teams.flatMap(t => t.squad.filter(p => p.isTransferListed));
    const freePool = league.freeAgents.map(p => ({ ...p, isTransferListed: true }));
    return [...teamPlayers, ...freePool];
  }, [league]);

  const selectedTeam = useMemo(() => league?.teams.find(t => t.id === selectedTeamId) || null, [league, selectedTeamId]);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-8 border-b border-zinc-800/50">
          <h1 className="text-3xl font-impact text-emerald-500 tracking-tighter">NIKKKO CF</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem icon="📋" label="Táctica" active={view === 'TACTICS'} onClick={() => { setView('TACTICS'); setSelectedTeamId(null); }} />
          <NavItem icon="🏆" label="Liga" active={view === 'LEAGUE'} onClick={() => { setView('LEAGUE'); setSelectedTeamId(null); }} />
          <NavItem icon="👕" label="Plantilla" active={view === 'SQUAD'} onClick={() => { setView('SQUAD'); setSelectedTeamId(null); }} />
          <NavItem icon="🤝" label="Negociaciones" active={view === 'NEGOTIATIONS'} onClick={() => { setView('NEGOTIATIONS'); setSelectedTeamId(null); }} />
          <NavItem icon="🛒" label="Mercado" active={view === 'MARKET'} onClick={() => { setView('MARKET'); setSelectedTeamId(null); }} />
        </nav>
        <div className="p-6 bg-zinc-950 border-t border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-zinc-600 font-bold uppercase">Presupuesto</span>
            <span className="text-emerald-400 font-mono font-bold">{userTeam?.budget.toLocaleString()}€</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col overflow-hidden">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/50 backdrop-blur-xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">{selectedTeam ? `Detalle: ${selectedTeam.name}` : view}</h2>
          {nextWeekMatch && !nextWeekMatch.played && (
            <button onClick={() => setCurrentMatch(nextWeekMatch)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded-xl font-black text-xs transition-all">JUGAR PARTIDO</button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {view === 'TACTICS' && userTeam && <TacticsBoard team={userTeam} onUpdate={t => setLeague(prev => prev ? ({...prev, teams: prev.teams.map(ot => ot.id === t.id ? t : ot)}) : null)} />}
          
          {view === 'LEAGUE' && league && (
            selectedTeam ? (
              <div className="space-y-6">
                <button onClick={() => setSelectedTeamId(null)} className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest mb-4">
                  ← Volver a Clasificación
                </button>
                <TeamDetail team={selectedTeam} onInspectPlayer={setInspectedPlayer} />
              </div>
            ) : (
              <Standings league={league} currentDiv={userTeam?.division || 3} onSelectTeam={setSelectedTeamId} onInspectMatch={setInspectedMatch} />
            )
          )}

          {view === 'MARKET' && league && <Market players={marketPlayers} budget={userTeam?.budget || 0} pendingAuctions={[]} onBuy={(id) => setActiveNegPlayer(marketPlayers.find(p => p.id === id) || null)} onInspectPlayer={setInspectedPlayer} />}
          {view === 'SQUAD' && userTeam && <SquadList players={userTeam.squad} onInspectPlayer={setInspectedPlayer} onToggleTransfer={(id) => setLeague(p => p ? ({...p, teams: p.teams.map(t => t.isUser ? {...t, squad: t.squad.map(pl => pl.id === id ? {...pl, isTransferListed: !pl.isTransferListed} : pl)} : t)}) : null)} />}
          
          {view === 'NEGOTIATIONS' && league && (
            <div className="space-y-6">
              <h3 className="text-2xl font-impact uppercase">Mesa de Negociaciones</h3>
              <div className="grid grid-cols-1 gap-4">
                {league.negotiations.map(neg => (
                  <div key={neg.id} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-1">{neg.status}</p>
                      <h4 className="text-xl font-bold">{neg.playerName}</h4>
                      <p className="text-xs text-zinc-500">Club: {neg.sellerTeamName} | Oferta: {neg.amount.toLocaleString()}€</p>
                    </div>
                    {neg.status === 'PLAYER_NEGOTIATING' && (
                       <button onClick={() => setActiveNegPlayer([...league.teams.flatMap(t => t.squad), ...league.freeAgents].find(p => p.id === neg.playerId) || null)} className="bg-emerald-600 px-6 py-2 rounded-xl font-bold text-xs">HABLAR CON JUGADOR</button>
                    )}
                    <div className="text-right max-w-xs">
                       <p className="text-[10px] italic text-zinc-400">"{neg.playerMessage || neg.clubMessage}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {currentMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <MatchSimulator match={currentMatch} onComplete={handleMatchComplete} />
          </div>
        )}

        {inspectedPlayer && <PlayerModal player={inspectedPlayer} onClose={() => setInspectedPlayer(null)} />}
        
        {inspectedMatch && <MatchDetailsModal match={inspectedMatch} onClose={() => setInspectedMatch(null)} />}

        {activeNegPlayer && (
          <NegotiationModal 
            player={activeNegPlayer} 
            negotiation={league?.negotiations.find(n => n.playerId === activeNegPlayer.id)}
            onOfferToClub={(amount) => { handleStartNegotiation(activeNegPlayer, amount); setActiveNegPlayer(null); }}
            onOfferToPlayer={(bonus, role) => { 
              const neg = league?.negotiations.find(n => n.playerId === activeNegPlayer.id);
              if (neg) handlePlayerOffer(neg.id, bonus, role);
              setActiveNegPlayer(null);
            }}
            onClose={() => setActiveNegPlayer(null)} 
          />
        )}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}>
    <span className="mr-3 text-lg opacity-80">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
