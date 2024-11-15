import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, notification, Select } from "antd";
import { useNavigate } from "react-router-dom";
import Chart from "../Component/chart";
import axios from "axios";

const MAX_POINTS = 200;

const DashboardPage = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [wsData, setWsData] = useState({
    energyConsumption: { values: [], timestamps: [] },
    pressure: { values: [], timestamps: [] },
    force: { values: [], timestamps: [] },
    position: { values: [], timestamps: [] },
  });
  const [piStatus, setPiStatus] = useState("stopped");
  const [isConsoleVisible, setIsConsoleVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  const navigate = useNavigate();
  const wsRef = useRef(null);
  const API_KEY = "piadmin"; // Store the API key here
  const WS_KEY = "b494dcdf28532e5c28fa69056c3b9223";
  const API_BASE = "http://192.168.1.108:5000";
  const API_SERVER = "http://localhost:5000";
  const [authToken, setAuthToken] = useState("");
  const statusStyles = {
    started: { color: "green", fontSize: "2em", fontWeight: "bold" },
    stopped: { color: "orange", fontSize: "2em", fontWeight: "bold" },
    error: { color: "red", fontSize: "2em", fontWeight: "bold" },
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.value);
  };

  const login = async () => {
    try {
      const response = await axios.post(`${API_SERVER}/login`, {
        username: "admin",
        password: "admin",
      });
      setAuthToken(response.data.access_token);
    } catch (error) {
      notification.error({
        message: "Login failed",
        description: error.message,
      });
    }
  };

  const fetchFileList = async () => {
    try {
      const response = await axios.get(`${API_SERVER}/list_files`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setFileList(response.data.files);
    } catch (error) {
      console.error("Error fetching status:", error);
      setPiStatus("error");
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.post(`${API_BASE}/fetch_and_download`, filename , {
        headers: { "X-API-KEY": API_KEY },
      });
    } catch (error) {
      console.error("Error fetching status:", error);
      setPiStatus("error");
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/status`, {
        headers: { "X-API-KEY": API_KEY },
      });
      setPiStatus(response.data.state);
    } catch (error) {
      console.error("Error fetching status:", error);
      setPiStatus("error");
    }
  };

  const handleCommand = async (command) => {
    try {
      const { data } = await axios.post(
        `${API_BASE}/${command}`,
        {},
        {
          headers: { "X-API-KEY": API_KEY },
        }
      );
      notification.success({ message: `Raspberry Pi ${command}ed` });
    } catch {
      notification.error({ message: `Failed to ${command} Raspberry Pi` });
    }
  };

  useEffect(() => {
    login();
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchFileList();
    }
  }, [authToken]);

  useEffect(() => {
    fetchStatus(); // Initial fetch on mount

    const intervalId = setInterval(fetchStatus, 5000); // Fetch every 5 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

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
        wsRef.current.send(WS_KEY);
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

      <h1>CRMA ALPHA DASHBOARD</h1>
      <Modal
        title="Raspberry Pi Console"
        open={isConsoleVisible}
        onCancel={() => setIsConsoleVisible(false)}
        footer={null}
      >
        <Button key="stop" type="danger" onClick={() => handleCommand("stop")}>
          Stop
        </Button>
        <Button
          key="start"
          type="primary"
          onClick={() => handleCommand("start")}
        >
          Start
        </Button>
        <h2 style={statusStyles[piStatus]}>Status: {piStatus}</h2>
        <p>
          Use the buttons below to make the Raspberry Pi download selected wav
          file.
        </p>
        <div style={{ marginTop: "20px" }}>
          <label
            htmlFor="fileDropdown"
            style={{ color: "white", marginRight: "10px" }}
          >
            Select a file:
          </label>
          <Select
            id="fileDropdown"
            value={selectedFile}
            onChange={handleFileSelect}
            placeholder="Select a File"
            style={{ width: 200, marginRight: "10px" }}
          >
            {Array.isArray(fileList) &&
              fileList.map((file, index) => (
                <Select.Option key={index} value={file}>
                  {file}
                </Select.Option>
              ))}
          </Select>
          <Button
            // onClick={handleDownload}
            onClick={() => console.log(fileList)}
            type="primary"
            // disabled={!selectedFile}
          >
            Download
          </Button>
        </div>
      </Modal>
      <h2 style={statusStyles[piStatus]}>Status: {piStatus}</h2>
      <Button
        onClick={() => setIsConsoleVisible(true)}
        type="primary"
        // disabled={piStatus === "error"}
      >
        Open Console
      </Button>
      <h2>WebSocket : {isWorking ? "Retrieving Data..." : "Not working"}</h2>
      <button onClick={toggleStatus} style={{ borderColor: "white" }}>
        {isWorking ? "Stop WebSocket" : "Start WebSocket"}
      </button>

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
