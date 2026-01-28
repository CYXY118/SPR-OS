"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Typography, Row, Col, Divider, Statistic, App } from 'antd';
import { ToolOutlined, SaveOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

export default function DiagnosticPage() {
    const [form] = Form.useForm();
    const router = useRouter();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

    // Watch for changes to model/issue to update price
    const model = Form.useWatch('deviceModel', form);
    const issue = Form.useWatch('issueType', form);

    useEffect(() => {
        if (model && issue) {
            fetchPrice(model, issue);
        } else {
            setEstimatedPrice(null);
        }
    }, [model, issue]);

    const fetchPrice = async (model: string, issue: string) => {
        try {
            // In real app: const { data } = await api.get(`/prices?model=${model}&issue=${issue}`);
            // Mocking logic here for demonstration if backend not ready, 
            // but we should use the axios mock we set up.
            const { data } = await api.get('/prices', { params: { model, issue } });
            if (data && data.price) {
                setEstimatedPrice(data.price);
            }
        } catch (error) {
            console.error("Failed to fetch price", error);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveLead = async (values: any) => {
        setLoading(true);
        try {
            await api.post('/crm/leads', { ...values, status: 'Declined' });
            message.info('Lead saved (Customer declined repair).');
            form.resetFields();
            setEstimatedPrice(null);
        } catch {
            message.error('Failed to save lead.');
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // 1. Save to CRM first
            await api.post('/crm/leads', { ...values, status: 'Proceeding' });

            // 2. Pass data to Create Repair page via Session Storage
            sessionStorage.setItem('diagnostic_data', JSON.stringify(values));

            message.success('Proceeding to repair creation...');
            router.push('/repairs/create');
        } catch (error) {
            console.error(error);
            // If validation fails, do nothing
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center">
                <Title level={2} className="m-0">Diagnostic & Triage</Title>
            </div>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    <Card title="Customer & Device Information" className="shadow-sm rounded-xl">
                        <Form
                            form={form}
                            layout="vertical"
                            size="large"
                        >
                            <Divider>Customer Details</Divider>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="customerName" label="Full Name" rules={[{ required: true }]}>
                                        <Input placeholder="John Doe" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="customerContact" label="Contact Number" rules={[{ required: true }]}>
                                        <Input placeholder="+1 234 567 890" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="customerEmail" label="Email Address">
                                        <Input placeholder="john@example.com" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider>Device Details</Divider>
                            <Row gutter={16}>

                                <Col xs={24} sm={12}>
                                    <Form.Item name="deviceModel" label="Device Model" rules={[{ required: true }]}>
                                        <Select placeholder="Select Model">
                                            <Option value="iPhone 13">iPhone 13</Option>
                                            <Option value="iPhone 13 Pro">iPhone 13 Pro</Option>
                                            <Option value="iPhone 14">iPhone 14</Option>
                                            <Option value="Samsung S22">Samsung S22</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="issueType" label="Issue / Fault" rules={[{ required: true }]}>
                                        <Select placeholder="Select Issue">
                                            <Option value="Screen Crack">Screen Crack</Option>
                                            <Option value="Battery Replacement">Battery Replacement</Option>
                                            <Option value="Water Damage">Water Damage</Option>
                                            <Option value="Charging Port">Charging Port</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="isbn_imei" label="IMEI / Serial (Optional)">
                                        <Input placeholder="Device IMEI or Serial Number" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card className="shadow-sm rounded-xl mb-6 bg-gray-50 border-gray-200">
                        <Statistic
                            title="Estimated Repair Cost"
                            value={estimatedPrice !== null ? estimatedPrice : '--'}
                            prefix="$"
                            styles={{ content: { color: estimatedPrice ? '#cf1322' : '#999', fontWeight: 'bold' } }}
                        />
                        <Text type="secondary" className="text-xs mt-2 block">
                            *Final price may vary upon inspection.
                        </Text>
                    </Card>

                    <Card title="Actions" className="shadow-sm rounded-xl">
                        <Button
                            block
                            size="large"
                            type="primary"
                            danger
                            icon={<ToolOutlined />}
                            onClick={handleProceed}
                            className="mb-4 h-12 text-lg font-bold"
                            disabled={!model || !issue}
                        >
                            Proceed to Repair
                        </Button>
                        <Button
                            block
                            size="large"
                            icon={<SaveOutlined />}
                            onClick={() => form.validateFields().then(handleSaveLead)}
                            loading={loading}
                        >
                            Customer Declined
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
