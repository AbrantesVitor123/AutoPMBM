import React from 'react';
import { ReportType } from '../types';

interface ReportSelectorProps {
    onSelect: (type: ReportType) => void;
}

const ReportCard: React.FC<{title: string, description: string, onClick: () => void}> = ({ title, description, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1"
    >
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
    </div>
);

const ReportSelector: React.FC<ReportSelectorProps> = ({ onSelect }) => {
    return (
        <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Selecione o Tipo de Relatório</h2>
            <p className="text-lg text-gray-600 mb-12">Escolha qual tipo de planilha você deseja analisar para começar.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReportCard 
                    title="Registro de Avistagem"
                    description="Analise relatórios individuais de avistagens de fauna."
                    onClick={() => onSelect(ReportType.AVISTAGEM)}
                />
                 <ReportCard 
                    title="Esforço Diário de Avistamento"
                    description="Analise fichas diárias consolidadas de esforço e avistagens."
                    onClick={() => onSelect(ReportType.DIARIO)}
                />
            </div>
        </div>
    );
};

export default ReportSelector;