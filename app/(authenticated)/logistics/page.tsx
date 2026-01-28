"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Grid, List, Space } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';



import BatchDetailModal from '@/components/BatchDetailModal';
import CreateBatchModal from '@/components/CreateBatchModal';

export default function LogisticsPage() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [selectedBatchNo, setSelectedBatchNo] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const screens = Grid.useBreakpoint();

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    className="hidden md:block"
                    style={{ display: screens.xs ? 'none' : 'block' }}
                />

                {/* Mobile View */}
                {screens.xs && (
                    <List
                        dataSource={batches}
                        loading={loading}
                        renderItem={(batch: any) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    onClick={() => setSelectedBatchNo(batch.batchNo)}
                                    className="w-full shadow-sm border-gray-100 mb-2"
                                    size="small"
                                    title={<span className="font-bold">{batch.batchNo}</span>}
                                    extra={
                                        <Tag color={batch.direction === 'TO_HQ' ? 'orange' : 'blue'}>
                                            {batch.direction === 'TO_HQ' ? 'TO HQ' : 'TO BRANCH'}
                                        </Tag>
                                    }
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <Tag color={batch.status === 'RECEIVED' ? 'success' : 'processing'}>{batch.status}</Tag>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="text-xs text-gray-400 mt-1">{formatDate(batch.createdAt)}</span>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
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
