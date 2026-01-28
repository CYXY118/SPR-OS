"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, App as AntdApp, Button, Drawer, Grid } from 'antd';
import {
    ToolOutlined,
    CarOutlined,
    LogoutOutlined,
    MedicineBoxOutlined,
    MenuOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';

const { Header, Sider, Content } = Layout;

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            // eslint-disable-next-line
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Auto-close drawer on route change
    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const menuItems = [
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
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') handleLogout();
        else router.push(key);
    };

    const siderContent = (
        <>
            <div style={{ height: 64, margin: 16, background: '#E60000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                SPR ERP
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[pathname]}
                onClick={handleMenuClick}
                items={menuItems}
            />
        </>
    );

    return (
        <AntdApp>
            <Layout style={{ minHeight: '100vh' }}>
                {/* Desktop Sider */}
                {!isMobile && (
                    <Sider theme="light" width={200}>
                        {siderContent}
                    </Sider>
                )}

                {/* Mobile Drawer */}
                <Drawer
                    placement="left"
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                    width={220}
                    styles={{ body: { padding: 0 } }}
                    closable={false}
                >
                    {siderContent}
                </Drawer>

                <Layout>
                    <Header style={{
                        padding: 0,
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingRight: isMobile ? 12 : 24,
                        paddingLeft: isMobile ? 4 : 16,
                        height: isMobile ? 56 : 64,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {isMobile && (
                                <Button
                                    type="text"
                                    icon={<MenuOutlined />}
                                    onClick={() => setDrawerOpen(true)}
                                    style={{ fontSize: '18px', width: 48, height: 48 }}
                                />
                            )}
                            {user && (
                                <div style={{ fontWeight: '600', color: '#555', fontSize: isMobile ? '12px' : '14px', marginLeft: isMobile ? 4 : 0 }}>
                                    <span style={{ color: '#E60000' }}>{user.fullName}</span>
                                    {!isMobile && (
                                        <span style={{ marginLeft: 8, padding: '2px 8px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#888' }}>
                                            {user.username}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </Header>
                    <Content
                        style={{
                            margin: isMobile ? '12px 8px' : '24px 16px',
                            padding: isMobile ? 12 : 24,
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

