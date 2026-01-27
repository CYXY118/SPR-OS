"use client";

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, App } from 'antd';
import { DeleteOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

export default function PortalUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingUser, setEditingUser] = useState<any>(null);
    const [form] = Form.useForm();
    const { message } = App.useApp();

    // Fetch Branches for dropdown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [branches, setBranches] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchBranches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch {
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const { data } = await api.get('/branches');
            setBranches(data);
        } catch {
            console.error('Failed to load branches');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (values: any) => {
        // Convert branchId to int if present
        if (values.branchId) values.branchId = parseInt(values.branchId);

        try {
            if (editingUser) {
                await api.patch(`/users/${editingUser.id}`, values);
                message.success('User updated');
            } else {
                await api.post('/users', values);
                message.success('User created');
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingUser(null);
            fetchUsers();
        } catch (e: unknown) {
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
        {
            title: 'No.',
            key: 'index',
            width: 60,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, __: any, index: number) => index + 1
        },
        { title: 'Username', dataIndex: 'username', key: 'username', render: (text: string) => <span className="font-semibold">{text}</span> },
        { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                let color = 'blue';
                if (role === 'SUPER_ADMIN') color = 'gold';
                if (role === 'TECHNICIAN') color = 'cyan';
                return <Tag color={color}>{role}</Tag>;
            }
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (branch: any) => branch ? <Tag>{branch.code}</Tag> : <span className="text-gray-400">-</span>
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
                            setEditingUser(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    />
                    <Popconfirm title="Delete user?" onConfirm={() => handleDelete(record.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredUsers = users.filter((u: any) =>
        u.username.toLowerCase().includes(searchText.toLowerCase()) ||
        u.fullName.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-gray-500">Manage system access and roles</p>
                </div>
                <Space>
                    <Input.Search
                        placeholder="Search username or name..."
                        allowClear
                        onSearch={setSearchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => {
                            setEditingUser(null);
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                        className="bg-black"
                    >
                        Add User
                    </Button>
                </Space>
            </div>

            <Table dataSource={filteredUsers} columns={columns} rowKey="id" loading={loading} />

            <Modal
                title={editingUser ? "Edit User" : "Create User"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                        <Input readOnly={!!editingUser} disabled={!!editingUser} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={editingUser ? "New Password" : "Password"}
                        rules={[{ required: !editingUser }]}
                        help={editingUser ? "Leave blank to keep current password" : ""}
                    >
                        <Input.Password placeholder={editingUser ? "********" : ""} />
                    </Form.Item>

                    <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                            <Select placeholder="Select role">
                                <Select.Option value="SUPER_ADMIN">Super Admin</Select.Option>
                                <Select.Option value="HQ_ADMIN">HQ Admin</Select.Option>
                                <Select.Option value="BRANCH_ADMIN">Branch Admin</Select.Option>
                                <Select.Option value="TECHNICIAN">Technician</Select.Option>
                                <Select.Option value="COURIER">Courier</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="branchId" label="Branch">
                            <Select placeholder="Select branch" allowClear>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {branches.map((b: any) => (
                                    <Select.Option key={b.id} value={b.id}>
                                        {b.code} - {b.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Button type="primary" htmlType="submit" block className="bg-black mt-2">
                        {editingUser ? 'Update User' : 'Create User'}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}
