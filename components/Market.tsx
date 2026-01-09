
import React, { useState } from 'react';
import { Player, Position, Negotiation } from '../types';
import { POSITION_COLORS } from '../constants';

interface Props {
  players: Player[];
  budget: number;
  pendingAuctions: string[];
  negotiations: Negotiation[];
  onBuy: (playerId: string) => void;
  onInspectPlayer?: (player: Player) => void;
}

const Market: React.FC<Props> = ({ players, budget, pendingAuctions, negotiations, onBuy, onInspectPlayer }) => {
  const [filterPos, setFilterPos] = useState<Position | 'ALL'>('ALL');

  const filteredPlayers = players.filter(p => filterPos === 'ALL' || p.pos === filterPos);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 border-dashed">
         <div className="flex gap-6 items-center">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-amber-500/10">⚖️</div>
            <div>
               <h3 className="text-xl font-impact uppercase tracking-tighter text-zinc-100">Mercado de Fichajes</h3>
               <p className="text-xs text-zinc-500 font-medium">Negocia directamente con clubes y agentes libres.</p>
            </div>
         </div>
         <div className="flex gap-2">
            {(['ALL', 'POR', 'DEF', 'MED', 'DEL'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilterPos(p)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterPos === p ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-lg shadow-emerald-900/20' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white'}`}
              >
                {p === 'ALL' ? 'Todos' : p}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full py-24 text-center text-zinc-600 border border-zinc-800 border-dashed rounded-[3rem] font-black uppercase tracking-[0.2em]">
            No hay jugadores disponibles en el mercado.
          </div>
        ) : (
          filteredPlayers.map(p => {
            const colors = POSITION_COLORS[p.pos];
            const isUserPlayer = p.team === 'Nikkko CF';
            const isFreeAgent = p.team === 'Libre';
            const activeNeg = negotiations.find(n => n.playerId === p.id);

            return (
              <div key={p.id} className={`bg-zinc-900 border rounded-[2.5rem] p-7 hover:border-emerald-500/50 transition-all flex flex-col group relative overflow-hidden ${isUserPlayer ? 'border-amber-500/30' : activeNeg ? 'border-blue-500/50 ring-4 ring-blue-500/10' : 'border-zinc-800'}`}>
                {isUserPlayer && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-zinc-950 text-[8px] font-black uppercase px-5 py-1.5 rotate-45 translate-x-4 translate-y-3 shadow-lg">Tu Jugador</div>
                )}
                {isFreeAgent && (
                  <div className="absolute top-0 right-0 bg-cyan-500 text-zinc-950 text-[8px] font-black uppercase px-5 py-1.5 rotate-45 translate-x-4 translate-y-3 shadow-lg">Libre</div>
                )}
                
                <div className="flex justify-between items-start mb-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${colors.light} border border-current opacity-70`}>{p.pos}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-0.5">Vendedor</span>
                    <span className={`text-[11px] font-bold uppercase tracking-tight ${isFreeAgent ? 'text-cyan-400' : isUserPlayer ? 'text-amber-400' : 'text-zinc-300'}`}>{p.team}</span>
                  </div>
                </div>
                
                <button onClick={() => onInspectPlayer?.(p)} className="text-left mb-2">
                  <h3 className="text-xl font-impact uppercase tracking-tight group-hover:text-emerald-400 transition-colors leading-none">{p.name}</h3>
                </button>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-zinc-500 text-[10px] font-bold">EDAD: {p.age}</span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-zinc-200 text-sm font-impact tracking-widest">TSI: {p.tsi.toLocaleString()}</span>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800 shadow-inner">
                    <span className="text-zinc-600 text-[9px] uppercase font-black tracking-widest">Valor</span>
                    <span className="text-emerald-400 font-impact text-lg">{p.value.toLocaleString()}€</span>
                  </div>
                  
                  {isUserPlayer ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-center">
                       <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">En venta</p>
                    </div>
                  ) : activeNeg ? (
                     <button 
                      onClick={() => onBuy(p.id)}
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20`}
                    >
                      VER NEGOCIACIÓN
                    </button>
                  ) : (
                    <button 
                      onClick={() => onBuy(p.id)}
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${budget >= p.value ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'}`}
                    >
                      {budget >= p.value ? 'OFERTAR AL CLUB' : 'SALDO INSUFICIENTE'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Market;
