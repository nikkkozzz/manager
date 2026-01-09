
import React from 'react';
import { Team } from '../types';

interface Props {
  team: Team;
}

const FinancesView: React.FC<Props> = ({ team }) => {
  // Cálculos financieros
  const ticketPrice = 20;
  const maxTicketIncome = team.capacity * ticketPrice;
  const avgTicketIncome = Math.floor(maxTicketIncome * 0.8); // 80% asistencia promedio
  
  const sponsorIncome = (4 - team.division) * 150000;
  
  // Estimación de salarios (0.5% del valor del jugador por semana)
  const totalSalaries = team.squad.reduce((sum, p) => sum + Math.floor(p.value * 0.005), 0);
  
  // Ingreso proyectado semanal (Asumiendo 1 partido en casa cada 2 semanas para promedio, o simplificado)
  // Para simplificar la proyección "Semanal", sumamos Sponsor + (Taquilla Promedio / 2) - Salarios
  const projectedWeeklyIncome = sponsorIncome + (avgTicketIncome / 2);
  const projectedWeeklyProfit = projectedWeeklyIncome - totalSalaries;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Cabecera de Balance */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-emerald-900/50 text-zinc-950">
                🏦
              </div>
              <div>
                 <h2 className="text-3xl font-impact uppercase tracking-tight text-white">Balance del Club</h2>
                 <p className="text-zinc-500 text-xs font-mono font-bold uppercase tracking-widest">Estado de Tesorería Actual</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-6xl font-mono font-bold text-emerald-400 tracking-tighter drop-shadow-lg">
                {team.budget.toLocaleString()}€
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Columna Ingresos */}
        <div className="space-y-6">
           <h3 className="text-xl font-impact uppercase tracking-widest text-emerald-500 flex items-center gap-2">
             <span>📈</span> Fuentes de Ingresos
           </h3>
           
           <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex justify-between items-center">
              <div>
                 <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Patrocinador Principal</p>
                 <p className="font-bold text-zinc-200">División {team.division}</p>
              </div>
              <div className="text-right">
                 <p className="text-xl font-mono text-emerald-400 font-bold">+{sponsorIncome.toLocaleString()}€</p>
                 <p className="text-[9px] text-zinc-600 font-bold uppercase">/ Semana</p>
              </div>
           </div>

           <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex justify-between items-center">
              <div>
                 <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Estadio & Taquilla</p>
                 <p className="font-bold text-zinc-200">{team.capacity.toLocaleString()} Asientos</p>
                 <p className="text-[10px] text-zinc-500 mt-1">Precio medio entrada: {ticketPrice}€</p>
              </div>
              <div className="text-right">
                 <p className="text-xl font-mono text-emerald-400 font-bold">~{avgTicketIncome.toLocaleString()}€</p>
                 <p className="text-[9px] text-zinc-600 font-bold uppercase">/ Partido en Casa</p>
              </div>
           </div>
        </div>

        {/* Columna Gastos */}
        <div className="space-y-6">
           <h3 className="text-xl font-impact uppercase tracking-widest text-red-500 flex items-center gap-2">
             <span>📉</span> Gastos Estructurales
           </h3>

           <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500/50"></div>
              <div>
                 <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Masa Salarial</p>
                 <p className="font-bold text-zinc-200">{team.squad.length} Jugadores en nómina</p>
              </div>
              <div className="text-right">
                 <p className="text-xl font-mono text-red-400 font-bold">-{totalSalaries.toLocaleString()}€</p>
                 <p className="text-[9px] text-zinc-600 font-bold uppercase">/ Semana</p>
              </div>
           </div>
           
           <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 border-dashed text-center">
              <p className="text-xs text-zinc-500 leading-relaxed italic">
                 "Recuerda mantener un colchón financiero para el mercado de fichajes y posibles renovaciones de estadio."
              </p>
           </div>
        </div>
      </div>

      {/* Proyección */}
      <div className="bg-zinc-950 rounded-[2.5rem] border border-zinc-800 p-8 flex flex-col items-center text-center shadow-inner">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Proyección Semanal Estimada (Promedio)</p>
         
         <div className="flex items-center gap-4 text-4xl font-impact tracking-tighter">
            <span className={projectedWeeklyProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}>
               {projectedWeeklyProfit >= 0 ? '+' : ''}{projectedWeeklyProfit.toLocaleString()}€
            </span>
         </div>
         <p className="text-xs text-zinc-600 mt-2 font-bold max-w-md">
            Cálculo basado en ingresos fijos + media de taquilla (partidos casa/fuera) menos salarios de la plantilla.
         </p>
      </div>

    </div>
  );
};

export default FinancesView;
