const API_BASE = 'http://localhost:3001/api';

export const api = {
    // Admin
    login: async (password: string) => {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        return res.json();
    },
    updatePassword: async (newPassword: string) => {
        const res = await fetch(`${API_BASE}/admin/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });
        return res.json();
    },
    getProfile: async () => {
        const res = await fetch(`${API_BASE}/admin/profile`);
        return res.json();
    },
    updateProfile: async (name: string, roll_number: string) => {
        const res = await fetch(`${API_BASE}/admin/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, roll_number })
        });
        return res.json();
    },

    // Labs
    getLabs: async () => {
        const res = await fetch(`${API_BASE}/labs`);
        return res.json();
    },
    uploadLab: async (formData: FormData) => {
        const res = await fetch(`${API_BASE}/labs`, {
            method: 'POST',
            body: formData
        });
        return res.json();
    },
    deleteLab: async (id: number) => {
        const res = await fetch(`${API_BASE}/labs/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Generate Document
    generateDocument: async (payload: any) => {
        const res = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to generate document');
        }

        // Return blob for download
        return res.blob();
    }
};
