
import React from 'react';
import { SeasonRecord } from '../types';

interface Props {
  history: SeasonRecord[];
}

const HistoryView: React.FC<Props> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-500 border border-zinc-800 border-dashed rounded-3xl">
        Aún no hay historia escrita. ¡Finaliza tu primera temporada para inaugurar el palmarés!
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {history.map((record) => (
        <div key={record.seasonNumber} className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <span className="text-6xl font-impact text-zinc-800 select-none">#{record.seasonNumber}</span>
          </div>

          <h3 className="text-2xl font-impact text-yellow-500 mb-8 border-b border-zinc-800 pb-4">
            TEMPORADA {record.seasonNumber}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(div => (
              <div key={div} className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">DIV {div}</div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 hover:border-yellow-500/30 transition-all">
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Campeón</p>
                   <p className="text-xl font-bold text-zinc-100 flex items-center">
                     <span className="mr-2">🏆</span> {record.champions[div]}
                   </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 hover:border-blue-500/30 transition-all">
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Pichichi (Goleador)</p>
                   <div className="flex items-start justify-between">
                     <div>
                       <p className="text-sm font-bold text-zinc-100">{record.pichichis[div].name}</p>
                       <p className="text-[10px] text-zinc-500">{record.pichichis[div].team}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-lg font-mono font-bold text-blue-400">{record.pichichis[div].goals}</p>
                       <p className="text-[8px] text-zinc-600 uppercase">Goles</p>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryView;
