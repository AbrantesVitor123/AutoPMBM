import React from 'react';
import { DiarioRecord } from '../types';

// Renders a single key-value pair, skipping empty/null values.
const DataItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
    if (value === null || value === undefined || String(value).trim() === '') {
        return null;
    }
    return (
        <div className="py-2 grid grid-cols-3 gap-4 text-sm">
            <dt className="text-gray-500 font-medium col-span-1">{label}</dt>
            <dd className="text-gray-800 col-span-2">{String(value)}</dd>
        </div>
    );
};

interface DataCardProps {
  record: DiarioRecord;
}

const DiarioDataCard: React.FC<DataCardProps> = ({ record }) => {
  const recordIdentifier = record['Data'] || 'N/A';
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
        <h3 className="font-bold text-lg text-blue-600 border-b pb-2 mb-3">
            Registro do Dia: {recordIdentifier}
        </h3>
        <dl className="divide-y divide-gray-100">
            <DataItem label="Data" value={record['Data']} />
            <DataItem label="Hora Inicial" value={record['Hora Inicial']} />
            <DataItem label="Hora Final" value={record['Hora Final']} />
            <DataItem label="Tempo Monitoramento" value={record['Tempo Monitoramento']} />
            <DataItem label="Latitude" value={record['Latitude']} />
            <DataItem label="Longitude" value={record['Longitude']} />
        </dl>
    </div>
  );
};

export default DiarioDataCard;