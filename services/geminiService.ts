import { GoogleGenAI, Type } from "@google/genai";
import { ReportRecord, ReportType, AvistagemRecord, DiarioRecord } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const avistagemSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      'Número': { type: Type.STRING, description: "Número de identificação do registro.", nullable: true },
      'Data': { type: Type.STRING, description: "Data da observação (ex: DD/MM/AAAA).", nullable: true },
      'Observador': { type: Type.STRING, description: "Nome da pessoa que fez a observação.", nullable: true },
      'N° do registro': { type: Type.STRING, description: "Número de registro oficial.", nullable: true },
      'Hora local': { type: Type.STRING, description: "Hora local da observação (ex: HH:MM).", nullable: true },
      'Unidade/Poço': { type: Type.STRING, description: "Local da observação.", nullable: true },
      'Profundidade': { type: Type.STRING, description: "Profundidade em metros.", nullable: true },
      'Estado do Mar': { type: Type.STRING, description: "Descrição do estado do mar.", nullable: true },
      'Visibilidade': { type: Type.STRING, description: "Condições de visibilidade.", nullable: true },
      'Direção do vento': { type: Type.STRING, description: "Direção do vento.", nullable: true },
      'Fotos': { type: Type.STRING, description: "Referência ou link para fotos.", nullable: true },
      'Animal avistado': { type: Type.STRING, description: "Nome ou tipo do animal principal avistado.", nullable: true },
      'Aves': { type: Type.STRING, description: "Tipos de aves avistadas.", nullable: true },
      'Grupo': { type: Type.STRING, description: "Informações sobre o grupo de animais.", nullable: true },
      'Composição do grupo': { type: Type.STRING, description: "O valor textual original da composição do grupo (ex: '5 (3A, 2F)').", nullable: true },
      'Comportamento': { type: Type.STRING, description: "Comportamento observado dos animais.", nullable: true },
      'Observações': { type: Type.STRING, description: "Observações gerais adicionais.", nullable: true },
      'Fase da atividade': { type: Type.STRING, description: "Fase da atividade industrial no momento.", nullable: true },
      'Alguma alteração na fauna?': { type: Type.STRING, description: "Sim/Não ou descrição sobre alterações na fauna.", nullable: true },
      
      'Primeira Distância Observada': { type: Type.STRING, description: "Primeira distância observada, incluindo a unidade (ex: '10m').", nullable: true },
      'Última Distância Observada': { type: Type.STRING, description: "Última distância observada, incluindo a unidade (ex: '10m').", nullable: true },
      'MPAO': { type: Type.STRING, description: "MPAO (Menor Ponto de Aproximação Ortogonal), incluindo a unidade (ex: '10m').", nullable: true },

      'Primeiro comportamento observado': { type: Type.STRING, description: "Primeiro comportamento notado.", nullable: true },
      'Segundo comportamento observado': { type: Type.STRING, description: "Segundo comportamento notado.", nullable: true },
      'Último comportamento observado': { type: Type.STRING, description: "Último comportamento notado.", nullable: true },
      'Direção do Percurso': { type: Type.STRING, description: "Direção do percurso do animal.", nullable: true },
      'Atividade operacional da unidade': { type: Type.STRING, description: "Atividade operacional da unidade no momento da observação.", nullable: true },
      
      'Hora da Primeira Distância Observada': { type: Type.STRING, description: 'Hora da primeira distância observada (ex: HH:MM).', nullable: true },
      'Hora da Última Distância Observada': { type: Type.STRING, description: 'Hora da última distância observada (ex: HH:MM).', nullable: true },
      'Hora MPAO': { type: Type.STRING, description: 'Hora do MPAO (ex: HH:MM).', nullable: true },
      
      'Comentário': { type: Type.STRING, description: 'Comentários adicionais.', nullable: true },
      'Detalhes do Comportamento': { type: Type.STRING, description: 'Detalhes adicionais sobre o comportamento.', nullable: true },
      
      'Composição do Grupo - Complementar Adultos': { type: Type.STRING, description: "Número de adultos no grupo.", nullable: true },
      'Composição do Grupo - Complementar filhotes': { type: Type.STRING, description: "Número de filhotes no grupo.", nullable: true },
    },
  },
};

const diarioSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            'Data': { type: Type.STRING, description: "Data do monitoramento (ex: DD/MM/AAAA).", nullable: true },
            'Hora Inicial': { type: Type.STRING, description: "Hora de início do monitoramento (ex: HH:MM).", nullable: true },
            'Hora Final': { type: Type.STRING, description: "Hora de fim do monitoramento (ex: HH:MM).", nullable: true },
            'Tempo Monitoramento': { type: Type.STRING, description: "Duração total do monitoramento (ex: '2h 30m').", nullable: true },
            'Latitude': { type: Type.STRING, description: "Coordenada de Latitude. Pode ser a inicial ou a principal do dia.", nullable: true },
            'Longitude': { type: Type.STRING, description: "Coordenada de Longitude. Pode ser a inicial ou a principal do dia.", nullable: true },
        }
    }
};


export const analyzeSpreadsheet = async (
  fileData: { data: string; mimeType: string; isText: boolean },
  reportType: ReportType
): Promise<ReportRecord[]> => {
  
  let basePrompt: string;
  let schema: typeof avistagemSchema | typeof diarioSchema;
  let contents: any;
  
  switch(reportType) {
    case ReportType.AVISTAGEM:
      schema = avistagemSchema;
      basePrompt = `
        Você é um especialista em analisar relatórios de sustentabilidade ambiental no formato CSV.
        Sua tarefa é extrair os dados do conteúdo CSV fornecido e estruturá-los como um array JSON, seguindo estritamente o schema definido.
        Cada objeto no array deve representar uma única linha do CSV que contenha dados relevantes de avistamento. Ignore linhas de cabeçalho ou em branco.
        Mapeie as colunas do CSV para os campos do schema da melhor forma possível, mesmo que os nomes das colunas não sejam idênticos.

        ### Regras de Extração Especiais:

        1.  **Distância e Hora:**
            O relatório pode ter um formato de chave/valor onde a chave contém parte do valor.
            - Se você encontrar uma célula com um texto como "Primeira Distância Observada (10m)", o valor para o campo **'Primeira Distância Observada'** é o que está DENTRO dos parênteses (neste caso, "10m"). O valor para o campo **'Hora da Primeira Distância Observada'** estará na célula adjacente (ex: "06:26").
            - Aplique a mesma lógica para "Última Distância Observada" e "MPAO". O nome da coluna pode variar (ex: "MPAO * (10m)").
        
        2.  **Composição do Grupo:**
            - A partir da coluna 'Composição do grupo', extraia os números para os campos 'Composição do Grupo - Complementar Adultos' e 'Composição do Grupo - Complementar filhotes'.
            - 'Composição do Grupo - Complementar Adultos': extraia o número de adultos (identificados por 'A').
            - 'Composição do Grupo - Complementar filhotes': extraia o número de filhotes (identificados por 'F' ou 'C').
            - Se um valor for uma aproximação (ex: '> 2', '~5'), extraia APENAS o número (ex: 2 ou 5).
            - O campo 'Composição do grupo' deve manter o valor original do texto (ex: '5 (3A, 2F)'). O total será calculado posteriormente.

        Se um campo não estiver presente ou estiver vazio em uma linha, retorne null para esse campo.
        A saída deve ser apenas o array JSON válido.
      `;
      break;

    case ReportType.DIARIO:
      schema = diarioSchema;
      basePrompt = `
        Você é um especialista em analisar relatórios de esforço diário de avistamento.
        Sua tarefa é extrair APENAS os seguintes campos do arquivo fornecido: 'Data', 'Hora Inicial', 'Hora Final', 'Tempo Monitoramento', 'Latitude' e 'Longitude'.
        Estruture a saída como um array JSON, seguindo o schema definido. Cada objeto no array deve representar um único dia de monitoramento.

        ### Regras de Extração:
        1.  **Identifique os Campos-Chave:** Procure por termos como "Data", "Início", "Fim", "Total de Horas", "Latitude", "Longitude" ou similares.
        2.  **Mapeamento de Campos:**
            - 'Hora Inicial': Mapeie do campo que indica o início do esforço.
            - 'Hora Final': Mapeie do campo que indica o fim do esforço.
            - 'Tempo Monitoramento': Mapeie do campo que indica a duração total.
            - 'Latitude' e 'Longitude': Use as coordenadas de início do esforço, se houver múltiplas.
        3.  **Um Registro por Arquivo:** Geralmente, cada arquivo representa um único esforço diário. A saída deve ser um array contendo um único objeto JSON com os dados extraídos. Se o arquivo contiver múltiplos dias, crie um objeto para cada.

        Se um campo não for encontrado, retorne null para esse campo.
        A saída deve ser apenas o array JSON válido contendo os dados extraídos. Ignore todas as outras informações do relatório.
      `;
      break;
    
    default:
        throw new Error("Tipo de relatório desconhecido.");
  }

  if (fileData.isText) {
    const promptWithContent = `
        ${basePrompt}

        Conteúdo do arquivo (CSV):
        ---
        ${fileData.data}
        ---
    `;
    contents = promptWithContent;
  } else { // Handle PDF and other non-text formats
    const promptForFile = `
        ${basePrompt}

        O conteúdo a ser analisado está no arquivo fornecido a seguir. Extraia os dados dele.
    `;
    contents = [
        { text: promptForFile },
        {
            inlineData: {
                mimeType: fileData.mimeType,
                data: fileData.data
            }
        }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("A API retornou uma resposta vazia. Verifique o conteúdo do arquivo.");
    }

    const parsedJson = JSON.parse(jsonText);

    if (!Array.isArray(parsedJson)) {
        throw new Error("A API não retornou um array JSON válido.");
    }
    
    return parsedJson as ReportRecord[];

  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Não foi possível processar o arquivo com a IA. O formato do arquivo pode ser inválido ou a API está indisponível.");
  }
};