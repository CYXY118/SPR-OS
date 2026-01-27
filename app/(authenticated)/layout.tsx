"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, App as AntdApp } from 'antd';
import {
    ToolOutlined,
    CarOutlined,
    LogoutOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';

const { Header, Sider, Content } = Layout;

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            // eslint-disable-next-line
            setUser(JSON.parse(storedUser));
        }
    }, []);
    const pathname = usePathname();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <AntdApp>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light">
                    <div className="demo-logo-vertical" style={{ height: 64, margin: 16, background: '#E60000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        {collapsed ? 'SPR' : 'SPR ERP'}
                    </div>
                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[pathname]}
                        onClick={({ key }) => {
                            if (key === 'logout') handleLogout();
                            else router.push(key);
                        }}
                        items={[
                            {
                                key: '/diagnostic',
                                icon: <MedicineBoxOutlined />,
                                label: 'Diagnostic',
                            },
                            {
                                key: '/repairs',
                                icon: <ToolOutlined />,
                                label: 'Repairs',
                            },
                            {
                                key: '/logistics',
                                icon: <CarOutlined />,
                                label: 'Logistics',
                            },
                            {
                                key: 'logout',
                                icon: <LogoutOutlined />,
                                label: 'Logout',
                                danger: true,
                            }
                        ]}
                    />
                </Sider>
                <Layout>
                    <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24, paddingLeft: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {user && (
                                <div style={{ fontWeight: '600', color: '#555', fontSize: '14px' }}>
                                    Current ID: <span style={{ color: '#E60000' }}>{user.fullName}</span>
                                    <span style={{ marginLeft: 8, padding: '2px 8px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#888' }}>
                                        {user.username}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Header>
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </AntdApp>
    );
}
