import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useFinance } from '../../context/FinanceContext';
import { useDropzone } from 'react-dropzone';
import { XIcon, UploadIcon, FileTextIcon, CameraIcon, CheckIcon, AlertCircleIcon, FileIcon, ImageIcon, RefreshCwIcon, DatabaseIcon, LoaderIcon, ReceiptIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FinancialItem } from '../../types/finance';
import { categorizeTransaction } from '../../utils/aiCategorization';
interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (items: FinancialItem[]) => void;
  importType: 'income' | 'expense' | 'saving' | 'debt';
}
interface ParsedTransaction {
  description: string;
  amount: string;
  date?: string;
  category?: string;
}
export function DataImportModal({
  isOpen,
  onClose,
  onImportComplete,
  importType
}: DataImportModalProps) {
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    financialData
  } = useFinance();
  // États
  const [importMethod, setImportMethod] = useState<'csv' | 'ocr' | 'manual' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [categorizedItems, setCategorizedItems] = useState<FinancialItem[]>([]);
  const [step, setStep] = useState(1);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Configuration de react-dropzone pour les fichiers CSV
  const onDropCSV = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      parseCSVFile(file);
    }
  }, []);
  const {
    getRootProps: getCsvRootProps,
    getInputProps: getCsvInputProps
  } = useDropzone({
    onDrop: onDropCSV,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });
  // Configuration de react-dropzone pour les images (OCR)
  const onDropImage = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps
  } = useDropzone({
    onDrop: onDropImage,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });
  // Analyser un fichier CSV
  const parseCSVFile = (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    const reader = new FileReader();
    reader.onprogress = event => {
      if (event.lengthComputable) {
        const percentComplete = Math.round(event.loaded / event.total * 50);
        setProgress(percentComplete);
      }
    };
    reader.onload = async e => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        // Identifier les colonnes pertinentes
        const descriptionIndex = headers.findIndex(h => h.includes('description') || h.includes('libellé') || h.includes('détail') || h.includes('transaction'));
        const amountIndex = headers.findIndex(h => h.includes('montant') || h.includes('amount') || h.includes('somme') || h.includes('valeur'));
        const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('jour'));
        const categoryIndex = headers.findIndex(h => h.includes('catégorie') || h.includes('category') || h.includes('type'));
        if (descriptionIndex === -1 || amountIndex === -1) {
          toast.error("Le format du CSV n'est pas reconnu. Vérifiez que votre fichier contient des colonnes pour la description et le montant.");
          setIsProcessing(false);
          return;
        }
        const transactions: ParsedTransaction[] = [];
        // Analyser les lignes de données
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(value => value.trim());
          if (values.length >= Math.max(descriptionIndex, amountIndex) + 1) {
            const transaction: ParsedTransaction = {
              description: values[descriptionIndex],
              amount: values[amountIndex].replace(/[^\d.,\-]/g, '').replace(',', '.')
            };
            if (dateIndex !== -1 && values[dateIndex]) {
              transaction.date = values[dateIndex];
            }
            if (categoryIndex !== -1 && values[categoryIndex]) {
              transaction.category = values[categoryIndex];
            }
            transactions.push(transaction);
          }
          // Mettre à jour la progression
          setProgress(50 + Math.round(i / lines.length * 50));
        }
        setParsedData(transactions);
        await categorizeTransactions(transactions);
        setIsProcessing(false);
        setProgress(100);
        setStep(2);
      } catch (error) {
        console.error("Erreur lors de l'analyse du fichier CSV:", error);
        toast.error("Erreur lors de l'analyse du fichier CSV");
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      toast.error('Erreur lors de la lecture du fichier CSV');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };
  // Analyser une image avec OCR
  const processImageWithOCR = async () => {
    if (!selectedFile && !previewImage) {
      toast.error('Aucune image sélectionnée');
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    setOcrResult('');
    try {
      // Simulate OCR processing
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      // Mock OCR result
      setOcrResult('Simulation de reconnaissance de texte.\nLes données devront être saisies manuellement pour le moment.');
      // Create a mock transaction for manual editing
      const mockTransaction = {
        description: 'Transaction à compléter',
        amount: '0.00'
      };
      setParsedData([mockTransaction]);
      await categorizeTransactions([mockTransaction]);
      setIsProcessing(false);
      setStep(2);
    } catch (error) {
      console.error("Erreur lors de l'OCR:", error);
      toast.error("Erreur lors de l'analyse de l'image");
      setIsProcessing(false);
    }
  };
  // Extraire les transactions du texte OCR
  const extractTransactionsFromText = (text: string): ParsedTransaction[] => {
    const transactions: ParsedTransaction[] = [];
    const lines = text.split('\n');
    // Expressions régulières pour détecter les montants et dates
    const amountRegex = /(\d+[.,]\d{2})\s*(€|EUR)?/i;
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
    // Analyser chaque ligne
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Recherche d'un montant sur la ligne
      const amountMatch = line.match(amountRegex);
      if (amountMatch) {
        const amount = amountMatch[1].replace(',', '.');
        // Extraire la description (texte avant le montant)
        let description = line.substring(0, amountMatch.index).trim();
        if (!description && i > 0) {
          description = lines[i - 1].trim(); // Utiliser la ligne précédente comme description
        }
        // Rechercher une date
        let date;
        const dateMatch = line.match(dateRegex);
        if (dateMatch) {
          date = dateMatch[0];
          // Retirer la date de la description si elle s'y trouve
          description = description.replace(dateMatch[0], '').trim();
        }
        if (description) {
          transactions.push({
            description,
            amount,
            date
          });
        }
      }
    }
    return transactions;
  };
  // Activer la caméra pour prendre une photo
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment'
          }
        });
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Erreur d'accès à la caméra:", error);
      toast.error("Impossible d'accéder à la caméra");
      setIsCameraActive(false);
    }
  };
  // Prendre une photo avec la caméra
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convertir le canvas en image
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setPreviewImage(imageDataUrl);
        // Arrêter la caméra
        stopCamera();
      }
    }
  };
  // Arrêter la caméra
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };
  // Catégoriser les transactions avec l'IA
  const categorizeTransactions = async (transactions: ParsedTransaction[]) => {
    const items: FinancialItem[] = [];
    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount);
      if (isNaN(amount)) continue;
      let category = transaction.category || '';
      if (!category) {
        // Utiliser l'IA pour catégoriser
        try {
          category = await categorizeTransaction(transaction.description, importType, Math.abs(amount));
        } catch (error) {
          console.error('Erreur de catégorisation:', error);
          category = 'other_' + importType;
        }
      }
      const item: FinancialItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        description: transaction.description,
        value: Math.abs(amount),
        category,
        frequency: 'monthly',
        isRecurring: false
      };
      items.push(item);
    }
    setCategorizedItems(items);
  };
  // Gérer les modifications des éléments catégorisés
  const handleItemChange = (index: number, field: keyof FinancialItem, value: any) => {
    const updatedItems = [...categorizedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setCategorizedItems(updatedItems);
  };
  // Finaliser l'importation
  const finalizeImport = () => {
    onImportComplete(categorizedItems);
    toast.success(`${categorizedItems.length} éléments importés avec succès`);
    onClose();
  };
  // Réinitialiser le processus d'importation
  const resetImport = () => {
    setImportMethod(null);
    setSelectedFile(null);
    setPreviewImage(null);
    setOcrResult('');
    setParsedData([]);
    setCategorizedItems([]);
    setProgress(0);
    setStep(1);
    stopCamera();
  };
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.9
      }} className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-black/80 border border-white/10 rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="text-xl font-bold">
              Importer des{' '}
              {importType === 'income' ? 'revenus' : importType === 'expense' ? 'dépenses' : importType === 'saving' ? 'épargnes' : 'dettes'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-black/30 rounded-full">
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-5">
            {step === 1 ? <>
                {/* Sélection de la méthode d'importation */}
                {!importMethod ? <div className="space-y-6">
                    <p className="text-gray-300 mb-4">
                      Choisissez une méthode pour importer vos données
                      financières.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button onClick={() => setImportMethod('csv')} className="p-6 bg-black/30 hover:bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center transition-all">
                        <FileTextIcon className="h-10 w-10 text-indigo-400 mb-3" />
                        <span className="font-medium">Fichier CSV</span>
                        <span className="text-xs text-gray-400 mt-1">
                          Importez depuis un fichier CSV
                        </span>
                      </button>
                      <button onClick={() => setImportMethod('ocr')} className="p-6 bg-black/30 hover:bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center transition-all">
                        <CameraIcon className="h-10 w-10 text-green-400 mb-3" />
                        <span className="font-medium">Scanner un reçu</span>
                        <span className="text-xs text-gray-400 mt-1">
                          Utilisez l'appareil photo ou une image
                        </span>
                      </button>
                      <button onClick={() => setImportMethod('manual')} className="p-6 bg-black/30 hover:bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center transition-all">
                        <ReceiptIcon className="h-10 w-10 text-yellow-400 mb-3" />
                        <span className="font-medium">Saisie manuelle</span>
                        <span className="text-xs text-gray-400 mt-1">
                          Ajoutez des données manuellement
                        </span>
                      </button>
                    </div>
                  </div> : importMethod === 'csv' ?
            // Importation CSV
            <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Importer un fichier CSV</h3>
                      <button onClick={resetImport} className="text-sm text-indigo-400 hover:text-indigo-300">
                        Changer de méthode
                      </button>
                    </div>
                    <div {...getCsvRootProps()} className={`border-2 border-dashed ${selectedFile ? 'border-green-500/50' : 'border-white/20'} rounded-xl p-8 text-center cursor-pointer hover:bg-black/20 transition-colors`}>
                      <input {...getCsvInputProps()} />
                      {selectedFile ? <div className="flex flex-col items-center">
                          <CheckIcon className="h-12 w-12 text-green-500 mb-3" />
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div> : <div className="flex flex-col items-center">
                          <UploadIcon className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="font-medium">
                            Glissez-déposez votre fichier CSV ici
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            ou cliquez pour sélectionner un fichier
                          </p>
                        </div>}
                    </div>
                    {selectedFile && !isProcessing && <div className="flex justify-center">
                        <button onClick={() => parseCSVFile(selectedFile)} className={`px-6 py-3 rounded-lg bg-gradient-to-r ${themeColors.primary} text-white flex items-center`}>
                          <DatabaseIcon className="h-5 w-5 mr-2" />
                          Analyser le fichier
                        </button>
                      </div>}
                    {isProcessing && <div className="space-y-3">
                        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${themeColors.primary}`} style={{
                    width: `${progress}%`
                  }}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Analyse en cours...</span>
                          <span>{progress}%</span>
                        </div>
                      </div>}
                  </div> : importMethod === 'ocr' ?
            // Importation OCR
            <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Scanner un reçu ou une facture
                      </h3>
                      <button onClick={resetImport} className="text-sm text-indigo-400 hover:text-indigo-300">
                        Changer de méthode
                      </button>
                    </div>
                    {!isCameraActive && !previewImage ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={startCamera} className="p-6 bg-black/30 hover:bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center transition-all">
                          <CameraIcon className="h-10 w-10 text-green-400 mb-3" />
                          <span className="font-medium">Prendre une photo</span>
                          <span className="text-xs text-gray-400 mt-1">
                            Utilisez votre caméra
                          </span>
                        </button>
                        <div {...getImageRootProps()} className="p-6 bg-black/30 hover:bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer">
                          <input {...getImageInputProps()} />
                          <ImageIcon className="h-10 w-10 text-blue-400 mb-3" />
                          <span className="font-medium">
                            Importer une image
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            Sélectionnez une photo existante
                          </span>
                        </div>
                      </div> : isCameraActive ? <div className="space-y-4">
                        <div className="relative bg-black rounded-xl overflow-hidden">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex justify-center space-x-4">
                          <button onClick={stopCamera} className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 rounded-lg flex items-center">
                            <XIcon className="h-5 w-5 mr-2" />
                            Annuler
                          </button>
                          <button onClick={capturePhoto} className="px-4 py-2 bg-green-900/50 hover:bg-green-900/70 rounded-lg flex items-center">
                            <CameraIcon className="h-5 w-5 mr-2" />
                            Prendre la photo
                          </button>
                        </div>
                      </div> : previewImage ? <div className="space-y-4">
                        <div className="bg-black rounded-xl overflow-hidden">
                          <img src={previewImage} alt="Aperçu" className="w-full h-auto object-contain max-h-80" />
                        </div>
                        <div className="flex justify-center space-x-4">
                          <button onClick={() => {
                    setPreviewImage(null);
                    setSelectedFile(null);
                  }} className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 rounded-lg flex items-center">
                            <XIcon className="h-5 w-5 mr-2" />
                            Supprimer
                          </button>
                          <button onClick={processImageWithOCR} className={`px-6 py-3 rounded-lg bg-gradient-to-r ${themeColors.primary} text-white flex items-center`}>
                            <DatabaseIcon className="h-5 w-5 mr-2" />
                            Analyser l'image
                          </button>
                        </div>
                      </div> : null}
                    {isProcessing && <div className="space-y-3">
                        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${themeColors.primary}`} style={{
                    width: `${progress}%`
                  }}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Analyse OCR en cours...</span>
                          <span>{progress}%</span>
                        </div>
                      </div>}
                    {ocrResult && <div className="mt-4 p-3 bg-black/20 rounded-lg">
                        <h4 className="font-medium mb-2">Texte extrait :</h4>
                        <div className="max-h-40 overflow-y-auto text-sm whitespace-pre-line">
                          {ocrResult}
                        </div>
                      </div>}
                  </div> : importMethod === 'manual' ?
            // Saisie manuelle
            <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Saisie manuelle</h3>
                      <button onClick={resetImport} className="text-sm text-indigo-400 hover:text-indigo-300">
                        Changer de méthode
                      </button>
                    </div>
                    <p className="text-gray-300">
                      Ajoutez manuellement vos transactions une par une.
                    </p>
                    <div className="flex justify-center">
                      <button onClick={() => {
                  // Créer une transaction vide
                  setCategorizedItems([{
                    id: Date.now().toString(),
                    description: '',
                    value: 0,
                    category: '',
                    frequency: 'monthly',
                    isRecurring: false
                  }]);
                  setStep(2);
                }} className={`px-6 py-3 rounded-lg bg-gradient-to-r ${themeColors.primary} text-white flex items-center`}>
                        <ReceiptIcon className="h-5 w-5 mr-2" />
                        Créer une transaction
                      </button>
                    </div>
                  </div> : null}
              </> : step === 2 ?
          // Étape 2: Révision et validation des données
          <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Vérifier et valider les données
                  </h3>
                  <button onClick={() => setStep(1)} className="text-sm text-indigo-400 hover:text-indigo-300">
                    Retour
                  </button>
                </div>
                {categorizedItems.length > 0 ? <>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {categorizedItems.map((item, index) => <div key={index} className="p-4 bg-black/30 border border-white/10 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Description
                              </label>
                              <input type="text" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Montant
                              </label>
                              <input type="number" value={item.value} onChange={e => handleItemChange(index, 'value', parseFloat(e.target.value) || 0)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Catégorie
                              </label>
                              <select value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white">
                                <option value="">
                                  Sélectionner une catégorie
                                </option>
                                {importType === 'income' && <>
                                    <option value="salary">Salaire</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="investments">
                                      Investissements
                                    </option>
                                    <option value="rental">Location</option>
                                    <option value="other_income">
                                      Autres revenus
                                    </option>
                                  </>}
                                {importType === 'expense' && <>
                                    <option value="housing">Logement</option>
                                    <option value="food">Alimentation</option>
                                    <option value="transport">Transport</option>
                                    <option value="utilities">Factures</option>
                                    <option value="health">Santé</option>
                                    <option value="education">Éducation</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="leisure">Loisirs</option>
                                    <option value="other_expense">
                                      Autres dépenses
                                    </option>
                                  </>}
                                {importType === 'saving' && <>
                                    <option value="emergency">
                                      Fonds d'urgence
                                    </option>
                                    <option value="savings">Épargne</option>
                                    <option value="retirement">Retraite</option>
                                  </>}
                                {importType === 'debt' && <>
                                    <option value="mortgage">
                                      Crédit immobilier
                                    </option>
                                    <option value="loan">Prêt</option>
                                    <option value="credit_card">
                                      Carte de crédit
                                    </option>
                                  </>}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Fréquence
                              </label>
                              <select value={item.frequency} onChange={e => handleItemChange(index, 'frequency', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white">
                                <option value="daily">Quotidien</option>
                                <option value="weekly">Hebdomadaire</option>
                                <option value="monthly">Mensuel</option>
                                <option value="quarterly">Trimestriel</option>
                                <option value="yearly">Annuel</option>
                                <option value="once">Ponctuel</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="flex items-center">
                              <input type="checkbox" checked={item.isRecurring} onChange={e => handleItemChange(index, 'isRecurring', e.target.checked)} className="rounded bg-black/20 border-white/10 text-indigo-600 focus:ring-indigo-500/50 mr-2" />
                              <span className="text-sm">Récurrent</span>
                            </label>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button onClick={() => {
                      const updatedItems = [...categorizedItems];
                      updatedItems.splice(index, 1);
                      setCategorizedItems(updatedItems);
                    }} className="p-1.5 hover:bg-red-900/30 rounded-full">
                              <XIcon className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>)}
                    </div>
                    <div className="flex justify-between">
                      <button onClick={() => {
                  setCategorizedItems([...categorizedItems, {
                    id: Date.now().toString(),
                    description: '',
                    value: 0,
                    category: '',
                    frequency: 'monthly',
                    isRecurring: false
                  }]);
                }} className="px-4 py-2 bg-black/30 hover:bg-black/40 rounded-lg flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Ajouter une transaction
                      </button>
                      <button onClick={finalizeImport} disabled={categorizedItems.length === 0} className={`px-6 py-3 rounded-lg bg-gradient-to-r ${themeColors.primary} text-white flex items-center ${categorizedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Importer {categorizedItems.length} élément(s)
                      </button>
                    </div>
                  </> : <div className="text-center py-10">
                    <AlertCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-lg font-medium">
                      Aucune donnée à importer
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Aucune transaction n'a été détectée ou créée.
                    </p>
                    <button onClick={() => setStep(1)} className="mt-4 px-4 py-2 bg-black/30 hover:bg-black/40 rounded-lg inline-flex items-center">
                      <RefreshCwIcon className="h-5 w-5 mr-2" />
                      Réessayer
                    </button>
                  </div>}
              </div> : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}