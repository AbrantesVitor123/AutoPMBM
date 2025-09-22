
import React, { useState, useCallback } from 'react';
import { read, utils } from 'xlsx';
import { ReportRecord, ReportType } from './types';
import { analyzeSpreadsheet } from './services/geminiService';
import { exportToXlsx } from './utils/exportUtils';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Spinner from './components/Spinner';
import ReportSelector from './components/ReportSelector';

const processFile = (file: File): Promise<{ data: string; mimeType: string; isText: boolean }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Falha ao ler o arquivo."));
    };
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'xlsx') {
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          if (!data) {
            return reject(new Error("Não foi possível ler o conteúdo do arquivo XLSX."));
          }
          const workbook = read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            return reject(new Error("A planilha XLSX está vazia ou corrompida."));
          }
          const worksheet = workbook.Sheets[sheetName];
          const csvContent = utils.sheet_to_csv(worksheet);
          resolve({ data: csvContent, mimeType: 'text/csv', isText: true });
        } catch (e) {
          console.error("Error parsing XLSX:", e);
          const errorMessage = e instanceof Error ? e.message : "Erro desconhecido ao processar XLSX.";
          reject(new Error(`Erro ao processar o arquivo XLSX: ${errorMessage}`));
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'csv') {
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        if (fileContent === null || fileContent === undefined) {
          return reject(new Error("Não foi possível ler o conteúdo do arquivo CSV."));
        }
        resolve({ data: fileContent, mimeType: 'text/csv', isText: true });
      };
      reader.readAsText(file, 'UTF-8');
    } else if (fileExtension === 'pdf') {
       reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const base64String = dataUrl.split(',')[1];
         if (!base64String) {
           return reject(new Error("Não foi possível converter o PDF para base64."));
         }
         resolve({ data: base64String, mimeType: 'application/pdf', isText: false });
       };
       // FIX: Corrected method name from readDataURL to readAsDataURL.
       reader.readAsDataURL(file);
    } else {
        reject(new Error(`Tipo de arquivo não suportado: ${fileExtension}`));
    }
  });
};


const App: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ReportRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setAnalysisResult(null);
    setError(null);
  };
  
  const handleReportTypeSelect = (type: ReportType) => {
    setReportType(type);
    setFiles([]);
    setAnalysisResult(null);
    setError(null);
  }
  
  const resetApp = () => {
    setReportType(null);
    setFiles([]);
    setAnalysisResult(null);
    setError(null);
  }

  const handleAnalyzeClick = useCallback(async () => {
    if (files.length === 0) {
      setError("Por favor, selecione um ou mais arquivos para analisar.");
      return;
    }
    if (!reportType) {
       setError("Por favor, selecione um tipo de relatório.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const analysisPromises = files.map(async (file) => {
        try {
          const fileData = await processFile(file);
          if (!fileData.data || fileData.data.trim() === '') {
            console.warn(`Arquivo "${file.name}" está vazio ou não será processado.`);
            return []; // Retorna um array vazio para arquivos vazios
          }
          return await analyzeSpreadsheet(fileData, reportType);
        } catch (fileError) {
          throw new Error(`Erro no arquivo "${file.name}": ${fileError instanceof Error ? fileError.message : 'Erro desconhecido'}`);
        }
      });

      const resultsPerFile = await Promise.all(analysisPromises);
      const combinedResults = resultsPerFile.flat();

      setAnalysisResult(combinedResults);

    } catch (e) {
      console.error("Error during analysis:", e);
      const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido durante a análise.";
      setError(`Falha na análise: ${errorMessage}. Verifique se o formato dos arquivos está correto e tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  }, [files, reportType]);

  const handleExport = useCallback(() => {
    if (analysisResult && analysisResult.length > 0 && reportType) {
      exportToXlsx(analysisResult, `analise-consolidada-${reportType}`, reportType);
    }
  }, [analysisResult, reportType]);
  
  const titles = {
    [ReportType.AVISTAGEM]: "Analisador de Relatório - Registro de Avistagem",
    [ReportType.DIARIO]: "Analisador de Relatório - Esforço Diário de Avistamento"
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {!reportType ? (
            <ReportSelector onSelect={handleReportTypeSelect} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Control Panel */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-fit">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-gray-700">{titles[reportType]}</h2>
                   <button onClick={resetApp} className="text-sm text-blue-600 hover:underline">Trocar</button>
                </div>
                <p className="text-gray-500 mb-6">Faça o upload de uma ou mais planilhas (.csv, .xlsx) para extrair e visualizar os dados.</p>
                
                <FileUpload onFileChange={handleFileChange} reportType={reportType} />
                
                <button
                  onClick={handleAnalyzeClick}
                  disabled={files.length === 0 || isLoading}
                  className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading && <Spinner />}
                  {isLoading ? 'Analisando...' : `Analisar Arquivo(s)`}
                </button>
                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                    <p className="font-semibold">Erro</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-2">
                <ResultsDisplay 
                    isLoading={isLoading} 
                    analysisResult={analysisResult} 
                    onExport={handleExport} 
                    reportType={reportType}
                    onNewAnalysis={resetApp}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-gray-500 mt-8">
        <p>&copy; {new Date().getFullYear()} AutoPMBM. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
