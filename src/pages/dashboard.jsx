import React, { useState, useRef } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import Chart from "../Component/chart";

const MAX_POINTS = 200;

const DashboardPage = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [wsData, setWsData] = useState({
    energyConsumption: { values: [], timestamps: [] },
    pressure: { values: [], timestamps: [] },
    force: { values: [], timestamps: [] },
    position: { values: [], timestamps: [] },
  });

  const navigate = useNavigate();
  const wsRef = useRef(null);
  const apiKey = "e57972d26910e9d9e4caf68fd941c775"; // Store the API key here
  const API_BASE = "http://127.0.0.1:5000";
  let authToken = "";

  const login = async () => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        username: "chin",
        password: "1234",
      });
      authToken = response.data.access_token;
    } catch (error) {
      notification.error({ message: "Login failed" });
    }
  };

  const toggleStatus = () => {
    const newStatus = !isWorking;
    setIsWorking(newStatus);

    if (newStatus) {
      // Connect to WebSocket on Start
      setWsData({
        energyConsumption: { values: [], timestamps: [] },
        pressure: { values: [], timestamps: [] },
        force: { values: [], timestamps: [] },
        position: { values: [], timestamps: [] },
      });
      wsRef.current = new WebSocket("ws://technest.ddns.net:8001/ws");

      wsRef.current.onopen = () => {
        console.log("Connected to WebSocket");
        wsRef.current.send(apiKey);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(data);
          const timestamp = new Date().toISOString(); // Generate current timestamp

          setWsData((prevData) => ({
            energyConsumption: {
              values:
                prevData.energyConsumption.values.length >= MAX_POINTS
                  ? []
                  : [
                      ...prevData.energyConsumption.values,
                      data["Energy Consumption"].Power,
                    ],
              timestamps:
                prevData.energyConsumption.timestamps.length >= MAX_POINTS
                  ? []
                  : [...prevData.energyConsumption.timestamps, timestamp],
            },
            pressure: {
              values:
                prevData.pressure.values.length >= MAX_POINTS
                  ? []
                  : [...prevData.pressure.values, data.Pressure],
              timestamps:
                prevData.pressure.timestamps.length >= MAX_POINTS
                  ? []
                  : [...prevData.pressure.timestamps, timestamp],
            },
            force: {
              values:
                prevData.force.values.length >= MAX_POINTS
                  ? []
                  : [...prevData.force.values, data.Force],
              timestamps:
                prevData.force.timestamps.length >= MAX_POINTS
                  ? []
                  : [...prevData.force.timestamps, timestamp],
            },
            position: {
              values:
                prevData.position.values.length >= MAX_POINTS
                  ? []
                  : [
                      ...prevData.position.values,
                      data["Position of the Punch"],
                    ],
              timestamps:
                prevData.position.timestamps.length >= MAX_POINTS
                  ? []
                  : [...prevData.position.timestamps, timestamp],
            },
          }));
        } catch (error) {
          console.error("Error parsing WebSocket message:", error, event.data);
        }
      };

      wsRef.current.onclose = () => {
        console.log("Disconnected from WebSocket");
      };
    } else {
      // Close WebSocket on Stop
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        console.log("WebSocket closed");
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundColor: "#121212",
      }}
    >
      {/* Navigation buttons */}
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
      <h2>Status: {isWorking ? "Retrieving Data..." : "Not working"}</h2>
      <button onClick={toggleStatus}>{isWorking ? "Stop" : "Start"}</button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1vw",
          minWidth: "98vw",
          minHeight: "95vh",
          marginTop: "2vh",
          padding: "1vh 1vw",
          marginLeft: "3vw",
        }}
      >
        <Chart
          title="Energy Consumption (Power)"
          data={wsData.energyConsumption.values}
          labels={wsData.energyConsumption.timestamps}
          borderColor="lightblue"
        />
        <Chart
          title="Pressure"
          data={wsData.pressure.values}
          labels={wsData.pressure.timestamps}
          borderColor="#FF7F7F"
        />
        <Chart
          title="Force"
          data={wsData.force.values}
          labels={wsData.force.timestamps}
          borderColor="orange"
        />
        <Chart
          title="Position of Punch"
          data={wsData.position.values}
          labels={wsData.position.timestamps}
          borderColor="purple"
        />
      </div>
    </div>
  );
};

export default DashboardPage;
