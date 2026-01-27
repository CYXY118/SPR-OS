"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Divider, App } from 'antd';
import { UserOutlined, ShopOutlined, AlertOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function CreateRepairOrder() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [form] = Form.useForm();
    const { message } = App.useApp();

    useEffect(() => {
        // Check for data from Diagnostic page
        const diagnosticData = sessionStorage.getItem('diagnostic_data');
        if (diagnosticData) {
            try {
                const parsedData = JSON.parse(diagnosticData);
                form.setFieldsValue({
                    ...parsedData,
                    // Map diagnostic fields if names differ, but they match our design
                });
                message.success('Data imported from Diagnostic session');
                // Optional: Clear it so it doesn't persist on refresh unintentionally, 
                // but keeping it might be safer for refresh. remove it after submit.
            } catch (e) {
                console.error("Failed to parse diagnostic data", e);
            }
        }
    }, [form, message]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await api.post('/repairs', values);
            message.success('Repair Order Created Successfully');

            // Clear diagnostic session data on success
            sessionStorage.removeItem('diagnostic_data');

            router.push('/repairs');
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto" suppressHydrationWarning>
            <h2 className="text-2xl font-bold mb-6">New Repair Order</h2>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Divider><UserOutlined /> Customer Information</Divider>
                    <Form.Item
                        name="customerName"
                        label="Customer Name"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Customer Name" />
                    </Form.Item>
                    <Form.Item
                        name="customerContact"
                        label="Contact Number"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Phone Number" />
                    </Form.Item>
                    <Form.Item
                        name="customerEmail"
                        label="Email Address"
                    >
                        <Input placeholder="Email (Optional)" />
                    </Form.Item>

                    <Divider><ShopOutlined /> Device Information</Divider>
                    <Form.Item
                        label="Repair Order ID"
                        tooltip="System generated ID"
                    >
                        <Input placeholder="System Generated (Auto-filled)" disabled className="bg-gray-100 text-gray-500 font-mono" />
                    </Form.Item>

                    <Form.Item
                        name="deviceModel"
                        label="Device Model"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="e.g. iPhone 13 Pro" />
                    </Form.Item>

                    <Form.Item
                        name="isbn_imei"
                        label="IMEI / Serial Number"
                    >
                        <Input placeholder="Optional" />
                    </Form.Item>

                    <Divider><AlertOutlined /> Issue Details</Divider>
                    <Form.Item
                        name="issueType"
                        label="Primary Issue"
                    >
                        <Input placeholder="e.g. Screen Crack" />
                    </Form.Item>

                    <Form.Item
                        name="problemDesc"
                        label="Detailed Description"

                    >
                        <Input.TextArea rows={4} placeholder="Describe the issue..." />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: '#E60000' }} block size="large">
                            Confirm & Create Order
                        </Button>
                        <Button type="default" className="mt-2" block onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
