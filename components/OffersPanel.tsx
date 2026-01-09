
import React from 'react';
import { Offer } from '../types';

interface Props {
  offers: Offer[];
  onAccept: (offer: Offer) => void;
  onReject: (id: string) => void;
}

const OffersPanel: React.FC<Props> = ({ offers, onAccept, onReject }) => {
  return (
    <div className="space-y-6">
      {offers.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 border border-zinc-800 border-dashed rounded-3xl">
           No hay ofertas pendientes por tus jugadores.
           <p className="text-xs mt-2">Pon jugadores como 'Transferibles' en Plantilla para recibir ofertas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map(o => (
            <div key={o.id} className={`bg-zinc-900 border rounded-2xl p-6 transition-all ${!o.playerAccepts ? 'border-red-500/30' : 'border-zinc-800 hover:border-emerald-500/50'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold">{o.playerName}</h4>
                  <p className="text-xs text-zinc-500">Interés de: <span className="text-zinc-300 font-bold">{o.fromTeamName}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono text-emerald-400">{o.amount.toLocaleString()}€</p>
                </div>
              </div>

              {!o.playerAccepts ? (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg mb-4">
                   <p className="text-[10px] text-red-400 font-bold uppercase mb-1">El jugador rechaza el traspaso</p>
                   <p className="text-xs text-red-200">{o.refusalReason}</p>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg mb-4 text-xs text-emerald-200">
                  El jugador está dispuesto a negociar y acepta el destino.
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  disabled={!o.playerAccepts}
                  onClick={() => onAccept(o)}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${o.playerAccepts ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                >
                  ACEPTAR OFERTA
                </button>
                <button 
                  onClick={() => onReject(o.id)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg font-bold text-xs border border-zinc-700"
                >
                  RECHAZAR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPanel;
