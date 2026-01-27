"use client";

import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Timeline, Button, Modal, Form, Select, Input, message, Spin, Space, Popconfirm } from 'antd';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function RepairDetails() {
    const { id } = useParams();
    // const router = useRouter(); // Removed unused router
    const { user, hasRole } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Modals
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [technicians, setTechnicians] = useState<any[]>([]); // Need an API for this
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/repairs/${id}`);
                setOrder(data);
            } catch (e) {
                console.error(e);
                message.error('Failed to load order');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    const loadTechnicians = async () => {
        // We need an endpoint to list technicians. 
        // For MVP, if we don't have it, we might need to add it or just input ID manually?
        // Design Spec says: "Assign to Technician".
        // Let's assume we can fetch users by role or list all users.
        // I implemented `UsersController.findAll` but restricted to HQ/Super.
        // If current user is HQ, they can fetch list.
        try {
            const { data } = await api.get('/users');
            // Filter frontend side or backend side? Backend `findAll` returns all users.
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
                await api.patch(`/repairs/${id}/assign`, payload);
                setIsAssignModalOpen(false);
            } else if (action === 'start') {
                await api.patch(`/repairs/${id}/start`);
            } else if (action === 'complete') {
                await api.patch(`/repairs/${id}/complete`);
            } else if (action === 'fail') {
                await api.patch(`/repairs/${id}/fail`, payload);
                setIsFailModalOpen(false);
            }
            message.success('Action successful');
            // We need to re-fetch order here.
            // But fetchOrder is defined inside useEffect if we moved it.
            // So we can either move it out (and wrap in useCallback) or reload page.
            // Let's reload for simplicity or use a trigger.
            window.location.reload();
        } catch (e: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error((e as any).response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading || !order) return <Spin className="block mx-auto mt-10" />;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Order #{order.orderNo}</h2>
                <Space>
                    {/* HQ Actions */}
                    {hasRole(['HQ_ADMIN', 'SUPER_ADMIN']) && order.status === 'AT_HQ' && (
                        <Button type="primary" onClick={() => { setIsAssignModalOpen(true); loadTechnicians(); }}>
                            Assign Technician
                        </Button>
                    )}

                    {/* Technician Actions */}
                    {hasRole(['TECHNICIAN']) && order.status === 'ASSIGNED_TO_TECHNICIAN' && user?.id === order.technicianId && (
                        <Button type="primary" onClick={() => handleAction('start')}>
                            Start Repair
                        </Button>
                    )}

                    {hasRole(['TECHNICIAN']) && order.status === 'UNDER_REPAIR' && user?.id === order.technicianId && (
                        <>
                            <Popconfirm title="Confirm Success?" onConfirm={() => handleAction('complete')}>
                                <Button type="primary" style={{ backgroundColor: 'green' }}>Mark Repaired</Button>
                            </Popconfirm>
                            <Button danger onClick={() => setIsFailModalOpen(true)}>Mark Failed</Button>
                        </>
                    )}
                </Space>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                    <Card title="Device Info" className="mb-6">
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Model">{order.deviceModel}</Descriptions.Item>
                            <Descriptions.Item label="IMEI/SN">{order.isbn_imei || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Problem">{order.problemDesc}</Descriptions.Item>
                            <Descriptions.Item label="Branch">{order.branch?.name}</Descriptions.Item>
                            <Descriptions.Item label="Status"><Tag color="blue">{order.status}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Technician">{order.technician?.fullName || 'Unassigned'}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>

                <div className="col-span-1">
                    <Card title="History">
                        <Timeline
                            mode="start"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            items={order.history?.map((log: any) => ({
                                color: log.toStatus === 'REPAIR_FAILED' ? 'red' : 'blue',
                                icon: log.isScanAction ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
                                title: <span className="font-bold text-xs">{formatDate(log.createdAt)}</span>,
                                content: (
                                    <>
                                        <p className="font-semibold m-0">{log.toStatus.replace(/_/g, ' ')}</p>
                                        <p className="text-gray-500 text-xs m-0">{log.remark} by {log.user?.fullName}</p>
                                    </>
                                )
                            }))}
                        />
                    </Card>
                </div>
            </div>

            {/* Assign Modal */}
            <Modal
                title="Assign Technician"
                open={isAssignModalOpen}
                onCancel={() => setIsAssignModalOpen(false)}
                footer={null}
            >
                <Form onFinish={(vals) => handleAction('assign', vals)} layout="vertical">
                    <Form.Item name="technicianId" label="Select Technician" rules={[{ required: true }]}>
                        <Select placeholder="Choose one...">
                            {technicians.map(t => (
                                <Select.Option key={t.id} value={t.id}>{t.fullName} ({t.username})</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={actionLoading} block>Assign</Button>
                </Form>
            </Modal>

            {/* Fail Modal */}
            <Modal
                title="Mark Repair Failed"
                open={isFailModalOpen}
                onCancel={() => setIsFailModalOpen(false)}
                footer={null}
            >
                <Form onFinish={(vals) => handleAction('fail', vals)} layout="vertical">
                    <Form.Item name="reason" label="Failure Reason" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} placeholder="Why cannot be repaired?" />
                    </Form.Item>
                    <Button danger type="primary" htmlType="submit" loading={actionLoading} block>Confirm Failed</Button>
                </Form>
            </Modal>
        </div>
    );
}
