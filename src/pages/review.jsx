import React, { useEffect, useState } from "react";
import { DatePicker, Button } from "antd";
import { useNavigate } from "react-router-dom";
import Chart from "../Component/chart";
import moment from "moment";

const { RangePicker } = DatePicker;

const Review = () => {
  const [reviewData, setReviewData] = useState({
    energyConsumption: [],
    pressure: [],
    punch: [],
    position: [],
  });

  const [dateRange, setDateRange] = useState([null, null]);
  const navigate = useNavigate();

  // Mock function to fetch data based on date range
  const fetchData = async (startDate, endDate) => {
    try {
      // Example API call with date filtering (uncomment when API is ready)
      // const response = await fetch(`/api/review_data?start=${startDate}&end=${endDate}`);
      // const data = await response.json();

      // Mock data representing historical data based on selected dates
      const data = {
        energyConsumption: [12, 15, 13, 10, 9, 12, 11, 13, 10, 9],
        pressure: [23, 22, 24, 20, 21, 23, 22, 25, 21, 20],
        punch: [5, 6, 4, 5, 6, 5, 5, 4, 6, 5],
        position: [1, 2, 3, 4, 3, 2, 1, 2, 3, 4],
      };

      setReviewData(data);
    } catch (error) {
      console.error("Failed to fetch review data", error);
    }
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const applyFilter = () => {
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");
      fetchData(startDate, endDate); // Fetch data based on selected range
    }
  };

  useEffect(() => {
    // Initial fetch for default data on page load
    fetchData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: "2vh 0",
        backgroundColor: "#121212", // Background for better contrast
      }}
    >
      {/* Back to Home Button */}
      <Button
        type="primary"
        onClick={() => navigate("/")}
        style={{ position: "absolute", top: "4vh", right: "4vw", zIndex: 1 }}
      >
        Go to Home
      </Button>

      <h1>Raspberry Pi Review</h1>
      <h2>Data Review - Specific Past Period</h2>

      {/* Time Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2vh" }}>
        <RangePicker
          value={dateRange}
          onChange={handleDateChange}
          style={{ width: "300px" , borderColor : "#fbfbfb" , borderRadius: "10px" , border : '10px' }}
          disabledDate={(current) => current && current > moment().endOf('day')} // Disable future dates
        />
        <Button type="primary" onClick={applyFilter}>Apply Filter</Button>
      </div>

      {/* Chart Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3vw",
          width: "99vw", // Make the grid occupy more width
          marginTop: "2vh",
          padding: "2vh 0", // Add padding for spacing within the grid area
        }}
      >
        <Chart title="Energy Consumption" data={reviewData.energyConsumption} />
        <Chart title="Pressure" data={reviewData.pressure} />
        <Chart title="Punch" data={reviewData.punch} />
        <Chart title="Position of Punch" data={reviewData.position} />
      </div>
    </div>
  );
};

export default Review;
