import React from 'react';

interface FinancialReport {
  ticketIncome: number;
  sponsorIncome: number;
  salaries: number;
  maintenance: number;
  attendance: number;
  capacity: number;
  isHome: boolean;
  total: number;
}

interface Props {
  report: FinancialReport;
  onClose: () => void;
}

const FinancialModal: React.FC<Props> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4">💰</div>
           <h2 className="text-2xl font-impact uppercase text-white tracking-tight">Cierre de Caja</h2>
           <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Resumen Semanal</p>
        </div>

        <div className="space-y-3 mb-8">
           <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 font-black uppercase">Ingresos (Tickets + Sponsor)</span>
              <span className="text-emerald-400 font-mono font-bold">+{ ((report.ticketIncome || 0) + (report.sponsorIncome || 0)).toLocaleString() }€</span>
           </div>
           
           <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center border-red-900/20">
              <span className="text-[10px] text-zinc-600 font-black uppercase">Sueldos Plantilla</span>
              <span className="text-red-500 font-mono font-bold">-{(report.salaries || 0).toLocaleString()}€</span>
           </div>

           <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center border-red-900/20">
              <span className="text-[10px] text-zinc-600 font-black uppercase">Mantenimiento Club</span>
              <span className="text-red-500 font-mono font-bold">-{(report.maintenance || 0).toLocaleString()}€</span>
           </div>

           <div className="h-px bg-zinc-800 my-2"></div>

           <div className="flex justify-between items-center px-2">
              <p className="text-sm font-black uppercase text-zinc-300">Balance Semanal</p>
              <p className={`text-2xl font-impact tracking-tight ${(report.total || 0) >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                {(report.total || 0) >= 0 ? '+' : ''}{(report.total || 0).toLocaleString()}€
              </p>
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-white text-zinc-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          ACEPTAR BALANCE
        </button>
      </div>
    </div>
  );
};

export default FinancialModal;