import React, { useEffect, useState } from "react";
import axios from "axios";
import { DatePicker, Button, notification } from "antd";
import { useNavigate } from "react-router-dom";
import Chart from "../Component/chart";
import moment from "moment";

const { RangePicker } = DatePicker;

const Review = () => {
  const [reviewData, setReviewData] = useState({
    energyConsumption: [],
    pressure: [],
    force: [],
    position: [],
    timestamps: [],
  });
  const [fullData, setFullData] = useState([]); // Store all data points here
  const [authToken, setAuthToken] = useState("");
  const API_BASE = "http://localhost:5000";

  const [dateRange, setDateRange] = useState([null, null]);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
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

  const fetchData = async (startDate, endDate) => {
    try {
      console.log(`Fetching data from ${startDate} to ${endDate}`);
      const response = await axios.get(`${API_BASE}/data/filter`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { start: startDate, end: endDate },
      });

      const rawData = response.data.map((entry) => ({
        timestamp: moment(
          entry["timestamp"],
          "YYYY-MM-DD HH:mm:ss:SSS"
        ).toISOString(),
        energyConsumption: entry["Energy Consumption"].Power,
        pressure: entry["Pressure"],
        force: entry["Force"],
        position: entry["Position of the Punch"],
      }));

      rawData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const energyConsumption = rawData.map((item) => item.energyConsumption);
      const pressure = rawData.map((item) => item.pressure);
      const force = rawData.map((item) => item.force);
      const position = rawData.map((item) => item.position);
      const timestamps = rawData.map((item) => item.timestamp);

      setReviewData({
        energyConsumption,
        pressure,
        force,
        position,
        timestamps,
      });
      setFullData(rawData); // Store full data in state
    } catch (error) {
      notification.error({ message: "Failed to fetch data" });
      console.error("Fetch error:", error.response?.data || error.message);
    }
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const applyFilter = () => {
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format("YYYY-MM-DD HH:mm:ss:SSS");
      const endDate = dateRange[1].format("YYYY-MM-DD HH:mm:ss:SSS");
      fetchData(startDate, endDate);
    }
  };

  const clearFilter = () => {
    setReviewData({
      energyConsumption: [],
      pressure: [],
      force: [],
      position: [],
      timestamps: [],
    });
    setFullData([]);
  };

  useEffect(() => {
    login();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: "2vh 0",
        backgroundColor: "#121212",
      }}
    >
      <Button
        type="primary"
        onClick={() => navigate("/")}
        style={{ position: "absolute", top: "4vh", right: "4vw", zIndex: 1 }}
      >
        Go to Dashboard
      </Button>

      <h1>Raspberry Pi Review</h1>
      <h2>Data Review - Specific Past Period</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "2vh",
        }}
      >
        <RangePicker
          showTime={{ format: "HH:mm:ss" }}
          format="YYYY-MM-DD HH:mm:ss:SSS"
          value={dateRange}
          onChange={handleDateChange}
          style={{
            width: "300px",
            borderColor: "#fbfbfb",
            borderRadius: "10px",
          }}
          disabledDate={(current) => current && current > moment().endOf("day")}
        />
        <Button type="primary" onClick={applyFilter}>
          Apply Filter
        </Button>
        <Button onClick={clearFilter}>Clear Filter</Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3vw",
          width: "99vw",
          marginTop: "2vh",
          padding: "2vh 0",
        }}
      >
        <Chart
          title="Energy Consumption"
          data={reviewData.energyConsumption}
          labels={reviewData.timestamps}
          borderColor="lightblue"
          fullData={fullData}
        />
        <Chart
          title="Pressure"
          data={reviewData.pressure}
          labels={reviewData.timestamps}
          borderColor="#FF7F7F"
          fullData={fullData}
        />
        <Chart
          title="Force"
          data={reviewData.force}
          labels={reviewData.timestamps}
          borderColor="orange"
          fullData={fullData}
        />
        <Chart
          title="Position of Punch"
          data={reviewData.position}
          labels={reviewData.timestamps}
          borderColor="purple"
          fullData={fullData}
        />
      </div>
    </div>
  );
};

export default Review;
