
import React, { useState, useEffect } from 'react';
import { getScoutReport } from '../services/gemini';

interface Props {
  teamName: string;
  division: number;
}

const ScoutView: React.FC<Props> = ({ teamName, division }) => {
  const [report, setReport] = useState<{ text: string, sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    const data = await getScoutReport(teamName, division);
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 text-2xl">
             📡
          </div>
          <div>
            <h3 className="text-xl font-bold">Red de Ojeadores IA</h3>
            <p className="text-xs text-zinc-500 font-mono">CONEXIÓN ENCRIPTADA ACTIVA</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-sm font-mono animate-pulse">ANALIZANDO TENDENCIAS DEL MERCADO...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-zinc-300 font-medium italic">
              "{report?.text}"
            </p>

            {report?.sources && report.sources.length > 0 && (
              <div className="pt-6 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-3">Fuentes de Inteligencia</p>
                <div className="flex flex-wrap gap-2">
                  {report.sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-full text-zinc-400 transition-colors border border-zinc-700"
                    >
                      {s.title || 'Fuente de Mercado'} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={fetchReport}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl text-sm font-bold border border-zinc-700 transition-all mt-4"
            >
              ACTUALIZAR INFORMACIÓN
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
           <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Meta de la División</h4>
           <p className="text-sm font-medium">La División {division} se basa en el posicionamiento defensivo. Los ojeadores sugieren un DEL alto.</p>
        </div>
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
           <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Consejo Financiero</h4>
           <p className="text-sm font-medium">Mantén al menos el 20% de tu presupuesto para lesiones imprevistas más adelante.</p>
        </div>
      </div>
    </div>
  );
};

export default ScoutView;
