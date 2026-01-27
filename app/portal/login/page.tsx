"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { LockOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Image from 'next/image';

const { Text } = Typography;

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { message } = App.useApp();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', values);
            if (data.user.role !== 'SUPER_ADMIN') {
                message.error('Access Denied: Super Admin credentials required');
                return;
            }
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            message.success('Authorized Access: Welcome, Administrator');
            router.push('/portal/dashboard');
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error((err as any).response?.data?.message || 'Authorization failed. Access restricted.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            requiredMark={false}
        >
            <Form.Item name="username" rules={[{ required: true, message: 'Admin username required' }]}>
                <Input
                    prefix={<UserOutlined className="text-gray-400 mr-2" />}
                    placeholder="Admin Username"
                    className="rounded-xl border-gray-100 hover:border-red-400 focus:border-red-500 h-12"
                />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Security password required' }]} className="mb-8">
                <Input.Password
                    prefix={<LockOutlined className="text-gray-400 mr-2" />}
                    placeholder="Password"
                    className="rounded-xl border-gray-100 hover:border-red-400 focus:border-red-500 h-12"
                />
            </Form.Item>
            <Form.Item className="mb-0">
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    icon={<ArrowRightOutlined />}
                    className="h-14 rounded-xl bg-[#E60000] hover:bg-[#c40000] border-none text-lg font-bold shadow-xl shadow-red-100 transition-all transform hover:scale-[1.01]"
                >
                    Authorize Entry
                </Button>
            </Form.Item>
        </Form>
    );
}

export default function PortalLogin() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <div className="min-h-screen bg-[#f8f9fa]" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] relative overflow-hidden" suppressHydrationWarning>
            {/* Professional Background Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#E60000]" />
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-50 rounded-full blur-[150px] opacity-70" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-gray-100 rounded-full blur-[150px] opacity-50" />

            <App>
                <Card
                    className="w-full max-w-[440px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border-none rounded-3xl overflow-hidden"
                    styles={{ body: { padding: '48px 40px' } }}
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-8">
                            <Image src="/logo.png" alt="SPR Logo" width={256} height={60} className="w-64 h-auto drop-shadow-xl" />
                        </div>
                        <div className="flex items-center justify-center">
                            <span className="h-[1px] w-4 bg-gray-200" />
                            <Text className="text-gray-400 font-semibold px-3 uppercase tracking-widest text-[10px]">Security Clearance Required</Text>
                            <span className="h-[1px] w-4 bg-gray-200" />
                        </div>
                    </div>

                    <LoginForm />

                    <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                        <Text className="text-gray-300 text-[10px] tracking-widest uppercase">
                            Secure Personnel Access Only
                        </Text>
                    </div>
                </Card>
            </App>
        </div>
    );
}
