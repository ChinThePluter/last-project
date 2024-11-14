import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const Chart = ({ title, data, labels }) => {
  // Using useRef to reference the chart instance
  const chartRef = useRef(null);

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: "rgba(75,192,192,1)", // Set line color explicitly
        backgroundColor: "rgba(75,192,192,0.1)", // Optional fill for better visibility
        borderWidth: 2, // Set line thickness
        pointBackgroundColor: "rgba(75,192,192,1)", // Color for data points
        pointBorderColor: "rgba(75,192,192,1)", // Border color for data points
        pointRadius: 3, // Radius of points on the line
        fill: false, // Disable fill under the line if not needed
        tension: 0.1,
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
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "second",
          tooltipFormat: "yyyy-MM-dd HH:mm:ss.SSS",
        },
        title: {
          display: true,
          text: "Time",
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

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div style={{ width: "100%", height: "300px", position: "relative" }}>
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        shape="square"
        onClick={resetZoom}
        style={{
          position: "absolute",
          top: "wvh",
          left: "2vw",
          zIndex: 1,
        }}
      >
        Zoom Reset
      </Button>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default Chart;
