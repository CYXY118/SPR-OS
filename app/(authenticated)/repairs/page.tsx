"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Input, Grid } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { ColumnType } from 'antd/es/table';
import RepairDetailModal from '@/components/RepairDetailModal';

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

export default function RepairsList() {
    const [data, setData] = useState<RepairOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

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
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setSelectedOrderId(record.id)}
                >
                    View
                </Button>
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
            {/* Page Header - stacks on mobile */}
            <div className={`mb-4 ${isMobile ? '' : 'flex justify-between items-center mb-6'}`}>
                <h2 className={`font-bold m-0 ${isMobile ? 'text-xl mb-3' : 'text-2xl'}`}>Repair Orders</h2>
                <Input.Search
                    placeholder="Search..."
                    allowClear
                    onSearch={(value) => setSearchText(value)}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: isMobile ? '100%' : 300 }}
                />
            </div>

            {/* Desktop Table */}
            {!isMobile && (
                <Card className="shadow-sm rounded-xl border-gray-100">
                    <Table
                        columns={columns}
                        dataSource={filteredData}
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
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No orders found</div>
                    ) : (
                        filteredData.map((item) => (
                            <Card
                                key={item.id}
                                hoverable
                                onClick={() => setSelectedOrderId(item.id)}
                                size="small"
                                className="shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-base">{item.orderNo}</span>
                                    <Tag color={getStatusColor(item.status)} className="ml-2">
                                        {item.status.replace(/_/g, ' ')}
                                    </Tag>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Device:</span>
                                        <span className="font-medium">{item.deviceModel}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Branch:</span>
                                        <span>{item.branch?.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Date:</span>
                                        <span className="text-gray-500 text-xs">{formatDate(item.createdAt)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            <RepairDetailModal
                orderId={selectedOrderId}
                open={selectedOrderId !== null}
                onCancel={() => setSelectedOrderId(null)}
                onActionSuccess={fetchRepairs}
            />
        </div>
    );
}

