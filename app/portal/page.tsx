"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalIndex() {
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            router.replace('/portal/dashboard');
        } else {
            router.replace('/portal/login');
        }
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
            <div className="animate-pulse">Loading Admin Portal...</div>
        </div>
    );
}
