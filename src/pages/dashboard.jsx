import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import Chart from "../Component/chart";

const DashboardPage = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [wsData, setWsData] = useState({
    energyConsumption: [],
    pressure: [],
    force: [],
    position: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const ws = new WebSocket("ws://your-websocket-url");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setWsData((prevData) => ({
        energyConsumption: [
          ...prevData.energyConsumption,
          data.energyConsumption,
        ].slice(-10),
        pressure: [...prevData.pressure, data.pressure].slice(-10),
        punch: [...prevData.punch, data.punch].slice(-10),
        position: [...prevData.position, data.position].slice(-10),
      }));
      setIsWorking(data.status === "working");
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => ws.close();
  }, []);

  const toggleStatus = () => {
    const newStatus = !isWorking;
    setIsWorking(newStatus);

    // Send status change to WebSocket
    const wsMessage = JSON.stringify({ action: newStatus ? "start" : "stop" });
    ws.send(wsMessage);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        padding: "2vh 0",
        backgroundColor: "#121212", // Set a background color for better contrast
      }}
    >
      {/* Button for navigating to table page */}
      <Button
        type="primary"
        onClick={() => navigate("/table")}
        style={{ position: "absolute", top: "4vh", right: "4vw", zIndex: 1 }}
      >
        Go to Table
      </Button>

      <Button
        type="primary"
        onClick={() => navigate("/review")}
        style={{ position: "absolute", top: "4vh", left: "4vw", zIndex: 1 }}
      >
        Review
      </Button>

      <h1>CRMA DASHBOARD</h1>
      <h2>Status: {isWorking ? "Working" : "Stopped"}</h2>
      <button onClick={toggleStatus}>{isWorking ? "Stop" : "Start"}</button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3vw",
          width: "90vw", // Make the grid occupy more width
          maxWidth: "1200px", // Add a maximum width to prevent excessive stretching
          marginTop: "2vh",
          padding: "2vh 0", // Add padding for spacing within the grid area
        }}
      >
        <Chart title="Energy Consumption" data={wsData.energyConsumption} />
        <Chart title="Pressure" data={wsData.pressure} />
        <Chart title="Force" data={wsData.force} />
        <Chart title="Position of Punch" data={wsData.position} />
      </div>
    </div>
  );
};

export default DashboardPage;
