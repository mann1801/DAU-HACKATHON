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
  Filler
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
  Legend,
  Filler
);

const StormIntensityChart = ({ storm, historicalData = [] }) => {
  if (!storm) return null;

  // Create mock historical data if none provided
  const mockHistoricalData = historicalData.length > 0 ? historicalData : [
    { timestamp: new Date(Date.now() - 24*60*60*1000), wind_speed_knots: storm.wind_speed_knots - 20, pressure_mb: storm.pressure_mb + 15 },
    { timestamp: new Date(Date.now() - 18*60*60*1000), wind_speed_knots: storm.wind_speed_knots - 15, pressure_mb: storm.pressure_mb + 10 },
    { timestamp: new Date(Date.now() - 12*60*60*1000), wind_speed_knots: storm.wind_speed_knots - 10, pressure_mb: storm.pressure_mb + 5 },
    { timestamp: new Date(Date.now() - 6*60*60*1000), wind_speed_knots: storm.wind_speed_knots - 5, pressure_mb: storm.pressure_mb + 2 },
    { timestamp: new Date(), wind_speed_knots: storm.wind_speed_knots, pressure_mb: storm.pressure_mb }
  ];

  const labels = mockHistoricalData.map(data => 
    format(new Date(data.timestamp), 'MMM dd HH:mm')
  );

  const windData = mockHistoricalData.map(data => data.wind_speed_knots);
  const pressureData = mockHistoricalData.map(data => data.pressure_mb);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Wind Speed (knots)',
        data: windData,
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Pressure (mb)',
        data: pressureData,
        borderColor: '#3742fa',
        backgroundColor: 'rgba(55, 66, 250, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${storm.storm_name} - Intensity Trend`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Wind')) {
              return `${label}: ${value} kt (${(value * 1.15078).toFixed(0)} mph)`;
            } else if (label.includes('Pressure')) {
              return `${label}: ${value} mb`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Wind Speed (knots)',
          color: '#ff6b6b'
        },
        grid: {
          color: 'rgba(255, 107, 107, 0.1)'
        },
        ticks: {
          color: '#ff6b6b'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Pressure (mb)',
          color: '#3742fa'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#3742fa',
          // Invert pressure scale (lower pressure at top)
          callback: function(value) {
            return value;
          }
        },
        reverse: true
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="storm-intensity-chart">
      <div style={{ height: '300px', width: '100%' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StormIntensityChart;
