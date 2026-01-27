"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const { Title, Text } = Typography;

const LoginContent = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { message } = App.useApp();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', values);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            message.success('Welcome back, ' + data.user.fullName);
            router.push('/diagnostic');
        } catch (err: unknown) {
            console.error(err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error((err as any).response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] relative overflow-hidden" suppressHydrationWarning>
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-[120px] opacity-60" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-100 rounded-full blur-[120px] opacity-40" />

            <Card
                className="w-full max-w-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none rounded-2xl overflow-hidden"
                styles={{ body: { padding: '40px 32px' } }}
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center mb-6">
                        <Image src="/logo.png" alt="SPR Logo" width={224} height={80} className="w-56 h-auto drop-shadow-md" />
                    </div>
                    <Title level={4} className="m-0 tracking-[0.2em] font-black text-gray-800 border-none uppercase">
                        Internal Management
                    </Title>
                </div>

                <Form
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    requiredMark={false}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Your username is required' }]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400 mr-2" />}
                            placeholder="Username"
                            className="rounded-xl border-gray-100 hover:border-red-400 focus:border-red-500 transition-all h-12"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                        className="mb-8"
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400 mr-2" />}
                            placeholder="Password"
                            className="rounded-xl border-gray-100 hover:border-red-400 focus:border-red-500 transition-all h-12"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            icon={<ArrowRightOutlined />}
                            className="h-14 rounded-xl bg-[#E60000] hover:bg-[#c40000] active:bg-[#a30000] border-none text-lg font-bold shadow-xl shadow-red-100 transition-all transform hover:scale-[1.01]"
                        >
                            Log in to Account
                        </Button>
                    </Form.Item>
                </Form>

                <div className="mt-8 text-center">
                    <Text className="text-gray-400 text-xs">
                        &copy; {new Date().getFullYear()} SPR ERP. All Rights Reserved.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default function LoginPage() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        // Just empty useEffect is enough to trigger re-render on mount if we conditionally render
        // eslint-disable-next-line
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        // Return null or loader during SSR to avoid mismatch
        return <div className="min-h-screen bg-[#f8f9fa]" />;
    }

    return (
        <App>
            <LoginContent />
        </App>
    );
}
