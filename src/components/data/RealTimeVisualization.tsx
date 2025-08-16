import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { FinancialItem } from '../../types/finance';
interface RealTimeVisualizationProps {
  financialData: {
    incomes: FinancialItem[];
    expenses: FinancialItem[];
    savings: FinancialItem[];
    debts: FinancialItem[];
  };
  activeTab: 'income' | 'expense' | 'saving' | 'debt';
  newItem?: FinancialItem | null;
}
export function RealTimeVisualization({
  financialData,
  activeTab,
  newItem
}: RealTimeVisualizationProps) {
  const [chartData, setChartData] = useState<{
    name: string;
    value: number;
  }[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [impact, setImpact] = useState<{
    percentage: number;
    isPositive: boolean;
  } | null>(null);
  // Préparer les données pour le graphique
  useEffect(() => {
    const prepareData = () => {
      let items: FinancialItem[] = [];
      let colorPalette: string[] = [];
      switch (activeTab) {
        case 'income':
          items = financialData.incomes;
          colorPalette = ['#4ade80', '#34d399', '#10b981', '#059669', '#047857'];
          break;
        case 'expense':
          items = financialData.expenses;
          colorPalette = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b'];
          break;
        case 'saving':
          items = financialData.savings;
          colorPalette = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'];
          break;
        case 'debt':
          items = financialData.debts;
          colorPalette = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'];
          break;
      }
      // Calculer le total
      const sum = items.reduce((acc, item) => {
        const value = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
        return acc + (isNaN(value) ? 0 : value);
      }, 0);
      setTotal(sum);
      // Grouper par catégorie
      const grouped: Record<string, number> = {};
      items.forEach(item => {
        const category = item.category;
        const value = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
        if (!isNaN(value)) {
          grouped[category] = (grouped[category] || 0) + value;
        }
      });
      // Convertir en format pour le graphique
      const data = Object.entries(grouped).map(([name, value]) => ({
        name,
        value
      }));
      // Trier par valeur décroissante
      data.sort((a, b) => b.value - a.value);
      setChartData(data);
      // Générer assez de couleurs
      const generatedColors = data.map((_, index) => colorPalette[index % colorPalette.length]);
      setColors(generatedColors);
      // Calculer l'impact du nouvel élément s'il existe
      if (newItem) {
        const newValue = typeof newItem.value === 'string' ? parseFloat(newItem.value) : newItem.value;
        if (!isNaN(newValue) && sum > 0) {
          const impactPercentage = newValue / sum * 100;
          setImpact({
            percentage: impactPercentage,
            isPositive: activeTab === 'income' || activeTab === 'saving'
          });
        } else {
          setImpact(null);
        }
      } else {
        setImpact(null);
      }
    };
    prepareData();
  }, [financialData, activeTab, newItem]);
  // Si aucune donnée, afficher un message
  if (chartData.length === 0) {
    return <div className="h-40 flex items-center justify-center">
        <p className="text-gray-400 text-sm">
          Ajoutez des données pour voir la visualisation
        </p>
      </div>;
  }
  return <div className="p-4 bg-black/20 rounded-lg">
      <h3 className="text-sm font-medium mb-2">Impact en temps réel</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} dataKey="value" label={({
            name,
            percent
          }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {impact && <motion.div initial={{
      opacity: 0,
      scale: 0.8
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      type: 'spring',
      stiffness: 300,
      damping: 20
    }} className={`mt-2 p-2 rounded-lg ${impact.isPositive ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
          <p className="text-xs">
            {impact.isPositive ? <>
                Cette entrée représente{' '}
                <span className="font-bold text-green-400">
                  {impact.percentage.toFixed(1)}%
                </span>{' '}
                de votre total
              </> : <>
                Cette dépense représente{' '}
                <span className="font-bold text-red-400">
                  {impact.percentage.toFixed(1)}%
                </span>{' '}
                de votre total
              </>}
          </p>
        </motion.div>}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-400">
          Total:{' '}
          <span className="font-bold">{total.toLocaleString('fr-FR')}€</span>
        </p>
      </div>
    </div>;
}