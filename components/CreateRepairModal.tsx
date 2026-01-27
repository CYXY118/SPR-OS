"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Modal, App } from 'antd';
import api from '@/lib/axios';

interface CreateRepairModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function CreateRepairModal({ open, onCancel, onSuccess }: CreateRepairModalProps) {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { message } = App.useApp();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await api.post('/repairs', values);
            message.success('Repair Order Created Successfully');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<span className="text-xl font-bold">New Repair Order</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnHidden
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="mt-4"
            >
                <Form.Item
                    label="Repair Order ID"
                    tooltip="System generated ID (e.g. R00001)"
                >
                    <Input placeholder="Auto-filled on save" disabled className="bg-gray-50 text-gray-400 font-mono" />
                </Form.Item>

                <Form.Item
                    name="deviceModel"
                    label="Device Model"
                    rules={[{ required: true, message: 'Please input device model' }]}
                >
                    <Input placeholder="e.g. iPhone 15 Pro Max" size="large" />
                </Form.Item>

                <Form.Item
                    name="isbn_imei"
                    label="IMEI / Serial Number"
                >
                    <Input placeholder="Optional" size="large" />
                </Form.Item>

                <Form.Item
                    name="problemDesc"
                    label="Problem Description"
                    rules={[{ required: true, message: 'Please describe the issue' }]}
                >
                    <Input.TextArea rows={4} placeholder="What is wrong with the device?" size="large" />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-8">
                    <Button onClick={onCancel} size="large">
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{ backgroundColor: '#E60000' }}
                        size="large"
                        className="px-8 font-bold"
                    >
                        Create Order
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
