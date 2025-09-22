import React, { useState, useCallback, useRef } from 'react';
import DocumentIcon from './icons/DocumentIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { ReportType } from '../types';


interface FileUploadProps {
  onFileChange: (files: File[]) => void;
  reportType: ReportType;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, reportType }) => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedExtensions = reportType === ReportType.DIARIO
    ? ['.csv', '.xlsx', '.pdf']
    : ['.csv', '.xlsx'];
  
  const acceptedMimeTypes = acceptedExtensions.join(',');
  const supportedMessage = `Suportado: ${acceptedExtensions.join(', ')}`;


  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) {
      setFileNames([]);
      onFileChange([]);
      return;
    }

    const validFiles: File[] = [];
    const names: string[] = [];
    const invalidFileNames: string[] = [];

    Array.from(files).forEach(file => {
      if (file && acceptedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        validFiles.push(file);
        names.push(file.name);
      } else if (file) {
        invalidFileNames.push(file.name);
      }
    });

    setFileNames(names);
    onFileChange(validFiles);

    if (invalidFileNames.length > 0) {
      alert(`Os seguintes arquivos têm um formato inválido e foram ignorados: ${invalidFileNames.join(', ')}.\n\nPor favor, use apenas arquivos ${acceptedExtensions.join(' ou ')}.`);
    }
  }, [onFileChange, acceptedExtensions]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow re-selecting the same file(s)
    e.target.value = '';
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
      onClick={handleButtonClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        accept={acceptedMimeTypes}
        multiple
      />
      {fileNames.length > 0 ? (
        <div className="flex flex-col items-center text-green-600">
          <CheckCircleIcon className="w-12 h-12 mb-2" />
          <p className="font-semibold text-gray-700">{fileNames.length} arquivo(s) selecionado(s)</p>
          <ul className="text-sm text-gray-600 list-none mt-2 text-left max-h-28 w-full overflow-y-auto bg-gray-100 p-2 rounded-md border">
            {fileNames.map((name, index) => (
              <li key={`${name}-${index}`} className="truncate p-1" title={name}>
                - {name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-500">
          <DocumentIcon className="w-12 h-12 mb-3"/>
          <p className="font-semibold text-gray-600">Arraste e solte os arquivos aqui</p>
          <p className="text-sm my-1">ou</p>
          <p className="text-sm bg-gray-200 px-3 py-1 rounded-md">Clique para selecionar</p>
          <p className="text-xs mt-3 text-gray-400">{supportedMessage}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;