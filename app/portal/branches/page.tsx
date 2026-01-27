"use client";

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, App, Tag, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined, ShopOutlined, EditOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

export default function BranchesPage() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingBranch, setEditingBranch] = useState<any>(null);
    const [form] = Form.useForm();
    const { message } = App.useApp();

    useEffect(() => {
        fetchBranches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/branches');
            setBranches(data);
        } catch {
            message.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (values: any) => {
        try {
            if (editingBranch) {
                await api.patch(`/branches/${editingBranch.id}`, values);
                message.success('Branch updated');
            } else {
                await api.post('/branches', values);
                message.success('Branch created');
            }
            setIsModalOpen(false);
            setEditingBranch(null);
            form.resetFields();
            fetchBranches();
        } catch (e: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error((e as any).response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/branches/${id}`);
            message.success('Branch deleted');
            fetchBranches();
        } catch {
            message.error('Failed to delete');
        }
    };

    const columns = [
        {
            title: 'No.',
            key: 'index',
            width: 70,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, __: any, index: number) => index + 1
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (text: string, record: any) => (
                <Space>
                    <span className="font-mono font-bold">{text}</span>
                    {record.isHQ && <Tag color="red">HQ</Tag>}
                </Space>
            )
        },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Address', dataIndex: 'address', key: 'address' },
        {
            title: 'Staff Count',
            dataIndex: ['_count', 'users'],
            key: 'usersCount',
            render: (count: number) => count || 0
        },
        {
            title: 'Actions',
            key: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingBranch(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    />
                    <Popconfirm title="Delete branch?" description="This action cannot be undone." onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Branch Management</h2>
                    <p className="text-gray-500">Manage all store locations</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingBranch(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                    className="bg-black text-white hover:bg-gray-800"
                >
                    Add Branch
                </Button>
            </div>

            <Table
                dataSource={branches}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingBranch ? "Edit Branch" : "Add New Branch"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingBranch(null);
                }}
                footer={null}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Branch Name"
                        rules={[{ required: true, message: 'Example: Johor Bahru Central' }]}
                    >
                        <Input placeholder="Enter branch name" prefix={<ShopOutlined />} />
                    </Form.Item>
                    <Form.Item
                        name="code"
                        label="Branch Code"
                        rules={[{ required: true, message: 'Example: JB01' }]}
                    >
                        <Input placeholder="Enter unique code (e.g. JB01)" className="font-mono" />
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input.TextArea rows={2} placeholder="Full address" />
                    </Form.Item>
                    <Form.Item name="isHQ" valuePropName="checked">
                        <Checkbox>Mark as Headquarters (HQ)</Checkbox>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block className="bg-black">
                        {editingBranch ? 'Update Branch' : 'Create Branch'}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}
