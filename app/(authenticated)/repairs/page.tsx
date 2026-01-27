"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Space, Input } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { ColumnType } from 'antd/es/table';

interface RepairOrder {
    id: number;
    orderNo: string;
    deviceModel: string;
    problemDesc: string;
    status: string;
    branch?: { name: string };
    technician?: { fullName: string };
    createdAt: string;
}


import RepairDetailModal from '@/components/RepairDetailModal';

export default function RepairsList() {
    const [data, setData] = useState<RepairOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Modal states
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const fetchRepairs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/repairs');
            setData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepairs();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_BRANCH': return 'blue';
            case 'REPAIRED': return 'green';
            case 'REPAIR_FAILED': return 'red';
            case 'COMPLETED': return 'gray';
            case 'UNDER_REPAIR': return 'orange';
            default: return 'default';
        }
    };

    const columns: ColumnType<RepairOrder>[] = [
        {
            title: 'Order No',
            dataIndex: 'orderNo',
            key: 'orderNo',
            render: (text) => <span className="font-bold">{text}</span>
        },
        {
            title: 'Device',
            dataIndex: 'deviceModel',
            key: 'deviceModel',
        },
        {
            title: 'Branch',
            dataIndex: ['branch', 'name'],
            key: 'branch',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)} key={status} variant="filled" className="font-medium">
                    {status.replace(/_/g, ' ')}
                </Tag>
            ),
        },
        {
            title: 'Technician',
            dataIndex: ['technician', 'fullName'],
            key: 'technician',
            render: (text) => text || '-',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => setSelectedOrderId(record.id)}
                        className="text-blue-600 font-medium"
                    >
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    const filteredData = data.filter((item) => {
        const search = searchText.toLowerCase();
        return (
            item.orderNo.toLowerCase().includes(search) ||
            item.deviceModel.toLowerCase().includes(search) ||
            item.branch?.name.toLowerCase().includes(search)
        );
    });

    return (
        <div suppressHydrationWarning>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Repair Orders</h2>
                <Space size="large">
                    <Input.Search
                        placeholder="Search order no or device..."
                        allowClear
                        onSearch={(value) => setSearchText(value)}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 340 }}
                        className="rounded-lg"
                    />

                </Space>
            </div>

            <Card className="shadow-sm rounded-xl border-gray-100">
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 12 }}
                />
            </Card>

            {/* Modals */}


            <RepairDetailModal
                orderId={selectedOrderId}
                open={selectedOrderId !== null}
                onCancel={() => setSelectedOrderId(null)}
                onActionSuccess={fetchRepairs}
            />
        </div>
    );
}
