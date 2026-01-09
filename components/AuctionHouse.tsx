
import React, { useState, useEffect } from 'react';
import { Player, AuctionState, Team, Bid } from '../types';
import { evaluateProjectSuitability, calculateTeamPrestige } from '../utils';

interface Props {
  auction: AuctionState;
  userBudget: number;
  onBid: (amount: number, isUser: boolean) => void;
  onFinish: (winnerTeamId: string | null, finalPrice: number, bid: Bid | null) => void;
}

const AuctionHouse: React.FC<Props> = ({ auction, userBudget, onBid, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [decisionPhase, setDecisionPhase] = useState(false);

  useEffect(() => {
    if (auction.status !== 'BIDDING' || decisionPhase) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleNextRound();
          return 10;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.status, auction.round, auction.currentBid, decisionPhase]);

  const handleNextRound = () => {
    // Lógica de pujas de la IA
    const bidders = auction.rivals.filter(r => r.budget > auction.currentBid * 1.1);
    
    if (bidders.length > 0 && Math.random() < 0.6) {
      const luckyRival = bidders[Math.floor(Math.random() * bidders.length)];
      const bidIncrease = Math.floor(auction.currentBid * (1.05 + Math.random() * 0.1));
      onBid(bidIncrease, false);
    } else {
      if (auction.round >= 3) {
        setDecisionPhase(true);
      } else {
        onBid(auction.currentBid, false); // Solo avanzar ronda
      }
    }
  };

  const getWinner = () => {
    // El jugador elige basándose en el proyecto más atractivo, no solo el dinero
    const allUniqueBidders = Array.from(new Set(auction.allBids.map(b => b.teamId)))
      .map(id => {
        const teamBids = auction.allBids.filter(b => b.teamId === id);
        return teamBids[teamBids.length - 1]; // Última puja de cada equipo
      });

    if (allUniqueBidders.length === 0) return null;

    const sortedBySuitability = allUniqueBidders.map(bid => ({
      bid,
      score: evaluateProjectSuitability(bid.amount, auction.player.value, bid.prestige, auction.player.ambition)
    })).sort((a, b) => b.score - a.score);

    return sortedBySuitability[0];
  };

  const winnerData = getWinner();

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white font-sans animate-in fade-in duration-500">
      <div className="bg-zinc-900 border-b border-zinc-800 p-8 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-4xl border border-emerald-500/20 shadow-inner">⚖️</div>
          <div>
            <h2 className="text-3xl font-impact tracking-tight text-zinc-100 uppercase">Guerra de Fichajes</h2>
            <p className="text-[10px] text-zinc-500 font-mono font-bold tracking-[0.2em] uppercase">Ronda {auction.round}/3 • {auction.player.name}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-zinc-950 px-6 py-3 rounded-2xl border border-zinc-800 flex flex-col items-center">
            <span className="text-[9px] text-zinc-600 uppercase font-black mb-1">Tu Presupuesto</span>
            <span className="text-xl font-mono font-bold text-emerald-400">{userBudget.toLocaleString()}€</span>
          </div>
          {!decisionPhase && (
            <div className={`px-8 py-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${timeLeft < 4 ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-zinc-950 border-zinc-800'}`}>
              <span className="text-[9px] text-zinc-600 uppercase font-black mb-1">Cierre Ronda</span>
              <span className="text-2xl font-impact tracking-widest">{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Info Jugador */}
        <div className="w-1/3 border-r border-zinc-800 p-8 flex flex-col items-center text-center bg-zinc-900/20">
          <div className="w-48 h-48 bg-zinc-800 rounded-full mb-6 flex items-center justify-center text-6xl border-8 border-zinc-900 shadow-2xl relative">
             <span className="absolute -top-2 -right-2 bg-emerald-500 text-zinc-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">TSI: {auction.player.tsi}</span>
             👤
          </div>
          <h3 className="text-2xl font-bold mb-2 tracking-tight">{auction.player.name}</h3>
          <p className="text-zinc-500 text-xs mb-8 uppercase font-bold tracking-widest">{auction.player.pos} • {auction.player.age} años • {auction.player.team}</p>
          
          <div className="w-full space-y-4">
             <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-inner">
                <div className="flex justify-between text-[10px] uppercase font-black mb-3 text-zinc-500 tracking-widest">
                   <span>Ambición del Jugador</span>
                   <span className="text-emerald-400">{auction.player.ambition}%</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${auction.player.ambition}%` }}></div>
                </div>
                <p className="text-[9px] text-zinc-600 mt-3 leading-relaxed">
                  Los jugadores ambiciosos priorizan equipos de mayor prestigio, incluso con ofertas menores.
                </p>
             </div>
          </div>
        </div>

        {/* Panel Pujas */}
        <div className="flex-1 p-8 flex flex-col gap-6">
          <div className="bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-800 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
             <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em] mb-4">Oferta Actual Líder</p>
             <p className="text-7xl font-impact tracking-tighter text-white mb-4 drop-shadow-2xl">{auction.currentBid.toLocaleString()}€</p>
             <p className={`text-[11px] font-black px-8 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg ${auction.highestBidderIsUser ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                {auction.highestBidderIsUser ? 'Tú lideras la puja' : `${auction.highestBidderName} lidera`}
             </p>
          </div>

          <div className="flex-1 bg-zinc-950 rounded-[2rem] border border-zinc-800 p-6 overflow-y-auto font-mono text-[10px] space-y-2 custom-scrollbar shadow-inner">
             {auction.logs.map((log, i) => (
               <div key={i} className={`p-3 rounded-xl border ${log.includes('puja') ? 'bg-zinc-900/50 border-zinc-800' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {log}
               </div>
             ))}
             {auction.logs.length === 0 && <div className="text-center py-20 opacity-20">Esperando ofertas iniciales...</div>}
          </div>

          {!decisionPhase && (
            <div className="grid grid-cols-3 gap-4">
               <button onClick={() => onBid(auction.currentBid + 25000, true)} disabled={userBudget < auction.currentBid + 25000} className="bg-zinc-800 hover:bg-zinc-700 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-zinc-700 transition-all active:scale-95 disabled:opacity-30">+25.000€</button>
               <button onClick={() => onBid(Math.floor(auction.currentBid * 1.05), true)} disabled={userBudget < auction.currentBid * 1.05} className="bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black text-white text-[10px] uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-30">PUJA RÁPIDA (+5%)</button>
               <button onClick={() => onBid(Math.floor(auction.currentBid * 1.15), true)} disabled={userBudget < auction.currentBid * 1.15} className="bg-zinc-800 hover:bg-zinc-700 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-zinc-700 transition-all active:scale-95 disabled:opacity-30">AGRESIVA (+15%)</button>
            </div>
          )}
        </div>

        {/* Competencia */}
        <div className="w-1/4 border-l border-zinc-800 p-8 flex flex-col gap-6 bg-zinc-900/20">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Interesados en {auction.player.name.split(' ')[0]}</h4>
          {auction.rivals.map(r => (
            <div key={r.id} className={`flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border transition-all ${auction.highestBidderId === r.id ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800'}`}>
               <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-lg">🏟️</div>
               <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate">{r.name}</p>
                  <p className="text-[9px] text-zinc-600 font-mono uppercase">Prestigio: {calculateTeamPrestige(r)}</p>
               </div>
               {auction.highestBidderId === r.id && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>}
            </div>
          ))}
        </div>
      </div>

      {decisionPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in zoom-in duration-500">
           <div className="max-w-lg w-full bg-zinc-900 rounded-[3rem] border border-zinc-800 p-12 text-center shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="text-6xl mb-8">🤔</div>
              <h3 className="text-3xl font-impact text-zinc-100 uppercase mb-4 tracking-tighter">La Elección del Jugador</h3>
              <p className="text-zinc-400 text-sm mb-10 leading-relaxed px-6">
                La subasta ha concluido. <strong>{auction.player.name}</strong> está analizando las propuestas basándose en el sueldo (oferta) y la calidad del proyecto deportivo.
              </p>
              
              {winnerData && (
                <div className="bg-zinc-950 p-8 rounded-[2rem] border border-emerald-500/20 mb-10 text-left">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">Análisis de los Representantes</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-zinc-300">Equipo Elegido:</span>
                    <span className="text-emerald-400 font-black uppercase tracking-tighter">{winnerData.bid.teamName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-300">Motivo:</span>
                    <span className="text-xs text-zinc-400">Mejor balance proyecto/sueldo</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => onFinish(winnerData?.bid.teamId === 'USER' ? 'USER' : winnerData?.bid.teamId || null, auction.currentBid, winnerData?.bid || null)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
              >
                CONFIRMAR TRANSFERENCIA
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AuctionHouse;
