"use client";

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingUser, setEditingUser] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (e) {
            console.error(e);
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (values: any) => {
        try {
            if (editingUser) {
                // Update
                await api.patch(`/users/${editingUser.id}`, values);
                message.success('User updated');
            } else {
                // Create
                await api.post('/users', values);
                message.success('User created');
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingUser(null);
            fetchUsers();
        } catch (e: unknown) {
            console.error(e);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error((e as any).response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/users/${id}`);
            message.success('User deleted');
            fetchUsers();
        } catch {
            message.error('Failed to delete');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => <Tag color="blue">{role}</Tag>
        },
        { title: 'Branch ID', dataIndex: 'branchId', key: 'branchId' },
        {
            title: 'Actions',
            key: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingUser(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    />
                    <Popconfirm title="Delete user?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Management</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingUser(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                    style={{ backgroundColor: '#E60000' }}
                >
                    Add User
                </Button>
            </div>

            <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />

            <Modal
                title={editingUser ? "Edit User" : "Create User"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                        <Input readOnly={!!editingUser} />
                    </Form.Item>
                    <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label={editingUser ? "New Password (Leave blank to keep current)" : "Password"}
                        rules={[{ required: !editingUser }]}
                    >
                        <Input.Password placeholder={editingUser ? "Enter new password if you want to change it" : ""} />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="SUPER_ADMIN">Super Admin</Select.Option>
                            <Select.Option value="HQ_ADMIN">HQ Admin</Select.Option>
                            <Select.Option value="BRANCH_ADMIN">Branch Admin</Select.Option>
                            <Select.Option value="TECHNICIAN">Technician</Select.Option>
                            <Select.Option value="COURIER">Courier</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="branchId" label="Branch ID (Optional)">
                        <Input type="number" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}
