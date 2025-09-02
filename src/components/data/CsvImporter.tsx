import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

const CsvImporter: React.FC = () => {
  const [parsedData, setParsedData] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          console.log('Parsed CSV data:', results.data);
          setParsedData(results.data);
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
  });

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Déposez le fichier ici...</p>
        ) : (
          <p>Glissez-déposez un fichier CSV ici, ou cliquez pour sélectionner un fichier</p>
        )}
      </div>
      {parsedData.length > 0 && (
        <table style={{ width: '100%', marginTop: '20px' }}>
          <thead>
            <tr>
              {Object.keys(parsedData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsedData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value: any, i) => (
                  <td key={i}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const dropzoneStyles: React.CSSProperties = {
  border: '2px dashed #ccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default CsvImporter;
