
import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, LeagueState, Team, Player, Match, Negotiation, MatchEvent, SeasonRecord, Offer, Scout } from './types';
import { createTeam, generateCalendar, generatePlayer, calculateTeamPrestige, calculateTSI } from './utils';

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
import HistoryView from './components/HistoryView';
import OffersPanel from './components/OffersPanel';
import FinancesView from './components/FinancesView';
import FinancialModal from './components/FinancialModal';

const RIVAL_NAMES = [
  ["Thunder Shogun", 1], ["Crimson Valkyries", 1], ["Iron Citadel", 1], ["Zenith FC", 1], 
  ["Apex Predators", 1], ["Neon Tokyo", 1], ["Cyber Dragons", 1], ["Royal Vanguard", 1],
  ["Celtic Wraiths", 2], ["Golden Griffins", 2], ["Midnight Galaxy", 2], ["Shadow Ninjas", 2], 
  ["Arctic Wolves", 2], ["Desert Phantoms", 2], ["Void Walkers", 2], ["Solar Empire", 2],
  ["Emerald Guardians", 3], ["Neon Knights", 3], ["Solar Flares", 3], ["Magma Giants", 3], 
  ["Oceanic Blue", 3], ["Titanium FC", 3], ["Obsidian United", 3]
];

const SCOUT_NAMES = ["Monchi", "Zubi", "Overmars", "Campos", "Edwards", "Rangnick", "Mislintat", "Berta"];
const SCOUT_SPECIALTIES: Scout['specialty'][] = ['JÓVENES', 'TÁCTICO', 'ESTRELLAS'];
const SCOUT_AVATARS = ["👴", "🤵", "🥸", "🧢", "🕶️", "💼"];

const SAVE_KEY = 'mb_manager_save_v1';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('TACTICS');
  const [league, setLeague] = useState<LeagueState | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const [activeNegPlayer, setActiveNegPlayer] = useState<Player | null>(null);
  const [inspectedMatch, setInspectedMatch] = useState<Match | null>(null);
  const [financialReport, setFinancialReport] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'LOADING' | 'LOAD_FAIL'>('IDLE');

  useEffect(() => {
    handleManualLoad(true);
  }, []);

  const generateScoutMarket = (): Scout[] => {
    return Array.from({ length: 6 }, () => {
      const level = Math.floor(Math.random() * 5) + 1;
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: SCOUT_NAMES[Math.floor(Math.random() * SCOUT_NAMES.length)],
        level,
        specialty: SCOUT_SPECIALTIES[Math.floor(Math.random() * SCOUT_SPECIALTIES.length)],
        weeklySalary: level * 15000,
        hireCost: level * 100000,
        avatar: SCOUT_AVATARS[Math.floor(Math.random() * SCOUT_AVATARS.length)]
      };
    });
  };

  const handleManualSave = () => {
    if (league) {
      setSaveStatus('SAVING');
      localStorage.setItem(SAVE_KEY, JSON.stringify(league));
      setTimeout(() => {
        setSaveStatus('SUCCESS');
        setTimeout(() => setSaveStatus('IDLE'), 2000);
      }, 500);
    }
  };

  const handleManualLoad = (silent: boolean = false) => {
    const savedGame = localStorage.getItem(SAVE_KEY);
    if (savedGame) {
      try {
        if (!silent) setSaveStatus('LOADING');
        const parsedState = JSON.parse(savedGame);
        setLeague(parsedState);
        if (!silent) {
           setTimeout(() => {
             setSaveStatus('SUCCESS');
             setTimeout(() => setSaveStatus('IDLE'), 2000);
           }, 500);
        }
      } catch (e) {
        console.error("Error loading save file", e);
        if (!silent) setSaveStatus('LOAD_FAIL');
        if (silent) initializeNewGame();
      }
    } else {
      if (silent) initializeNewGame();
      else setSaveStatus('LOAD_FAIL');
    }
  };

  const handleNewGameRequest = () => {
    if (window.confirm("¿Estás seguro de que quieres empezar una nueva partida? Se perderá todo el progreso actual si no has guardado.")) {
      initializeNewGame();
    }
  };

  const initializeNewGame = () => {
    const userTeam = createTeam("Nikkko CF", 3, true);
    const rivals = RIVAL_NAMES.map(([n, d]) => {
      const team = createTeam(n as string, d as number);
      team.squad.forEach(p => {
        if (Math.random() < 0.20) p.isTransferListed = true;
      });
      return team;
    });
    const allTeams = [userTeam, ...rivals];
    const calendar = generateCalendar(allTeams);
    const freeAgents = Array.from({ length: 30 }, () => generatePlayer(Math.floor(Math.random() * 3) + 1, true, "Libre"));
    
    setLeague({ 
      week: 1, 
      seasonCount: 1, 
      teams: allTeams, 
      freeAgents,
      calendar, 
      negotiations: [],
      pendingAuctions: [],
      history: [],
      offers: [],
      scoutMarket: generateScoutMarket()
    });
    setView('TACTICS');
  };

  const userTeam = useMemo(() => league?.teams.find(t => t.isUser) || null, [league]);

  const activeScout = useMemo(() => {
    if (!league || !userTeam?.activeScoutId) return null;
    return league.scoutMarket.find(s => s.id === userTeam.activeScoutId) || null;
  }, [league, userTeam]);

  const marketPlayers = useMemo(() => {
    if (!league) return [];
    const clubListed = league.teams
      .filter(t => !t.isUser)
      .flatMap(t => t.squad.filter(p => p.isTransferListed));
    return [...league.freeAgents, ...clubListed];
  }, [league]);

  const handleHireScout = (scoutId: string) => {
    setLeague(prev => {
      if (!prev || !userTeam) return prev;
      const scout = prev.scoutMarket.find(s => s.id === scoutId);
      if (!scout || userTeam.budget < scout.hireCost) return prev;
      return {
        ...prev,
        teams: prev.teams.map(t => t.isUser ? { ...t, budget: t.budget - scout.hireCost, activeScoutId: scoutId } : t)
      };
    });
  };

  const handleFireScout = () => {
    setLeague(prev => {
      if (!prev || !userTeam) return prev;
      return {
        ...prev,
        teams: prev.teams.map(t => t.isUser ? { ...t, activeScoutId: undefined } : t)
      };
    });
  };

  const handleUpdateScout = (updatedScout: Scout) => {
    setLeague(prev => {
      if (!prev) return null;
      return {
        ...prev,
        scoutMarket: prev.scoutMarket.map(s => s.id === updatedScout.id ? updatedScout : s)
      };
    });
  };

  const handleSignScoutedPlayer = (playerData: any) => {
    if (!league || !userTeam) return;

    const newPlayer: Player = {
      id: "sc-" + Math.random().toString(36).substr(2, 9),
      name: playerData.name,
      pos: playerData.pos as any,
      age: playerData.age,
      goals: 0,
      team: "Libre",
      h_porteria: playerData.pos === 'POR' ? 12 : 2,
      h_defensa: playerData.pos === 'DEF' ? 12 : 4,
      h_jugadas: playerData.pos === 'MED' ? 12 : 4,
      h_anotacion: playerData.pos === 'DEL' ? 12 : 2,
      tsi: 0,
      value: playerData.estimatedValue || 1000000,
      currentRole: null,
      isTransferListed: true,
      preferredRoles: [playerData.pos],
      ambition: 70,
      potential: 95,
      trainingFocus: 'NONE',
      trainingIntensity: 'MED',
      fatigue: 0,
      injuryWeeks: 0,
      personality: 'PROFESIONAL',
      happiness: 90,
      moralStatus: 'Excelente'
    };
    newPlayer.tsi = calculateTSI(newPlayer);
    
    setLeague(prev => prev ? ({ ...prev, freeAgents: [newPlayer, ...prev.freeAgents] }) : null);
    setActiveNegPlayer(newPlayer);
  };

  const handleStartNegotiation = (player: Player, amount: number) => {
    if (!league || !userTeam) return;
    const newNeg: Negotiation = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: player.id,
      playerName: player.name,
      sellerTeamName: player.team,
      amount: amount,
      status: 'PLAYER_NEGOTIATING',
      playerBonus: 0,
      promisedRole: 'TITULAR',
      clubMessage: "Acuerdo alcanzado por el traspaso.",
      playerMessage: "Estoy listo para negociar mis condiciones."
    };
    setLeague(prev => prev ? ({ ...prev, negotiations: [newNeg, ...prev.negotiations] }) : null);
    setView('NEGOTIATIONS'); 
  };

  const handlePlayerOffer = (negId: string, bonus: number, role: any) => {
    setLeague(prev => {
      if (!prev || !userTeam) return null;
      return {
        ...prev,
        negotiations: prev.negotiations.map(n => {
          if (n.id !== negId) return n;
          return { ...n, status: 'AGREED', playerBonus: bonus, promisedRole: role, playerMessage: "¡Contrato aceptado! Un placer unirme al club." };
        })
      };
    });
  };

  const handleAcceptOffer = (offer: Offer) => {
    setLeague(prev => {
      if (!prev) return null;
      const userT = prev.teams.find(t => t.isUser);
      const buyerT = prev.teams.find(t => t.id === offer.fromTeamId);
      const player = userT?.squad.find(p => p.id === offer.playerId);
      if (!userT || !buyerT || !player) return prev;

      const newUserTeam = {
        ...userT,
        budget: userT.budget + offer.amount,
        squad: userT.squad.filter(p => p.id !== offer.playerId)
      };

      const newLineup = { ...newUserTeam.lineup };
      Object.keys(newLineup).forEach(role => {
        if (newLineup[role] === offer.playerId) newLineup[role] = null;
      });
      newUserTeam.lineup = newLineup;

      const newPlayer = { ...player, team: buyerT.name, isTransferListed: false };
      const newBuyerTeam = {
        ...buyerT,
        budget: buyerT.budget - offer.amount,
        squad: [...buyerT.squad, newPlayer]
      };

      return {
        ...prev,
        teams: prev.teams.map(t => t.id === userT.id ? newUserTeam : t.id === buyerT.id ? newBuyerTeam : t),
        offers: prev.offers.filter(o => o.id !== offer.id)
      };
    });
  };

  const handleRejectOffer = (offerId: string) => {
    setLeague(prev => {
      if (!prev) return null;
      return {
        ...prev,
        offers: prev.offers.filter(o => o.id !== offerId)
      };
    });
  };

  const handleMatchComplete = (score: [number, number], events: MatchEvent[]) => {
    if (!league || !currentMatch || !userTeam) return;
    
    // 1. Calcular finanzas del usuario
    const userSalaries = userTeam.squad.reduce((sum, p) => sum + Math.floor(p.value * 0.005), 0);
    const scoutSalary = activeScout ? activeScout.weeklySalary : 0;
    const isHome = currentMatch.loc.id === userTeam.id;
    const attendance = isHome ? Math.floor(userTeam.capacity * 0.8) : 0;
    const sponsorIncome = (4 - userTeam.division) * 150000;
    const maintenance = 50000;
    const ticketIncome = attendance * 20;
    const userIncome = ticketIncome + sponsorIncome - userSalaries - maintenance - scoutSalary;

    setFinancialReport({ 
      total: userIncome, 
      salaries: userSalaries, 
      ticketIncome: ticketIncome,
      sponsorIncome: sponsorIncome,
      maintenance: maintenance,
      attendance: attendance,
      capacity: userTeam.capacity,
      isHome: isHome
    });

    setLeague(prev => {
      if (!prev) return null;
      
      const currentWeek = prev.week;
      const newCalendar = { ...prev.calendar };
      const teamStats: Record<string, { pts: number, gf: number, gc: number, pj: number }> = {};

      // Inicializar cambios para todos los equipos
      prev.teams.forEach(t => {
        teamStats[t.id] = { pts: 0, gf: 0, gc: 0, pj: 0 };
      });

      // Simular TODOS los partidos de la semana en TODAS las divisiones
      [1, 2, 3].forEach(div => {
        newCalendar[div][currentWeek - 1] = newCalendar[div][currentWeek - 1].map(m => {
          let mScore: [number, number] = [0, 0];
          let mEvents: MatchEvent[] = [];

          // Si es el partido del usuario, usar el resultado real
          if (m.loc.id === currentMatch.loc.id && m.vis.id === currentMatch.vis.id) {
            mScore = score;
            mEvents = events;
          } else {
            // Simulación aleatoria para la IA
            const locStr = m.loc.squad.reduce((s, p) => s + p.tsi, 0);
            const visStr = m.vis.squad.reduce((s, p) => s + p.tsi, 0);
            const locGoals = Math.max(0, Math.floor(Math.random() * 4) + (locStr > visStr ? 1 : 0));
            const visGoals = Math.max(0, Math.floor(Math.random() * 4) + (visStr > locStr ? 1 : 0));
            mScore = [locGoals, visGoals];
            mEvents = [{ m: 90, msg: "Partido finalizado por la IA.", type: "chance" }];
          }

          // Registrar estadísticas para la tabla
          teamStats[m.loc.id].pj += 1;
          teamStats[m.loc.id].gf += mScore[0];
          teamStats[m.loc.id].gc += mScore[1];
          
          teamStats[m.vis.id].pj += 1;
          teamStats[m.vis.id].gf += mScore[1];
          teamStats[m.vis.id].gc += mScore[0];

          if (mScore[0] > mScore[1]) teamStats[m.loc.id].pts += 3;
          else if (mScore[1] > mScore[0]) teamStats[m.vis.id].pts += 3;
          else {
            teamStats[m.loc.id].pts += 1;
            teamStats[m.vis.id].pts += 1;
          }

          return { ...m, played: true, score: mScore, events: mEvents };
        });
      });

      // Aplicar estadísticas y finanzas a los equipos
      const updatedTeams = prev.teams.map(t => {
        const stats = teamStats[t.id];
        return {
          ...t,
          budget: t.budget + (t.isUser ? userIncome : 100000),
          pts: t.pts + stats.pts,
          pj: t.pj + stats.pj,
          gf: t.gf + stats.gf,
          gc: t.gc + stats.gc
        };
      });

      // Procesar fichajes acordados
      const agreedNegs = prev.negotiations.filter(n => n.status === 'AGREED');
      const finalUserTeam = updatedTeams.find(t => t.isUser)!;
      let finalFreeAgents = [...prev.freeAgents];

      agreedNegs.forEach(neg => {
        const player = prev.teams.flatMap(t => t.squad).find(p => p.id === neg.playerId) || prev.freeAgents.find(p => p.id === neg.playerId);
        if (player && finalUserTeam.budget >= (neg.amount + neg.playerBonus)) {
          finalUserTeam.budget -= (neg.amount + neg.playerBonus);
          finalUserTeam.squad.push({ ...player, team: finalUserTeam.name, isTransferListed: false });
          finalFreeAgents = finalFreeAgents.filter(p => p.id !== player.id);
          updatedTeams.forEach(t => t.squad = t.squad.filter(p => p.id !== player.id));
        }
      });

      return { 
        ...prev, 
        teams: updatedTeams, 
        freeAgents: finalFreeAgents, 
        week: currentWeek + 1, 
        calendar: newCalendar,
        negotiations: [] 
      };
    });
  };

  const closeFinancialReport = () => {
    setFinancialReport(null);
    setCurrentMatch(null);
    setView('LEAGUE');
  };

  const handleSelectTeam = (id: string) => {
    setSelectedTeamId(id);
    setView('TEAM_DETAIL');
  };

  const nextWeekMatch = useMemo(() => {
    if (!league || !userTeam) return null;
    return league.calendar[userTeam.division][league.week - 1]?.find(m => m.loc.id === userTeam.id || m.vis.id === userTeam.id) || null;
  }, [league, userTeam]);

  const selectedTeam = useMemo(() => {
    if (!league || !selectedTeamId) return null;
    return league.teams.find(t => t.id === selectedTeamId) || null;
  }, [league, selectedTeamId]);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-8 border-b border-zinc-800/50">
          <h1 className="text-3xl font-impact text-emerald-500 tracking-tighter">NIKKKO CF</h1>
          {league && <p className="text-[10px] uppercase font-bold text-zinc-500 mt-2 tracking-widest">T.{league.seasonCount} • SEMANA {league.week}</p>}
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem icon="📋" label="Táctica" active={view === 'TACTICS'} onClick={() => setView('TACTICS')} />
          <NavItem icon="🏆" label="Liga" active={view === 'LEAGUE' || view === 'TEAM_DETAIL'} onClick={() => setView('LEAGUE')} />
          <NavItem icon="👕" label="Plantilla" active={view === 'SQUAD'} onClick={() => setView('SQUAD')} />
          <NavItem icon="🤝" label="Negociaciones" active={view === 'NEGOTIATIONS'} onClick={() => setView('NEGOTIATIONS')} />
          <NavItem icon="🛒" label="Mercado" active={view === 'MARKET'} onClick={() => setView('MARKET')} />
          <NavItem icon="📡" label="Ojeador IA" active={view === 'SCOUT'} onClick={() => setView('SCOUT')} />
          <NavItem icon="🏦" label="Finanzas" active={view === 'FINANCES'} onClick={() => setView('FINANCES')} />
        </nav>

        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 space-y-2">
           <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest text-center mb-2">Gestión de Datos</p>
           
           <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleManualSave} 
                disabled={saveStatus === 'SAVING' || saveStatus === 'LOADING'}
                className="py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-emerald-500/50 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <span>💾</span>
                {saveStatus === 'SAVING' ? '...' : 'GUARDAR'}
              </button>

              <button 
                onClick={() => handleManualLoad()} 
                disabled={saveStatus === 'SAVING' || saveStatus === 'LOADING'}
                className="py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-blue-500/50 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <span>📂</span>
                {saveStatus === 'LOADING' ? '...' : 'CARGAR'}
              </button>
           </div>

           <button 
              onClick={handleNewGameRequest}
              className="w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest bg-zinc-900 text-zinc-600 border border-zinc-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all mt-1"
           >
              🗑️ NUEVA PARTIDA
           </button>

           {saveStatus === 'SUCCESS' && (
             <p className="text-[8px] text-emerald-500 font-bold uppercase text-center animate-pulse">Operación completada</p>
           )}
           {saveStatus === 'LOAD_FAIL' && (
             <p className="text-[8px] text-red-500 font-bold uppercase text-center">No hay guardado previo</p>
           )}
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col overflow-hidden">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/50 backdrop-blur-xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">{view}</h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[8px] text-zinc-600 font-black uppercase">Presupuesto</span>
               <span className="text-sm font-mono font-bold text-emerald-400">
                  {userTeam?.budget.toLocaleString()}€
               </span>
            </div>
            {nextWeekMatch && (
              <button onClick={() => setCurrentMatch(nextWeekMatch)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded-xl font-black text-xs transition-all shadow-lg shadow-emerald-900/20 active:scale-95">JUGAR PARTIDO</button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {view === 'TACTICS' && userTeam && <TacticsBoard team={userTeam} onUpdate={t => setLeague(prev => prev ? ({...prev, teams: prev.teams.map(ot => ot.id === t.id ? t : ot)}) : null)} />}
          {view === 'LEAGUE' && league && <Standings league={league} currentDiv={userTeam?.division || 3} onSelectTeam={handleSelectTeam} onInspectMatch={setInspectedMatch} />}
          {view === 'TEAM_DETAIL' && selectedTeam && (
            <div className="animate-in fade-in duration-300">
               <button onClick={() => setView('LEAGUE')} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-100 transition-colors">
                  <span>←</span> VOLVER A LA CLASIFICACIÓN
               </button>
               <TeamDetail team={selectedTeam} onInspectPlayer={setInspectedPlayer} />
            </div>
          )}
          {view === 'SQUAD' && userTeam && <SquadList players={userTeam.squad} onInspectPlayer={setInspectedPlayer} isUser onToggleTransfer={(id) => setLeague(prev => {
             if(!prev) return null;
             return { ...prev, teams: prev.teams.map(t => t.isUser ? { ...t, squad: t.squad.map(p => p.id === id ? { ...p, isTransferListed: !p.isTransferListed } : p) } : t) }
          })} />}
          {view === 'MARKET' && league && <Market players={marketPlayers} budget={userTeam?.budget || 0} pendingAuctions={[]} negotiations={league.negotiations} onBuy={(pid) => {
             const p = marketPlayers.find(pl => pl.id === pid);
             if(p) setActiveNegPlayer(p);
          }} onInspectPlayer={setInspectedPlayer} />}
          {view === 'SCOUT' && league && <ScoutView scout={activeScout} market={league.scoutMarket} budget={userTeam?.budget || 0} teamName={userTeam?.name || 'Nikkko CF'} division={userTeam?.division || 3} onHire={handleHireScout} onFire={handleFireScout} onUpdateScout={handleUpdateScout} onStartNegotiation={handleSignScoutedPlayer} />}
          {view === 'NEGOTIATIONS' && league && (
            <div className="space-y-12">
              <OffersPanel offers={league.offers} onAccept={handleAcceptOffer} onReject={handleRejectOffer} />
              <div className="grid grid-cols-1 gap-4">
                {league.negotiations.map(neg => (
                  <div key={neg.id} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex justify-between items-center hover:border-zinc-700 transition-all">
                    <div>
                      <p className={`font-black uppercase text-[10px] tracking-widest mb-1 ${neg.status === 'AGREED' ? 'text-emerald-500' : 'text-blue-500'}`}>{neg.status}</p>
                      <h4 className="text-xl font-bold">{neg.playerName}</h4>
                      <p className="text-xs text-zinc-500">Oferta: {(neg.amount || 0).toLocaleString()}€</p>
                    </div>
                    {neg.status === 'PLAYER_NEGOTIATING' && <button onClick={() => {
                        const p = marketPlayers.find(pl => pl.id === neg.playerId);
                        if(p) setActiveNegPlayer(p);
                    }} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-xs font-bold transition-all active:scale-95">DETALLES</button>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {view === 'FINANCES' && userTeam && <FinancesView team={userTeam} />}
        </div>

        {currentMatch && !financialReport && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"><MatchSimulator match={currentMatch} onComplete={handleMatchComplete} /></div>}
        {financialReport && <FinancialModal report={financialReport} onClose={closeFinancialReport} />}
        {inspectedPlayer && (
          <PlayerModal 
            player={inspectedPlayer} 
            isUserPlayer={inspectedPlayer.team === userTeam?.name}
            isAlreadyNegotiating={!!league?.negotiations.find(n => n.playerId === inspectedPlayer.id)}
            onOffer={(p) => {
              setActiveNegPlayer(p);
              setInspectedPlayer(null);
            }}
            onClose={() => setInspectedPlayer(null)} 
          />
        )}
        {activeNegPlayer && <NegotiationModal player={activeNegPlayer} negotiation={league?.negotiations.find(n => n.playerId === activeNegPlayer.id)} onOfferToClub={(amount) => handleStartNegotiation(activeNegPlayer, amount)} onOfferToPlayer={(bonus, role) => { const neg = league?.negotiations.find(n => n.playerId === activeNegPlayer.id); if (neg) handlePlayerOffer(neg.id, bonus, role); setActiveNegPlayer(null); }} onClose={() => setActiveNegPlayer(null)} />}
        {inspectedMatch && <MatchDetailsModal match={inspectedMatch} onClose={() => setInspectedMatch(null)} />}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}>
    <span className="mr-3 text-lg">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
