import React from 'react';
import { Table, Card, Typography, Button } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const columns = [
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
    align: 'center',
    sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    defaultSortOrder: 'ascend', // Set default sorting order for this column
  },
  {
    title: 'Filename',
    dataIndex: 'filename',
    key: 'filename',
    align: 'center',
    sorter: (a, b) => a.filename.localeCompare(b.filename),
    render: (text, record) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span>{text}</span>
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record.filename)}
        />
      </div>
    ),
  },
  {
    title: 'MFCC',
    dataIndex: 'mfcc',
    key: 'mfcc',
    align: 'center',
    sorter: (a, b) => a.mfcc - b.mfcc,
  },
  {
    title: 'FFT',
    dataIndex: 'fft',
    key: 'fft',
    align: 'center',
    sorter: (a, b) => a.fft - b.fft,
  },
  {
    title: 'Predict',
    dataIndex: 'result',
    key: 'result',
    align: 'center',
    filters: [
      { text: 'N', value: 'N' },
      { text: 'F', value: 'F' },
    ],
    onFilter: (value, record) => record.result === value,
    render: (text) => (
      <span style={{ color: text === 'N' ? 'green' : 'red' }}>{text}</span>
    ),
  },
];

const data = [
  { key: '1', timestamp: '2023-11-01 10:00:00', filename: 'file1.wav', mfcc: -0.0945, fft: 20.18, result: 'N' },
  { key: '2', timestamp: '2023-11-01 10:05:00', filename: 'file2.wav', mfcc: -0.1194, fft: 18.87, result: 'N' },
  { key: '3', timestamp: '2023-11-01 10:10:00', filename: 'file3.wav', mfcc: -0.0165, fft: 23.79, result: 'F' },
  { key: '4', timestamp: '2023-11-01 10:15:00', filename: 'file4.wav', mfcc: -0.0755, fft: 17.99, result: 'F' },
  { key: '5', timestamp: '2023-11-01 10:20:00', filename: 'file5.wav', mfcc: -0.1634, fft: 17.37, result: 'F' },
  { key: '6', timestamp: '2023-11-01 10:25:00', filename: 'file6.wav', mfcc: -0.1734, fft: 12.29, result: 'F' },
  { key: '7', timestamp: '2023-11-01 10:30:00', filename: 'file7.wav', mfcc: -0.0987, fft: 19.56, result: 'N' },
  { key: '8', timestamp: '2023-11-01 10:35:00', filename: 'file8.wav', mfcc: -0.1283, fft: 21.03, result: 'F' },
  { key: '9', timestamp: '2023-11-01 10:40:00', filename: 'file9.wav', mfcc: -0.0321, fft: 15.78, result: 'N' },
  { key: '10', timestamp: '2023-11-01 10:45:00', filename: 'file10.wav', mfcc: -0.1235, fft: 18.67, result: 'N' },
  { key: '11', timestamp: '2023-11-01 10:50:00', filename: 'file11.wav', mfcc: -0.0456, fft: 16.44, result: 'F' },
  { key: '12', timestamp: '2023-11-01 10:55:00', filename: 'file12.wav', mfcc: -0.0972, fft: 22.56, result: 'N' },
  { key: '13', timestamp: '2023-11-01 11:00:00', filename: 'file13.wav', mfcc: -0.1624, fft: 17.22, result: 'F' },
  { key: '14', timestamp: '2023-11-01 11:05:00', filename: 'file14.wav', mfcc: -0.1425, fft: 20.11, result: 'F' },
  { key: '15', timestamp: '2023-11-01 11:10:00', filename: 'file15.wav', mfcc: -0.1133, fft: 19.45, result: 'N' },
  { key: '16', timestamp: '2023-11-01 11:15:00', filename: 'file16.wav', mfcc: -0.1321, fft: 18.90, result: 'F' },
  { key: '17', timestamp: '2023-11-01 11:20:00', filename: 'file17.wav', mfcc: -0.1045, fft: 20.07, result: 'N' },
  { key: '18', timestamp: '2023-11-01 11:25:00', filename: 'file18.wav', mfcc: -0.1534, fft: 15.96, result: 'F' },
  { key: '19', timestamp: '2023-11-01 11:30:00', filename: 'file19.wav', mfcc: -0.1178, fft: 19.99, result: 'N' },
  { key: '20', timestamp: '2023-11-01 11:35:00', filename: 'file20.wav', mfcc: -0.0894, fft: 22.01, result: 'F' },
  { key: '21', timestamp: '2023-11-01 11:40:00', filename: 'file18.wav', mfcc: -0.1534, fft: 15.96, result: 'F' },
  { key: '22', timestamp: '2023-11-01 11:45:00', filename: 'file19.wav', mfcc: -0.1178, fft: 19.99, result: 'N' },
  { key: '23', timestamp: '2023-11-01 11:50:00', filename: 'file20.wav', mfcc: -0.0894, fft: 22.01, result: 'F' },
];

const MyTable = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/'); // Navigate to the dashboard route
  };

  const handleDownload = (filename) => {
    // Replace this URL with the actual download API endpoint
    const url = `http://localhost:5000/download_wav/${filename}`;
    window.open(url, '_blank'); // Opens the download link in a new tab
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <Card
        style={{
          minWidth: '95vw',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToDashboard}
          style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1 }}
        >
          Dashboard
        </Button>

        <Title level={2} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Data Table
        </Title>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          bordered
          style={{ marginTop: '1rem' }}
        />
      </Card>
    </div>
  );
};

export default MyTable;
