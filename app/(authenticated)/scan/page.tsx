"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { Input, Button, Card, App, List, Tag, Spin, Typography, Space } from 'antd';
import { CheckCircleOutlined, CarOutlined, LoadingOutlined } from '@ant-design/icons';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';

const { Title, Text } = Typography;

function ScanContent() {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    // const [batchNo, setBatchNo] = useState(''); // Unused
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [previewData, setPreviewData] = useState<any>(null);
    const [manualCode, setManualCode] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { message: antdMsg } = App.useApp();

    useEffect(() => {
        const fetchPreview = async (code: string) => {
            setLoading(true);
            try {
                const { data } = await api.get(`/logistics/batches/${code}`);
                setPreviewData(data);
            } catch (e: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                antdMsg.error((e as any).response?.data?.message || 'Invalid Batch QR');
                setPreviewData(null);
            } finally {
                setLoading(false);
            }
        };

        const urlBatch = searchParams.get('batchNo');
        if (urlBatch) {
            // setBatchNo(urlBatch);
            fetchPreview(urlBatch);
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render((decodedText) => {
            let extracted = decodedText;
            try {
                if (decodedText.includes('batchNo=')) {
                    extracted = new URL(decodedText).searchParams.get('batchNo') || decodedText;
                }
            } catch { } // unused var
            // setBatchNo(extracted);
            fetchPreview(extracted);
            scanner.clear();
        }, () => { }); // unused error

        return () => {
            scanner.clear().catch(() => { });
        };
    }, [searchParams, antdMsg]); // Removed fetchPreview dependency by moving it inside

    // const fetchPreview = async (code: string) => {
    //     // This function is now duplicated inside useEffect to solve deps, or we can use useCallback.
    //     // But since it's used in handleAction/manual scan too, let's keep it and use useCallback or accept the duplication/cleanup.
    //     // Simpler: Define it via useCallback.
    // };

    const handleAction = async () => {
        if (!previewData) return;
        setActionLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (user?.role === 'COURIER') {
                await api.post('/logistics/scan/pickup', { batchNo: previewData.batchNo });
                antdMsg.success(`📦 Pickup Confirmed: Batch ${previewData.batchNo} is now in transit.`);
            } else {
                await api.post('/logistics/scan/receive', { batchNo: previewData.batchNo });
                antdMsg.success(`✅ Receive Confirmed: Batch ${previewData.batchNo} has been delivered.`);
            }
            router.push('/logistics');
        } catch (e: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            antdMsg.error((e as any).response?.data?.message || 'Action Failed');
        } finally {
            setActionLoading(false);
        }
    };

    // Re-implement independent fetchPreview to be used by Manual Scan button
    const handleManualScan = async (code: string) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/logistics/batches/${code}`);
            setPreviewData(data);
        } catch (e: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            antdMsg.error((e as any).response?.data?.message || 'Invalid Batch QR');
            setPreviewData(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <Title level={2} className="text-center mb-8">Logistics Scanning</Title>

            {!previewData && (
                <Card className="mb-6 shadow-md rounded-2xl overflow-hidden border-none">
                    <div id="reader" className="w-full"></div>
                    <div className="p-4 text-center text-gray-400">
                        Please point your camera at the SPR Transport QR Code
                    </div>
                </Card>
            )}

            {loading && <div className="text-center py-10"><Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} /></div>}

            {previewData && (
                <Card
                    className="mb-6 shadow-xl border-none rounded-3xl overflow-hidden"
                    title={
                        <div className="flex justify-between items-center py-2">
                            <span className="text-lg font-black">BATCH VERIFICATION</span>
                            <Tag color="red" variant="filled" className="m-0">{previewData.direction.replace('_', ' ')}</Tag>
                        </div>
                    }
                >
                    <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                        <div className="grid grid-cols-2 gap-y-4">
                            <div>
                                <Text type="secondary" className="block text-xs uppercase font-bold tracking-widest">Batch Number</Text>
                                <Text className="text-xl font-black">{previewData.batchNo}</Text>
                            </div>
                            <div>
                                <Text type="secondary" className="block text-xs uppercase font-bold tracking-widest">Current Status</Text>
                                <Tag color="processing" variant="filled" className="font-bold">{previewData.status}</Tag>
                            </div>
                            <div>
                                <Text type="secondary" className="block text-xs uppercase font-bold tracking-widest">Created On</Text>
                                <Text className="font-medium">{formatDate(previewData.createdAt)}</Text>
                            </div>
                            <div>
                                <Text type="secondary" className="block text-xs uppercase font-bold tracking-widest">Items Count</Text>
                                <Text className="font-black text-lg">{previewData.items?.length || 0}</Text>
                            </div>
                        </div>
                    </div>

                    <Title level={4} className="flex items-center gap-2 mb-4">
                        <CarOutlined className="text-red-600" /> Included Repair Orders
                    </Title>
                    <List
                        dataSource={previewData.items}
                        className="bg-white rounded-xl border border-gray-100 mb-8"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        renderItem={(item: any) => (
                            <List.Item className="px-4 border-b last:border-none flex justify-between">
                                <span className="font-bold">{item.repairOrder?.orderNo}</span>
                                <span className="text-gray-500">{item.repairOrder?.deviceModel}</span>
                                <Tag color="blue" variant="filled" className="text-[10px] font-bold">{item.repairOrder?.status}</Tag>
                            </List.Item>
                        )}
                    />

                    <div className="flex flex-col gap-3">
                        <Button
                            type="primary"
                            size="large"
                            block
                            className="h-16 text-lg font-black bg-red-600 hover:bg-black border-none rounded-2xl shadow-lg ring-4 ring-red-100"
                            onClick={handleAction}
                            loading={actionLoading}
                            icon={<CheckCircleOutlined />}
                        >
                            CONFIRM & UPDATE STATUS
                        </Button>
                        <Button size="large" block variant="outlined" className="h-12 font-bold rounded-2xl text-gray-400" onClick={() => { setPreviewData(null); }}>
                            Cancel / Scan Another
                        </Button>
                    </div>
                </Card>
            )}

            {!previewData && !loading && (
                <Card title="Manual Correction" className="shadow-sm rounded-2xl border-gray-100">
                    <Space.Compact className="w-full h-12">
                        <Input
                            placeholder="Enter Batch No manually..."
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                        />
                        <Button type="primary" className="bg-black border-none font-bold" onClick={() => handleManualScan(manualCode)}>Load</Button>
                    </Space.Compact>
                </Card>
            )}
        </div>
    );
}

export default function ScanPage() {
    return (
        <Suspense fallback={<div className="text-center py-20"><Spin size="large" /></div>}>
            <ScanContent />
        </Suspense>
    );
}
