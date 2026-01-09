import React from 'react';
import ClubCrest from './ClubCrest'; // Assuming you might want to use crests, otherwise standard icons work

interface FinancialReport {
  ticketIncome: number;
  sponsorIncome: number;
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="text-center mb-8 relative z-10">
           <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-900/50 mb-4">
             💸
           </div>
           <h2 className="text-2xl font-impact uppercase text-white tracking-tight">Informe Financiero</h2>
           <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Resumen de la Jornada</p>
        </div>

        <div className="space-y-4 mb-8 relative z-10">
           {/* Taquilla */}
           <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
              <div>
                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Taquilla {report.isHome ? '(Casa)' : '(Fuera)'}</p>
                 {report.isHome ? (
                    <p className="text-xs text-zinc-400">Asistencia: <span className="text-white font-bold">{report.attendance.toLocaleString()}</span> / {report.capacity.toLocaleString()}</p>
                 ) : (
                    <p className="text-xs text-zinc-600 italic">Los partidos fuera no generan taquilla.</p>
                 )}
              </div>
              <p className={`text-lg font-mono font-bold ${report.ticketIncome > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                 +{report.ticketIncome.toLocaleString()}€
              </p>
           </div>

           {/* Patrocinadores */}
           <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
              <div>
                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Patrocinadores</p>
                 <p className="text-xs text-zinc-400">Pago semanal fijo</p>
              </div>
              <p className="text-lg font-mono font-bold text-emerald-400">
                 +{report.sponsorIncome.toLocaleString()}€
              </p>
           </div>

           {/* Total Divider */}
           <div className="h-px bg-zinc-800 my-2"></div>

           {/* Total */}
           <div className="flex justify-between items-center px-2">
              <p className="text-sm font-black uppercase text-zinc-300 tracking-widest">Beneficio Neto</p>
              <p className="text-2xl font-impact text-emerald-400 tracking-tight">+{report.total.toLocaleString()}€</p>
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-white hover:bg-zinc-200 text-zinc-950 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
        >
          Ingresar al Banco
        </button>
      </div>
    </div>
  );
};

export default FinancialModal;