import React from 'react';
import { AvistagemRecord, DiarioRecord, ReportRecord, ReportType } from '../types';
import DataCard from './DataCard';

interface ResultsDisplayProps {
  isLoading: boolean;
  analysisResult: ReportRecord[] | null;
  onExport: () => void;
  reportType: ReportType;
  onNewAnalysis: () => void;
}

// Fix: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
const ResultsPlaceholder: React.FC<{ title: string, message: string, icon: React.ReactElement }> = ({ title, message, icon }) => (
    <div className="text-center bg-white p-10 rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col justify-center items-center">
        <div className="text-gray-400 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-700">{title}</h3>
        <p className="text-gray-500 mt-2">{message}</p>
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, analysisResult, onExport, reportType, onNewAnalysis }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-3 bg-gray-200 rounded col-span-1"></div>
                                <div className="h-3 bg-gray-200 rounded col-span-2"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-3 bg-gray-200 rounded col-span-1"></div>
                                <div className="h-3 bg-gray-200 rounded col-span-2"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-3 bg-gray-200 rounded col-span-1"></div>
                                <div className="h-3 bg-gray-200 rounded col-span-2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

  if (!analysisResult) {
    return <ResultsPlaceholder 
        title="Aguardando Análise"
        message="Faça o upload de uma planilha e clique em 'Analisar' para ver os resultados aqui."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
    />;
  }
  
  if (analysisResult.length === 0) {
      return <ResultsPlaceholder 
        title="Nenhum dado encontrado"
        message="A análise foi concluída, mas nenhum registro de dados foi extraído do arquivo."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5z" /></svg>}
    />;
  }
  
    if (reportType === ReportType.DIARIO) {
        const diarioRecords = analysisResult as DiarioRecord[];
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-orange-600">Resultados da Extração</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExport}
                            className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300 flex items-center"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Exportar Excel
                        </button>
                        <button
                            onClick={onNewAnalysis}
                            className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Novo
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Início</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Final</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Tempo Total</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Latitude</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Longitude</th>
                            </tr>
                        </thead>
                        <tbody>
                            {diarioRecords.map((record, index) => (
                                <tr key={index} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                    <td className="p-3 text-sm text-gray-700">{record['Data']}</td>
                                    <td className="p-3 text-sm text-gray-700">{record['Hora Inicial']}</td>
                                    <td className="p-3 text-sm text-gray-700">{record['Hora Final']}</td>
                                    <td className="p-3 text-sm text-gray-700">{record['Tempo Monitoramento']}</td>
                                    <td className="p-3 text-sm text-gray-700">{record['Latitude']}</td>
                                    <td className="p-3 text-sm text-gray-700">{record['Longitude']}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }


  return (
    <div>
        <div className="mb-4 pb-2 border-b-2 border-gray-200 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-700">Resultados da Análise</h2>
                <p className="text-gray-500">{analysisResult.length} registro(s) encontrado(s).</p>
            </div>
            {analysisResult.length > 0 && (
                <button
                    onClick={onExport}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar para Excel
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisResult.map((record, index) => {
                if(reportType === ReportType.AVISTAGEM) {
                    return <DataCard key={index} record={record as AvistagemRecord} />;
                }
                return null;
            })}
        </div>
    </div>
  );
};

export default ResultsDisplay;