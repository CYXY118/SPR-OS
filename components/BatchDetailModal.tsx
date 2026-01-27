import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Table, Tag, Descriptions, App, Spin, Card } from 'antd';
import { QRCodeCanvas } from 'qrcode.react';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { Typography } from 'antd';

const { Title } = Typography;

interface BatchDetailModalProps {
    batchNo: string | null;
    open: boolean;
    onCancel: () => void;
}

export default function BatchDetailModal({ batchNo, open, onCancel }: BatchDetailModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [batch, setBatch] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { message } = App.useApp();

    const fetchBatch = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/logistics/batches/${batchNo}`);
            setBatch(data);
        } catch {
            message.error('Failed to load batch details');
        } finally {
            setLoading(false);
        }
    }, [batchNo, message]);
    useEffect(() => {
        if (open && batchNo) {
            fetchBatch();
        }
    }, [open, batchNo, fetchBatch]);

    const columns = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { title: 'Order No', dataIndex: ['repairOrder', 'orderNo'], key: 'orderNo', render: (val: any) => <span className="font-bold">{val}</span> },
        { title: 'Model', dataIndex: ['repairOrder', 'deviceModel'], key: 'deviceModel' },
        {
            title: 'Current Status',
            dataIndex: ['repairOrder', 'status'],
            key: 'status',
            render: (status: string) => <Tag color="blue">{status}</Tag>
        }
    ];

    return (
        <Modal
            title={<span className="text-xl font-bold">Transport Batch Detail</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnHidden
        >
            {loading ? (
                <div className="py-20 text-center"><Spin size="large" /></div>
            ) : batch ? (
                <div className="mt-6">
                    <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
                        {/* QR Code Section */}
                        <Card className="shadow-sm border-gray-100 p-2 bg-white rounded-xl">
                            <div className="flex flex-col items-center gap-2">
                                <QRCodeCanvas
                                    value={`${window.location.origin}/scan?batchNo=${batch.batchNo}`}
                                    size={160}
                                    level="H"
                                    includeMargin={true}
                                />
                                <span className="text-[10px] font-mono text-gray-400">{batch.batchNo}</span>
                            </div>
                        </Card>

                        <div className="flex-1 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card variant="borderless" className="bg-gray-50 rounded-xl">
                                    <Descriptions column={1} styles={{ label: { color: '#888' } }}>
                                        <Descriptions.Item label="Batch Number">{batch.batchNo}</Descriptions.Item>
                                        <Descriptions.Item label="Direction">
                                            <Tag color={batch.direction === 'TO_HQ' ? 'orange' : 'blue'}>
                                                {batch.direction.replace(/_/g, ' ')}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Status">
                                            <Tag color="green" variant="filled" className="font-bold">{batch.status}</Tag>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                                <Card variant="borderless" className="bg-gray-50 rounded-xl">
                                    <Descriptions column={1} styles={{ label: { color: '#888' } }}>
                                        <Descriptions.Item label="Creator">{batch.creator?.fullName}</Descriptions.Item>
                                        <Descriptions.Item label="Created At">{formatDate(batch.createdAt)}</Descriptions.Item>
                                        <Descriptions.Item label="Total Items">{batch.items?.length || 0}</Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <Title level={4} className="mb-4">Included Repair Orders</Title>
                    <Table
                        dataSource={batch.items}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        className="rounded-lg overflow-hidden border border-gray-100"
                    />
                </div>
            ) : null}
        </Modal>
    );
}


