import { utils, writeFile } from 'xlsx';
import { ReportRecord, ReportType, AvistagemRecord, DiarioRecord } from '../types';

// Define the exact headers and their order for the AVISTAGEM export
const AVISTAGEM_EXPORT_HEADERS: (keyof AvistagemRecord)[] = [
  'Observador',
  'N° do registro',
  'Data',
  'Unidade/Poço',
  'Profundidade',
  'Estado do Mar',
  'Visibilidade',
  'Direção do vento',
  'Animal avistado',
  'Composição do grupo', // Unified: will contain the calculated total
  'Composição do Grupo - Complementar Adultos', // Renamed
  'Composição do Grupo - Complementar filhotes', // Renamed
  'Comportamento',
  'Detalhes do Comportamento',
  'Fase da atividade',
  'Primeira Distância Observada',
  'Hora da Primeira Distância Observada',
  'Última Distância Observada',
  'Hora da Última Distância Observada',
  'MPAO',
  'Hora MPAO',
  'Primeiro comportamento observado', // Moved
  'Segundo comportamento observado', // Moved
  'Último comportamento observado', // Moved
  'Direção do Percurso',
  'Observações',
  'Comentário',
  'Hora local',
  'Fotos',
  'Aves',
  'Grupo',
  'Atividade operacional da unidade',
  'Alguma alteração na fauna?',
];

// Define headers for the DIARIO export
const DIARIO_EXPORT_HEADERS: (keyof DiarioRecord)[] = [
    'Data',
    'Hora Inicial',
    'Hora Final',
    'Tempo Monitoramento',
    'Latitude',
    'Longitude',
];


const parseNumericValue = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    // Keep only digits from the string representation of the value
    const stringValue = String(value).replace(/[^0-9]/g, '');
    if (stringValue === '') return 0;
    const parsed = parseInt(stringValue, 10);
    return isNaN(parsed) ? 0 : parsed;
};


export const exportToXlsx = (data: ReportRecord[], fileName: string, reportType: ReportType): void => {
  let wsData: (string | number | null)[][] = [];

  switch(reportType) {
    case ReportType.AVISTAGEM:
        const avistagemData = data as AvistagemRecord[];
        wsData.push(AVISTAGEM_EXPORT_HEADERS);
        avistagemData.forEach(originalRecord => {
            const record = { ...originalRecord };
            const adultsCount = parseNumericValue(record['Composição do Grupo - Complementar Adultos']);
            const offspringCount = parseNumericValue(record['Composição do Grupo - Complementar filhotes']);
            record['Composição do grupo'] = adultsCount + offspringCount;
            const row = AVISTAGEM_EXPORT_HEADERS.map(header => record[header] ?? null);
            wsData.push(row);
        });
        break;

    case ReportType.DIARIO:
        const diarioData = data as DiarioRecord[];
        wsData.push(DIARIO_EXPORT_HEADERS);
        diarioData.forEach(record => {
            const row = DIARIO_EXPORT_HEADERS.map(header => record[header] ?? null);
            wsData.push(row);
        });
        break;
        
    default:
        console.error("Tipo de relatório inválido para exportação.");
        return;
  }


  // Create worksheet and workbook
  const ws = utils.aoa_to_sheet(wsData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Análise de Registros');

  // Trigger the file download
  writeFile(wb, `${fileName}.xlsx`);
};