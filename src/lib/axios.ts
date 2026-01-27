import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Mock Logic
if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const mock = new MockAdapter(api, { delayResponse: 500 });
    console.warn('[Mock] API Mocking Enabled');

    // Login Mock
    mock.onPost('/auth/login').reply(200, {
        access_token: 'mock-jwt-token-xyz',
        user: {
            id: 'u1',
            email: 'admin@spr.com',
            role: 'admin',
            fullName: 'Test Administrator',
            organizations: []
        }
    });

    // CRM Leads Mock
    mock.onPost('/crm/leads').reply(200, { success: true, message: 'Lead saved' });

    // Prices Mock
    mock.onGet('/prices').reply((config) => {
        const { model, issue } = config.params || {};
        // Simple mock price logic
        let price = 100;
        if (model?.includes('Pro')) price += 50;
        if (issue === 'Screen Crack') price += 80;
        return [200, { price }];
    });

    // Repair List Mock
    mock.onGet('/repairs').reply(200, [
        {
            id: 1,
            orderNo: 'RO-2024-001',
            deviceModel: 'iPhone 13',
            problemDesc: 'Screen replacement',
            status: 'IN_BRANCH',
            branch: { name: 'Main St Branch' },
            technician: { fullName: 'Tech Mike' },
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            orderNo: 'RO-2024-002',
            deviceModel: 'Samsung S22',
            problemDesc: 'Battery drain',
            status: 'REPAIRED',
            branch: { name: 'Main St Branch' },
            technician: { fullName: 'Tech Sarah' },
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ]);

    // Create Repair Mock
    mock.onPost('/repairs').reply(200, { success: true, id: 3 });

    // Logistics Batches Mock
    mock.onGet('/logistics/batches').reply(200, [
        {
            id: 'b1',
            batchNo: 'BATCH-2024-001',
            direction: 'TO_HQ',
            status: 'IN_TRANSIT',
            createdAt: new Date().toISOString()
        },
        {
            id: 'b2',
            batchNo: 'BATCH-2024-002',
            direction: 'TO_BRANCH',
            status: 'RECEIVED',
            createdAt: new Date(Date.now() - 43200000).toISOString()
        }
    ]);

    // Create Logistics Batch Mock
    mock.onPost('/logistics/batches').reply(200, { success: true, id: 'b3', batchNo: 'BATCH-2024-003' });

    // Default pass-through (commented out)
    // mock.onAny().passThrough();
}

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
