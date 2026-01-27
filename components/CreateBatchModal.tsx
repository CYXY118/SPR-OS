"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Select, Card, App, Tag, Modal } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

const { Option } = Select;

interface CreateBatchModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function CreateBatchModal({ open, onCancel, onSuccess }: CreateBatchModalProps) {
    const [orders, setOrders] = useState([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [direction, setDirection] = useState<'TO_HQ' | 'TO_BRANCH'>('TO_HQ');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { message } = App.useApp();

    const fetchAvailableOrders = useCallback(async () => {
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
    }, [direction, message]);

    useEffect(() => {
        if (open) {
            fetchAvailableOrders();
        } else {
            setOrders([]);
            setSelectedIds([]);
        }
    }, [open, direction, fetchAvailableOrders]);

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
            onSuccess();
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
            dataIndex: 'deviceModel'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string) => (
                <Tag color="red" variant="filled" className="font-bold">
                    {status.replace(/_/g, ' ')}
                </Tag>
            )
        },
        {
            title: 'Current Branch',
            dataIndex: ['branch', 'name'],
            render: (name: string) => name || '-'
        }
    ];

    return (
        <Modal
            title={<span className="text-xl font-bold">New Transport Batch</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={850}
            destroyOnHidden
        >
            <div className="mt-6">
                <Card className="mb-6 bg-gray-50 border-none rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-700">Set Direction:</span>
                            <Select
                                value={direction}
                                onChange={setDirection}
                                style={{ width: 240 }}
                                size="large"
                                className="font-bold shadow-sm"
                            >
                                <Option value="TO_HQ">To HQ (Collection)</Option>
                                <Option value="TO_BRANCH">To Branch (Returning)</Option>
                            </Select>
                            <Tag color="red" className="ml-2 px-3 py-1 font-black rounded-md" variant="filled">
                                {orders.length} READY
                            </Tag>
                        </div>

                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            size="large"
                            style={{ backgroundColor: '#E60000' }}
                            className="h-12 px-8 font-bold border-none shadow-md"
                            onClick={handleCreate}
                            loading={submitting}
                        >
                            Save & Generate {selectedIds.length > 0 && `(${selectedIds.length})`}
                        </Button>
                    </div>
                </Card>

                <Card title={<span className="font-bold text-gray-600">Select Orders for Batch</span>} variant="borderless" className="shadow-sm rounded-xl overflow-hidden border border-gray-100">
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
                        pagination={{ pageSize: 8, hideOnSinglePage: true }}
                        size="middle"
                    />
                </Card>
            </div>
        </Modal>
    );
}
