"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, App as AntdApp } from 'antd';
import {
    DashboardOutlined,
    ShopOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';

const { Header, Sider, Content } = Layout;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        if (pathname === '/portal/login' || pathname === '/portal') return;

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.role !== 'SUPER_ADMIN') {
                router.push('/dashboard');
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setUser(parsed);
        } else {
            router.push('/portal/login');
        }
    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/portal/login');
    };

    // Only show sidebar/header for authenticated Super Admins
    const isLoginPage = pathname === '/portal/login' || pathname === '/portal';

    if (!isLoginPage && !user) return null;

    if (isLoginPage) return <AntdApp>{children}</AntdApp>;

    return (
        <AntdApp>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark" className="bg-gray-900">
                    <div className="p-4 text-white font-bold text-center text-lg border-b border-gray-800 mb-4">
                        {collapsed ? 'ADM' : 'ADMIN PORTAL'}
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[pathname]}
                        className="bg-gray-900"
                        onClick={({ key }) => {
                            if (key === 'logout') handleLogout();
                            else router.push(key);
                        }}
                        items={[
                            {
                                key: '/portal/dashboard',
                                icon: <DashboardOutlined />,
                                label: 'Dashboard',
                            },
                            {
                                key: '/portal/branches',
                                icon: <ShopOutlined />,
                                label: 'Branch Management',
                            },
                            {
                                key: '/portal/users',
                                icon: <UserOutlined />,
                                label: 'User Management',
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
                                    <span style={{ marginLeft: 8, padding: '2px 8px', background: '#FFF1F0', border: '1px solid #FFA39E', borderRadius: '4px', fontSize: '12px', color: '#CF1322' }}>
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
