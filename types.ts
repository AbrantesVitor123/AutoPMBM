export enum ReportType {
  AVISTAGEM = 'avistagem',
  DIARIO = 'diario'
}

export interface AvistagemRecord {
  // Fields from initial request
  'Número'?: string | number | null;
  'Data'?: string | null;
  'Observador'?: string | null;
  'N° do registro'?: string | null;
  'Hora local'?: string | null;
  'Unidade/Poço'?: string | null;
  'Profundidade'?: string | null;
  'Estado do Mar'?: string | null;
  'Visibilidade'?: string | null;
  'Direção do vento'?: string | null;
  'Fotos'?: string | null;
  'Animal avistado'?: string | null;
  'Aves'?: string | null;
  'Grupo'?: string | null;
  'Composição do grupo'?: string | number | null; // This will hold the calculated total in exports
  'Comportamento'?: string | null;
  'Observações'?: string | null;
  'Fase da atividade'?: string | null;
  'Alguma alteração na fauna?'?: string | null;

  // Corrected distance and related fields
  'Primeira Distância Observada'?: string | null;
  'Última Distância Observada'?: string | null;
  'MPAO'?: string | null;
  'Primeiro comportamento observado'?: string | null;
  'Segundo comportamento observado'?: string | null;
  'Último comportamento observado'?: string | null;
  'Direção do Percurso'?: string | null;
  'Atividade operacional da unidade'?: string | null;

  // Corrected time and related fields
  'Hora da Primeira Distância Observada'?: string | null;
  'Hora da Última Distância Observada'?: string | null;
  'Hora MPAO'?: string | null;
  'Comentário'?: string | null;
  'Detalhes do Comportamento'?: string | null; // For the second 'comportamento' column

  // Fields for detailed group composition - RENAMED
  'Composição do Grupo - Complementar Adultos'?: string | number | null;
  'Composição do Grupo - Complementar filhotes'?: string | number | null;
}

export interface DiarioRecord {
    'Data'?: string | null;
    'Hora Inicial'?: string | null;
    'Hora Final'?: string | null;
    'Tempo Monitoramento'?: string | null;
    'Latitude'?: string | null;
    'Longitude'?: string | null;
}


export type ReportRecord = AvistagemRecord | DiarioRecord;