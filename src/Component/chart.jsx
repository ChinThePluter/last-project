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

// Register necessary Chart.js modules and plugins
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

const Chart = ({ title, data, labels, borderColor = "rgba(75,192,192,1)" }) => {
  // Reference for the chart instance
  const chartRef = useRef(null);

  const chartData = {
    labels, // Use datetime labels
    datasets: [
      {
        label: title,
        data: data,
        borderColor: borderColor, // Use the borderColor prop for dynamic color
        backgroundColor: "rgba(75,192,192,0.1)", // Optional fill for visibility
        borderWidth: 2, // Set line thickness
        pointBackgroundColor: borderColor, // Point color matching line color
        pointBorderColor: borderColor,
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
          mode: "x", // Pan only along the x-axis
        },
        zoom: {
          wheel: {
            enabled: true, // Enable zooming with mouse wheel
          },
          pinch: {
            enabled: true, // Enable pinch zooming for touch devices
          },
          mode: "x", // Zoom only along the x-axis
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "second",
          stepSize: 5,
          displayFormats: {
            second: "HH:mm:ss",
          },
          tooltipFormat: "yyyy-MM-dd HH:mm:ss.SSS", // Include milliseconds in tooltip
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
    animation: {
      y: 0,
      duration: 1,
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
          top: "2vh",
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
