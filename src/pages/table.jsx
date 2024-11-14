import React from 'react';
import { Table, Card, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const columns = [
  {
    title: 'MFCC',
    dataIndex: 'mfcc',
    key: 'mfcc',
    align: 'center',
  },
  {
    title: 'FFT',
    dataIndex: 'fft',
    key: 'fft',
    align: 'center',
  },
  {
    title: 'Result',
    dataIndex: 'result',
    key: 'result',
    align: 'center',
    render: (text) => (
      <span style={{ color: text === 'N' ? 'green' : 'red' }}>{text}</span>
    ),
  },
];

const data = [
  { key: '1', mfcc: -0.0945, fft: 20.18, result: 'N' },
  { key: '2', mfcc: -0.1194, fft: 18.87, result: 'N' },
  { key: '3', mfcc: -0.0165, fft: 23.79, result: 'F' },
  { key: '4', mfcc: -0.0755, fft: 17.99, result: 'F' },
  { key: '5', mfcc: -0.1634, fft: 17.37, result: 'F' },
  { key: '6', mfcc: -0.1734, fft: 12.29, result: 'F' },
  { key: '7', mfcc: -0.0987, fft: 19.56, result: 'N' },
  { key: '8', mfcc: -0.1283, fft: 21.03, result: 'F' },
  { key: '9', mfcc: -0.0321, fft: 15.78, result: 'N' },
  { key: '10', mfcc: -0.1235, fft: 18.67, result: 'N' },
  { key: '11', mfcc: -0.0456, fft: 16.44, result: 'F' },
  { key: '12', mfcc: -0.0972, fft: 22.56, result: 'N' },
  { key: '13', mfcc: -0.1624, fft: 17.22, result: 'F' },
  { key: '14', mfcc: -0.1425, fft: 20.11, result: 'F' },
  { key: '15', mfcc: -0.1133, fft: 19.45, result: 'N' },
  { key: '16', mfcc: -0.1321, fft: 18.90, result: 'F' },
  { key: '17', mfcc: -0.1045, fft: 20.07, result: 'N' },
  { key: '18', mfcc: -0.1534, fft: 15.96, result: 'F' },
  { key: '19', mfcc: -0.1178, fft: 19.99, result: 'N' },
  { key: '20', mfcc: -0.0894, fft: 22.01, result: 'F' },
];

const MyTable = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/'); // Navigate to the dashboard route
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        // backgroundColor: '#f0f2f5',
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
