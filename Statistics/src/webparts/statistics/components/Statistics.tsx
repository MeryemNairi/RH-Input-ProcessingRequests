import * as React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Statistics: React.FC = () => {

  const dataLine = {
    labels: ['Attestation de travail', 'Attestation de salaire', 'Domiciliation irrévocable de salaire', 'Attestation de congé', 'Borderaux de CNSS', 'Attestation de travail', 'Attestation de travail'],
    datasets: [
      {
        label: 'Jours de juin',
        data: [10, 13, 15, 18, 19, 13, 8],
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };


  const labelCounts: { [key: string]: number } = dataLine.labels.reduce((counts: { [key: string]: number }, label: string) => {
    if (counts[label]) {
      counts[label] += 1;
    } else {
      counts[label] = 1;
    }
    return counts;
  }, {});


  const mostFrequentLabel = Object.keys(labelCounts).reduce((a, b) => labelCounts[a] > labelCounts[b] ? a : b);
  const mostFrequentCount = labelCounts[mostFrequentLabel];


  const barChartData = {
    labels: Object.keys(labelCounts),
    datasets: [
      {
        label: 'Fréquence des demandes',
        data: Object.values(labelCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'category' as const,
        position: 'bottom' as const,
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div>
      <h2>Résultats des demandes de RH pour le mois de juin</h2>

      {/* Graphique en ligne */}
      <Line data={dataLine} options={options} />

      <div style={{ marginTop: '20px' }}>
        <h3>Fréquence des demandes :</h3>
        {/* Graphique en barres */}
        <Bar data={barChartData} options={options} />
      </div>

      <div>
        <h3>Demande la plus demandée :</h3>
        <p>{mostFrequentLabel} ({mostFrequentCount} fois)</p>
      </div>
    </div>
  );
};

export default Statistics;
