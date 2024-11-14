import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
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
import zoomPlugin from 'chartjs-plugin-zoom';

// Register the components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin // Register zoom plugin here
);

const Chart = ({ title, data }) => {
  const chartRef = useRef(null);

  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => i + 1),
    datasets: [
      {
        label: title,
        data: data,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: title,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy', // Allows panning in both directions
        },
        zoom: {
          wheel: {
            enabled: true, // Enables zooming with mouse wheel
          },
          pinch: {
            enabled: true, // Enables zooming with pinch gesture
          },
          mode: 'xy', // Allows zooming in both directions
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: title,
        },
      },
    },
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <Line ref={chartRef} data={chartData} options={options} />
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        shape="circle"
        onClick={handleResetZoom}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
          fontSize: '14px',
          padding: '4px',
        }}
      />
    </div>
  );
};

export default Chart;
