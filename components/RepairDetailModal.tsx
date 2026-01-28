"use client";

import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Timeline, Button, Modal, Form, Select, Input, App, Spin, Space, Popconfirm } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

interface RepairDetailModalProps {
    orderId: number | null;
    open: boolean;
    onCancel: () => void;
    onActionSuccess: () => void;
}

export default function RepairDetailModal({ orderId, open, onCancel, onActionSuccess }: RepairDetailModalProps) {
    const { user, hasRole } = useAuth();
    const { message } = App.useApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [technicians, setTechnicians] = useState<any[]>([]);

    const fetchOrder = React.useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/repairs/${orderId}`);
            setOrder(data);
        } catch {
            message.error('Failed to load order');
        } finally {
            setLoading(false);
        }
    }, [orderId, message]);
    useEffect(() => {
        if (open && orderId) {
            fetchOrder();
        } else {
            setOrder(null);
        }
    }, [open, orderId, fetchOrder]);

    const loadTechnicians = async () => {
        try {
            const { data } = await api.get('/users');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setTechnicians(data.filter((u: any) => u.role === 'TECHNICIAN'));
        } catch (e) {
            console.error(e);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAction = async (action: string, payload: any = {}) => {
        setActionLoading(true);
        try {
            if (action === 'assign') {
                await api.patch(`/repairs/${orderId}/assign`, payload);
                setIsAssignModalOpen(false);
            } else if (action === 'start') {
                await api.patch(`/repairs/${orderId}/start`);
            } else if (action === 'complete') {
                await api.patch(`/repairs/${orderId}/complete`);
            } else if (action === 'fail') {
                await api.patch(`/repairs/${orderId}/fail`, payload);
                setIsFailModalOpen(false);
            }
            message.success('Action successful');
            fetchOrder();
            onActionSuccess();
        } catch (e: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error((e as any).response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Modal
            title={<span className="text-xl font-bold">Repair Details #{order?.orderNo}</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width="100%"
            style={{ maxWidth: '850px', top: '20px' }}
            destroyOnHidden
        >
            {loading ? (
                <div className="py-20 text-center"><Spin size="large" /></div>
            ) : order ? (
                <div className="mt-6">
                    <div className="flex justify-end mb-6">
                        <Space>
                            {hasRole(['HQ_ADMIN', 'SUPER_ADMIN']) && order.status === 'AT_HQ' && (
                                <Button type="primary" size="large" style={{ backgroundColor: '#E60000' }} onClick={() => { setIsAssignModalOpen(true); loadTechnicians(); }}>
                                    Assign Technician
                                </Button>
                            )}

                            {hasRole(['TECHNICIAN']) && order.status === 'ASSIGNED_TO_TECHNICIAN' && user?.id === order.technicianId && (
                                <Button type="primary" size="large" style={{ backgroundColor: '#E60000' }} onClick={() => handleAction('start')}>
                                    Start Repair
                                </Button>
                            )}

                            {hasRole(['TECHNICIAN']) && order.status === 'UNDER_REPAIR' && user?.id === order.technicianId && (
                                <>
                                    <Popconfirm title="Mark as Fixed?" onConfirm={() => handleAction('complete')}>
                                        <Button type="primary" size="large" style={{ backgroundColor: 'green' }}>Complete Repair</Button>
                                    </Popconfirm>
                                    <Button danger size="large" onClick={() => setIsFailModalOpen(true)}>Mark Failed</Button>
                                </>
                            )}
                        </Space>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <Card title="Device Information" variant="borderless" className="bg-gray-50 rounded-xl">
                                <Descriptions column={2} styles={{ label: { fontWeight: 'bold' } }}>
                                    <Descriptions.Item label="Device Model">{order.deviceModel}</Descriptions.Item>
                                    <Descriptions.Item label="IMEI / SN">{order.isbn_imei || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Issue Description" span={2}>{order.problemDesc}</Descriptions.Item>
                                    <Descriptions.Item label="Internal Status">
                                        <Tag color="red" variant="filled" className="font-bold">{order.status}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Technician">{order.technician?.fullName || 'Not Assigned'}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </div>
                        <div>
                            <Card title="Flow History" variant="borderless" className="bg-gray-50 rounded-xl">
                                <div className="px-2 py-2">
                                    <Timeline
                                        items={order.history?.map((log: any) => ({
                                            color: log.toStatus === 'REPAIR_FAILED' ? 'red' : 'blue',
                                            icon: log.isScanAction ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
                                            children: (
                                                <div className="flex flex-col md:flex-row md:items-start gap-4 -mt-1 pb-4">
                                                    <div className="min-w-[150px] pt-0.5">
                                                        <span className="text-gray-400 font-bold text-sm block">{formatDate(log.createdAt)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-base m-0 text-gray-800 leading-tight">
                                                            {log.toStatus.replace(/_/g, ' ')}
                                                        </p>
                                                        <p className="text-gray-500 text-sm m-0 mt-1">
                                                            {log.remark || 'Status updated'} by <span className="text-gray-700 font-semibold">{log.user?.fullName}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        }))}
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Sub Modals */}
                    <Modal title="Assign Technician" open={isAssignModalOpen} onCancel={() => setIsAssignModalOpen(false)} footer={null} destroyOnHidden>
                        <Form onFinish={(vals) => handleAction('assign', vals)} layout="vertical" className="mt-4">
                            <Form.Item name="technicianId" label="Select Technician" rules={[{ required: true }]}>
                                <Select placeholder="Select a tech..." size="large">
                                    {technicians.map(t => (
                                        <Select.Option key={t.id} value={t.id}>{t.fullName} ({t.username})</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={actionLoading} block size="large" style={{ backgroundColor: '#E60000' }}>Confirm Assignment</Button>
                        </Form>
                    </Modal>

                    <Modal title="Report Repair Failure" open={isFailModalOpen} onCancel={() => setIsFailModalOpen(false)} footer={null} destroyOnHidden>
                        <Form onFinish={(vals) => handleAction('fail', vals)} layout="vertical" className="mt-4">
                            <Form.Item name="reason" label="Failure Reason" rules={[{ required: true }]}>
                                <Input.TextArea rows={4} placeholder="Why this device cannot be fixed?" size="large" />
                            </Form.Item>
                            <Button danger type="primary" htmlType="submit" loading={actionLoading} block size="large">Confirm Failure</Button>
                        </Form>
                    </Modal>
                </div>
            ) : null}
        </Modal>
    );
}
