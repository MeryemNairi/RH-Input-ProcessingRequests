import * as React from 'react';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Chart from 'chart.js/auto';

const options = [
  'Attestation de travail',
  'Attestation de salaire',
  'Domicialisation irrévocable de salaire',
  'Attestation de congé',
  'Attestation de salaire annuelle',
  'Borderaux de CNSS',
  'Attestation de titularisation',
  'Bulletins de paie cachetés',
];

const Statistics: React.FC = () => {
  const [, setData] = useState<{ [key: string]: Date }>({});

  useEffect(() => {
    fetchDataFromExcel();
  }, []);

  const fetchDataFromExcel = async () => {
    try {
      const response = await fetch('https://cnexia.sharepoint.com/sites/CnexiaForEveryone/Shared%20Documents/Requests.ods');
      const data = await response.arrayBuffer();

      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

      const chartData: { [key: string]: Date } = {};

      options.forEach(option => chartData[option] = new Date()); // Initialiser les dates à aujourd'hui par défaut

      jsonData.forEach((item: any) => {
        const offreTitle = item.offre_title as string;
        if (options.includes(offreTitle)) {
          chartData[offreTitle] = new Date(item.deadline); // Convertir la date en objet Date
        }
      });

      setData(chartData);
      renderChart(chartData);
    } catch (error) {
      console.error('Error fetching data from Excel:', error);
    }
  };

  const renderChart = (chartData: { [key: string]: Date }) => {
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found.');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Unable to get 2d context of canvas.');
      return;
    }

    if (typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: options,
          datasets: [{
            label: 'Date de clôture',
            data: options.map(option => chartData[option] || new Date()),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: {
              type: 'time', // Définir l'axe y comme étant de type 'time' pour les dates
              time: {
                unit: 'day', // Unité de temps (jour, mois, année, etc.)
              },
              // min: Définir la date minimale si nécessaire
              // max: Définir la date maximale si nécessaire
            },
          },
        },
      });
    } else {
      console.error('Chart.js n\'est pas chargé correctement.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Statistiques des demandes par titre</h2>
      <canvas id="chart" width={800} height={400}></canvas>
    </div>
  );
};

export default Statistics;
