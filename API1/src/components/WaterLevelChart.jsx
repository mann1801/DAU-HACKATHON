import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WaterLevelChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3>Water Level Chart</h3>
        <p>No data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => format(new Date(item.time), 'HH:mm')),
    datasets: [
      {
        label: 'Actual Water Level (ft)',
        data: data.map(item => item.waterLevel),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Predicted Water Level (ft)',
        data: data.map(item => item.prediction),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Water Level Over Time (Last 24 Hours)',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Water Level (feet)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  return (
    <div className="card">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WaterLevelChart;
