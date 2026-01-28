"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Grid } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import BatchDetailModal from '@/components/BatchDetailModal';
import CreateBatchModal from '@/components/CreateBatchModal';

export default function LogisticsPage() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, record: any) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setSelectedBatchNo(record.batchNo)}
                >
                    View
                </Button>
            )
        }
    ];

    return (
        <div suppressHydrationWarning>
            {/* Page Header - stacks on mobile */}
            <div className={`mb-4 ${isMobile ? '' : 'flex justify-between items-center mb-6'}`}>
                <div className={isMobile ? 'mb-3' : ''}>
                    <h2 className={`font-bold m-0 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Logistics</h2>
                    {!isMobile && <p className="text-gray-400 text-sm m-0">Transport batches and real-time tracking</p>}
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ backgroundColor: '#E60000' }}
                    className={`font-bold border-none ${isMobile ? 'w-full h-10' : 'h-10 px-6'}`}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Create Batch
                </Button>
            </div>

            {/* Desktop Table */}
            {!isMobile && (
                <Card className="shadow-sm rounded-xl border-gray-100">
                    <Table
                        columns={columns}
                        dataSource={batches}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 12 }}
                    />
                </Card>
            )}

            {/* Mobile Cards */}
            {isMobile && (
                <div className="flex flex-col gap-3">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading...</div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No batches found</div>
                    ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        batches.map((batch: any) => (
                            <Card
                                key={batch.id}
                                hoverable
                                onClick={() => setSelectedBatchNo(batch.batchNo)}
                                size="small"
                                className="shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-base">{batch.batchNo}</span>
                                    <Tag color={batch.direction === 'TO_HQ' ? 'orange' : 'blue'} className="ml-2">
                                        {batch.direction === 'TO_HQ' ? 'TO HQ' : 'TO BRANCH'}
                                    </Tag>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Status:</span>
                                        <Tag color={batch.status === 'RECEIVED' ? 'success' : 'processing'} className="m-0">
                                            {batch.status}
                                        </Tag>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Date:</span>
                                        <span className="text-gray-500 text-xs">{formatDate(batch.createdAt)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

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

