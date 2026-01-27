"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Card, Typography } from 'antd';
import { CarOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';

const { Title } = Typography;

import BatchDetailModal from '@/components/BatchDetailModal';
import CreateBatchModal from '@/components/CreateBatchModal';

export default function LogisticsPage() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [selectedBatchNo, setSelectedBatchNo] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/logistics/batches');
            setBatches(data);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Batch No.',
            dataIndex: 'batchNo',
            key: 'batchNo',
            render: (text: string) => <span className="font-bold">{text}</span>
        },
        {
            title: 'Direction',
            dataIndex: 'direction',
            key: 'direction',
            render: (direction: string) => (
                <Tag color={direction === 'TO_HQ' ? 'orange' : 'blue'} variant="filled" className="font-bold">
                    {direction === 'TO_HQ' ? 'TO HQ' : 'TO BRANCH'}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'CREATED') color = 'blue';
                if (status === 'IN_TRANSIT') color = 'processing';
                if (status === 'RECEIVED') color = 'success';
                return <Tag color={color} variant="filled" className="font-bold">{status}</Tag>;
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => formatDate(date)
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setSelectedBatchNo(record.batchNo)}
                    className="font-medium"
                >
                    View
                </Button>
            )
        }
    ];

    return (
        <div suppressHydrationWarning>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold m-0">Logistics Management</h2>
                    <p className="text-gray-400 text-sm">Transport batches and real-time tracking</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ backgroundColor: '#E60000' }}
                    className="h-10 px-6 font-bold border-none"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Create Batch
                </Button>
            </div>

            <Card className="shadow-sm rounded-xl border-gray-100">
                <Table
                    columns={columns}
                    dataSource={batches}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 12 }}
                />
            </Card>

            <BatchDetailModal
                batchNo={selectedBatchNo}
                open={selectedBatchNo !== null}
                onCancel={() => setSelectedBatchNo(null)}
            />

            <CreateBatchModal
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    fetchBatches();
                }}
            />
        </div>
    );
}
