import React, { useState } from "react";
import axios from "axios";
import { Button, Input, message } from "antd";

const UploadWavFile = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "audio/wav") {
      setFile(selectedFile);
    } else {
      message.error("Please select a valid .wav file");
    }
  };

  const uploadFile = async () => {
    if (!file) {
      message.warning("Please select a .wav file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token"); // Assuming JWT token is stored in local storage after login
      const response = await axios.post(
        "http://localhost:5000/upload_wav",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token for authentication
          },
        }
      );
      message.success(response.data.message || "File uploaded successfully");
      setFile(null);
    } catch (error) {
      message.error(error.response?.data?.error || "File upload failed");
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Upload WAV File</h1>
      <Input
        type="file"
        accept=".wav"
        onChange={handleFileChange}
        style={{ marginBottom: "10px" }}
      />
      <Button
        type="primary"
        onClick={uploadFile}
        loading={uploading}
        disabled={!file}
      >
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  );
};

export default UploadWavFile;
