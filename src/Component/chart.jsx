import React, { useRef, useState } from "react";
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
import { Button, Modal } from "antd";
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

const Chart = ({ title, data, labels, borderColor = "rgba(75,192,192,1)", fullData }) => {
  const chartRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: borderColor,
        backgroundColor: "rgba(75,192,192,0.1)",
        borderWidth: 2,
        pointBackgroundColor: borderColor,
        pointBorderColor: borderColor,
        pointRadius: 3,
        fill: false,
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
          stepSize: 5,
          displayFormats: {
            second: "HH:mm:ss",
          },
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
    onClick: (event) => {
      const points = chartRef.current?.getElementsAtEventForMode(event, "nearest", { intersect: true }, false);
      if (points.length) {
        const pointIndex = points[0].index;
        setSelectedData(fullData[pointIndex]);
        setIsModalVisible(true);
      }
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
      
      {/* Modal to display data */}
      <Modal
        title="Data Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <pre>{JSON.stringify(selectedData, null, 2)}</pre>
      </Modal>
    </div>
  );
};

export default Chart;
