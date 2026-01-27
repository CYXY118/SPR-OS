"use client";

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, ShopOutlined, ToolOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

export default function PortalDashboard() {
    // Simple placeholder dashboard for the admin portal
    const [stats, setStats] = useState({ branches: 0, users: 0, activeRepairs: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats({
                    branches: data.totalBranches || 0,
                    users: data.totalUsers || 0,
                    activeRepairs: data.totalDevices || 0
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div suppressHydrationWarning>
            <h2 className="text-2xl font-bold mb-6">System Overview</h2>
            <Row gutter={16}>
                <Col span={8}>
                    <Card variant="borderless" className="bg-blue-50">
                        <Statistic
                            title="Total Branches"
                            value={stats.branches}
                            prefix={<ShopOutlined />}
                            styles={{ content: { color: '#1890ff' } }}
                        />
                        <div className="text-gray-400 text-xs mt-2">Active Locations</div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="bg-green-50">
                        <Statistic
                            title="Total Users"
                            value={stats.users}
                            prefix={<UserOutlined />}
                            styles={{ content: { color: '#52c41a' } }}
                        />
                        <div className="text-gray-400 text-xs mt-2">Active Staff Accounts</div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="bg-red-50">
                        <Statistic
                            title="System Load"
                            value={stats.activeRepairs}
                            prefix={<ToolOutlined />}
                            styles={{ content: { color: '#f5222d' } }}
                        />
                        <div className="text-gray-400 text-xs mt-2">Active Jobs</div>
                    </Card>
                </Col>
            </Row>

            <div className="mt-8">
                <Card title="Quick Actions" variant="borderless">
                    <p className="text-gray-500">Select a module from the sidebar to start managing the system.</p>
                </Card>
            </div>
        </div>
    );
}
