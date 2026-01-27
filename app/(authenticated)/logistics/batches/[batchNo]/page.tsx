"use client";

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Descriptions, Divider, Typography, message, App, Row, Col } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CarOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';

const { Title, Text } = Typography;

export default function BatchDetailPage() {
    const [batch, setBatch] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { batchNo } = useParams();

    useEffect(() => {
        fetchBatch();
    }, [batchNo]);

    const fetchBatch = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/logistics/batches/${batchNo}`);
            setBatch(data);
        } catch (error) {
            console.error('Failed to fetch batch:', error);
            message.error('Batch not found');
        } finally {
            setLoading(false);
        }
    };

    const handlePickup = async () => {
        try {
            await api.post('/logistics/scan/pickup', { batchNo });
            message.success('Batch status updated to IN TRANSIT');
            fetchBatch();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    if (!batch) return <div className="p-6">Loading batch details...</div>;

    const columns = [
        {
            title: 'Order No.',
            dataIndex: ['repairOrder', 'orderNo'],
            key: 'orderNo',
            render: (text: string) => <span className="font-bold">{text}</span>
        },
        {
            title: 'Model',
            dataIndex: ['repairOrder', 'model'],
            key: 'model'
        },
        {
            title: 'Current Status',
            dataIndex: ['repairOrder', 'status'],
            key: 'status',
            render: (status: string) => <Tag>{status}</Tag>
        }
    ];

    return (
        <App>
            <div className="p-0">
                <div className="flex justify-between items-center mb-6">
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/logistics')} />
                        <Title level={3} style={{ margin: 0 }}>Batch Details: {batchNo}</Title>
                    </Space>
                    <Space>
                        {batch.status === 'CREATED' && (
                            <Button
                                type="primary"
                                icon={<CarOutlined />}
                                onClick={handlePickup}
                                className="bg-black"
                            >
                                Mark as Pickup (In Transit)
                            </Button>
                        )}
                    </Space>
                </div>

                <Row gutter={16}>
                    <Col span={24}>
                        <Card variant="borderless" className="mb-6">
                            <Descriptions title="Transport Information" bordered>
                                <Descriptions.Item label="SPR ID">{batch.batchNo}</Descriptions.Item>
                                <Descriptions.Item label="Direction">
                                    <Tag color={batch.direction === 'TO_HQ' ? 'orange' : 'blue'}>
                                        {batch.direction === 'TO_HQ' ? 'To HQ' : 'To Branch'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Current Status">
                                    <Tag color={batch.status === 'CREATED' ? 'blue' : 'green'}>{batch.status}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Creator">{batch.creator?.fullName}</Descriptions.Item>
                                <Descriptions.Item label="Date">{formatDate(batch.createdAt)}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Repairs in this Batch" variant="borderless">
                            <Table
                                dataSource={batch.items}
                                columns={columns}
                                rowKey="id"
                                pagination={false}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </App>
    );
}
