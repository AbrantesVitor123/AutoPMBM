import React from 'react';
import { AvistagemRecord } from '../types';

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

// A special component to display visibility options in a row.
const VisibilityItem: React.FC<{ selectedValue: string | null | undefined }> = ({ selectedValue }) => {
    // Don't render if there's no visibility data.
    if (selectedValue === null || selectedValue === undefined || String(selectedValue).trim() === '') {
        return null;
    }

    const BASE_OPTIONS = ['Excelente', 'Boa', 'Regular', 'Ruim', 'Neblina'];
    
    let displayOptions = [...BASE_OPTIONS];
    const normalizedSelected = selectedValue.trim().toLowerCase();
    const selectedValueCapitalized = selectedValue.trim();

    // If the value from the data is not in our standard list, add it so it's still displayed.
    if (!BASE_OPTIONS.find(opt => opt.toLowerCase() === normalizedSelected)) {
        displayOptions.push(selectedValueCapitalized);
    }

    return (
        <div className="py-2 grid grid-cols-3 gap-4 text-sm">
            <dt className="text-gray-500 font-medium col-span-1">Visibilidade</dt>
            <dd className="text-gray-800 col-span-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1" role="radiogroup">
                    {displayOptions.map(option => {
                        const isSelected = normalizedSelected === option.toLowerCase();
                        return (
                            <div 
                                key={option} 
                                className={`flex items-center transition-colors duration-200 ${isSelected ? 'text-green-700 font-bold' : 'text-gray-400'}`}
                                aria-checked={isSelected}
                                role="radio"
                            >
                                {isSelected && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <span>{option}</span>
                            </div>
                        );
                    })}
                </div>
            </dd>
        </div>
    );
};

// A special component for displaying detailed group composition.
const GroupCompositionItem: React.FC<{ record: AvistagemRecord }> = ({ record }) => {
    const adults = record['Composição do Grupo - Complementar Adultos'];
    const offspring = record['Composição do Grupo - Complementar filhotes'];

    const parseNumericValue = (value: string | number | null | undefined): number => {
        if (!value) return 0;
        const stringValue = String(value).replace(/[^0-9]/g, '');
        if (stringValue === '') return 0;
        const parsed = parseInt(stringValue, 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    const adultsCount = parseNumericValue(adults);
    const offspringCount = parseNumericValue(offspring);
    const calculatedTotal = adultsCount + offspringCount;

    const hasAnyData = record['Composição do grupo'] || adults || offspring;
    if (!hasAnyData) {
        return null;
    }
    
    return (
        <div className="py-2 grid grid-cols-3 gap-4 text-sm">
            <dt className="text-gray-500 font-medium col-span-1">Composição do grupo</dt>
            <dd className="text-gray-800 col-span-2 space-y-1">
                <div><strong>Total:</strong> {calculatedTotal}</div>
                {adults && <div className="pl-2"><span className="opacity-60">↳</span> <strong>Adultos:</strong> {adults}</div>}
                {offspring && <div className="pl-2"><span className="opacity-60">↳</span> <strong>Filhotes:</strong> {offspring}</div>}
            </dd>
        </div>
    );
};


interface DataCardProps {
  record: AvistagemRecord;
}

const DataCard: React.FC<DataCardProps> = ({ record }) => {
  const recordNumber = record['N° do registro'] || record['Número'] || 'N/A';
  
  // Define keys for special handling
  const compositionKeys: (keyof AvistagemRecord)[] = [
    'Composição do grupo',
    'Composição do Grupo - Complementar Adultos',
    'Composição do Grupo - Complementar filhotes'
  ];

  // Get all record entries except for those handled specially.
  const genericItems = Object.entries(record).filter(
    ([key]) => key !== 'Visibilidade' && !compositionKeys.includes(key as keyof AvistagemRecord)
  );

  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
        <h3 className="font-bold text-lg text-blue-600 border-b pb-2 mb-3">
            Registro: {recordNumber}
        </h3>
        <dl className="divide-y divide-gray-100">
            {/* Render special components */}
            <VisibilityItem selectedValue={record['Visibilidade']} />
            <GroupCompositionItem record={record} />
            
            {/* Render all other items that have a value */}
            {genericItems.map(([key, value]) => (
                <DataItem key={key} label={key} value={value} />
            ))}
        </dl>
    </div>
  );
};

export default DataCard;