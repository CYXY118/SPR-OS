"use client";

import React, { useEffect, useState } from 'react';
import { Table, Button, Select, Card, message, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const { Option } = Select;

export default function CreateBatchPage() {
    const [orders, setOrders] = useState([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [direction, setDirection] = useState<'TO_HQ' | 'TO_BRANCH'>('TO_HQ');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchAvailableOrders = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/repairs');
                // Filter based on direction
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const filtered = data.filter((order: any) => {
                    if (direction === 'TO_HQ') {
                        return order.status === 'IN_BRANCH';
                    } else {
                        return order.status === 'REPAIRED' || order.status === 'REPAIR_FAILED';
                    }
                });
                setOrders(filtered);
                setSelectedIds([]); // Reset selection when direction changes
            } catch (error) {
                console.error('Failed to fetch orders:', error);
                message.error('Failed to load available orders');
            } finally {
                setLoading(false);
            }
        };
        fetchAvailableOrders();
    }, [direction]);

    const handleCreate = async () => {
        if (selectedIds.length === 0) {
            message.warning('Please select at least one order');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/logistics/batches', {
                ids: selectedIds,
                direction
            });
            message.success('Transport batch created successfully');
            router.push('/logistics');
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error((error as any).response?.data?.message || 'Failed to create batch');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Order No.',
            dataIndex: 'orderNo',
            render: (text: string) => <span className="font-bold">{text}</span>
        },
        {
            title: 'Model',
            dataIndex: 'model'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string) => <Tag>{status}</Tag>
        },
        {
            title: 'Current Branch',
            dataIndex: 'branch',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (branch: any) => branch?.name || '-'
        }
    ];

    return (
        <div className="max-w-5xl mx-auto py-2" suppressHydrationWarning>
            <div className="flex items-center gap-4 mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    type="text"
                    className="hover:bg-gray-100"
                />
                <h2 className="text-2xl font-bold m-0">New Transport Batch</h2>
            </div>

            <Card className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-700">Direction:</span>
                        <Select
                            value={direction}
                            onChange={setDirection}
                            style={{ width: 240 }}
                            size="large"
                        >
                            <Option value="TO_HQ">To HQ (Collection)</Option>
                            <Option value="TO_BRANCH">To Branch (Returning)</Option>
                        </Select>
                        <Tag color="red" className="ml-2 px-3 py-1 font-bold">
                            {orders.length} Available
                        </Tag>
                    </div>

                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        size="large"
                        style={{ backgroundColor: '#E60000' }}
                        className="h-12 px-8 font-bold border-none"
                        onClick={handleCreate}
                        loading={submitting}
                    >
                        Save & Generate SPR {selectedIds.length > 0 && `(${selectedIds.length})`}
                    </Button>
                </div>
            </Card>

            <Card title="Select Items for Batch">
                <Table
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectedIds,
                        onChange: (keys) => setSelectedIds(keys as number[])
                    }}
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15, hideOnSinglePage: true }}
                />
            </Card>
        </div>
    );
}
