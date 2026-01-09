
import React, { useState } from 'react';
import { Player, Negotiation, PlayerRole } from '../types';

interface Props {
  player: Player;
  negotiation?: Negotiation;
  onOfferToClub: (amount: number) => void;
  onOfferToPlayer: (bonus: number, role: PlayerRole) => void;
  onClose: () => void;
}

const NegotiationModal: React.FC<Props> = ({ player, negotiation, onOfferToClub, onOfferToPlayer, onClose }) => {
  const [amount, setAmount] = useState(player.value);
  const [bonus, setBonus] = useState(Math.floor(player.value * 0.05));
  const [role, setRole] = useState<PlayerRole>('TITULAR');

  const isFreeAgent = player.team === 'Libre';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 animate-in fade-in duration-300">
      <div className="max-w-4xl w-full bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Perfil del Objetivo */}
        <div className="md:w-1/3 bg-zinc-950 p-10 border-r border-zinc-800">
           <div className="w-32 h-32 bg-zinc-900 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl border-4 border-emerald-500/20">👤</div>
           <h3 className="text-2xl font-impact uppercase text-center mb-2 tracking-tight">{player.name}</h3>
           <p className="text-center text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{player.pos} • {player.team}</p>
           
           <div className="space-y-4">
              <div className="bg-zinc-900 p-4 rounded-2xl">
                 <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Ambición</p>
                 <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${player.ambition}%` }}></div>
                    </div>
                    <span className="text-xs font-mono font-bold">{player.ambition}%</span>
                 </div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-2xl">
                 <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Valor de Mercado</p>
                 <p className="text-lg font-impact text-zinc-200">{player.value.toLocaleString()}€</p>
              </div>
           </div>
        </div>

        {/* Panel de Acción */}
        <div className="flex-1 p-12 space-y-8">
           <div className="flex justify-between items-center">
              <h2 className="text-3xl font-impact uppercase tracking-tighter">Despacho de Negociación</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
           </div>

           {!negotiation || negotiation.status === 'CLUB_REJECTED' ? (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                 <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest">Fase 1: Oferta al Club Propietario</h4>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Debes llegar a un acuerdo con el {player.team} antes de poder hablar con el jugador. Los clubes suelen pedir entre un 20% y un 50% extra por jugadores no transferibles.</p>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-zinc-600">Oferta de Traspaso (€)</label>
                       <div className="flex gap-4">
                          <input 
                            type="range" min={Math.floor(player.value * 0.8)} max={player.value * 2.5} step={50000}
                            value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                            className="flex-1 accent-emerald-500"
                          />
                          <span className="w-32 text-right font-mono font-bold text-emerald-400">{amount.toLocaleString()}€</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => onOfferToClub(amount)} className="w-full bg-emerald-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-colors">ENVIAR OFERTA AL CLUB</button>
              </div>
           ) : negotiation.status === 'PLAYER_NEGOTIATING' ? (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                 <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-widest">Fase 2: Contrato Personal</h4>
                    <p className="text-sm text-zinc-400 mb-6">El club ha aceptado tu oferta. Ahora convence a {player.name} para que se una a tu proyecto.</p>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-600">Prima de Fichaje</label>
                          <input 
                            type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 font-mono text-emerald-400 outline-none focus:border-emerald-500"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-600">Rol Prometido</label>
                          <select 
                            value={role} onChange={(e) => setRole(e.target.value as any)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 font-bold text-zinc-300 outline-none"
                          >
                             <option value="CLAVE">Jugador Clave</option>
                             <option value="TITULAR">Titular Habitual</option>
                             <option value="ROTACION">Rotación</option>
                             <option value="PROPESA">Joven Promesa</option>
                          </select>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => onOfferToPlayer(bonus, role)} className="w-full bg-blue-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-colors">OFRECER CONTRATO</button>
              </div>
           ) : (
              <div className="py-20 text-center space-y-4">
                 <p className="text-4xl">📝</p>
                 <h3 className="text-xl font-bold uppercase">{negotiation.status === 'AGREED' ? 'Traspaso Acordado' : 'Negociación Fallida'}</h3>
                 <p className="text-sm text-zinc-500 italic">"{negotiation.playerMessage}"</p>
                 <button onClick={onClose} className="bg-zinc-800 px-8 py-2 rounded-xl text-xs font-bold mt-4 hover:bg-zinc-700 transition-colors">VOLVER AL MERCADO</button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default NegotiationModal;
