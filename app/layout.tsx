import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import './globals.css';

const theme = {
    token: {
        colorPrimary: '#E60000', // Red as requested
    },
};

export const metadata = {
    title: 'SPR ERP',
    description: 'Internal Repair ERP System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AntdRegistry>
                    <ConfigProvider theme={theme}>
                        {children}
                    </ConfigProvider>
                </AntdRegistry>
            </body>
        </html>
    );
}
