import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { LogIn, Save, Upload, Trash2, KeyRound, FileIcon, Settings } from 'lucide-react';

export default function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profile, setProfile] = useState({ name: '', roll_number: '' });
    const [newPassword, setNewPassword] = useState('');
    const [labs, setLabs] = useState<any[]>([]);

    const [uploadData, setUploadData] = useState({ lab_id: '', original_date_string: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchLabs = async () => {
        try {
            const data = await api.getLabs();
            setLabs(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchProfile = async () => {
        try {
            const data = await api.getProfile();
            if (data) setProfile(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchLabs();
            fetchProfile();
        }
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.login(password);
            if (res.success) {
                setIsAuthenticated(true);
            } else {
                setError(res.message);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    const handleUpdateProfile = async () => {
        setSuccess('');
        setError('');
        try {
            await api.updateProfile(profile.name, profile.roll_number);
            setSuccess('Profile updated successfully!');
        } catch (e: any) {
            setError('Failed to update profile');
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            setError('Password cannot be empty');
            return;
        }
        setSuccess('');
        setError('');
        try {
            await api.updatePassword(newPassword);
            setSuccess('Password changed successfully!');
            setNewPassword('');
        } catch (e: any) {
            setError('Failed to update password');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!fileInputRef.current?.files?.[0]) {
            setError('Please select a .docx file');
            return;
        }

        if (!uploadData.lab_id) {
            setError('Please provide a Lab ID');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInputRef.current.files[0]);
        formData.append('lab_id', uploadData.lab_id);
        formData.append('original_date_string', uploadData.original_date_string);

        try {
            await api.uploadLab(formData);
            setSuccess('Lab uploaded successfully!');
            setUploadData({ lab_id: '', original_date_string: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchLabs();
        } catch (err) {
            setError('Failed to upload lab');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.deleteLab(id);
            fetchLabs();
        } catch (err) {
            setError('Failed to delete lab');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <form onSubmit={handleLogin} className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <KeyRound className="text-white" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Admin Access</h2>
                        <p className="text-slate-500 text-sm">Enter the configuration password to proceed.</p>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}

                    <div>
                        <input
                            type="password"
                            placeholder="Password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/50 focus:border-slate-800 bg-white/50 backdrop-blur-sm transition-all"
                        />
                    </div>
                    <button type="submit" className="w-full bg-slate-800 text-white font-semibold py-3 rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-md flex justify-center items-center gap-2">
                        <LogIn size={20} /> Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl shadow-sm border border-white">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800"><Settings className="text-indigo-600" /> Dashboard</h2>
                <button
                    onClick={() => setIsAuthenticated(false)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    Logout
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-200">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <div className="bg-white/60 p-6 rounded-2xl shadow-sm border border-white/60 space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Save size={18} className="text-indigo-500" /> Profile Replacements</h3>
                    <p className="text-sm text-slate-500 mb-4">Set these to exactly what is written in the original .docx files</p>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Name</label>
                        <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white transition-all" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Roll Number</label>
                        <input type="text" value={profile.roll_number} onChange={e => setProfile({ ...profile, roll_number: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white transition-all" />
                    </div>
                    <button onClick={handleUpdateProfile} className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium py-2 rounded-lg transition-colors">
                        Save Profile
                    </button>
                </div>

                {/* Password Settings */}
                <div className="bg-white/60 p-6 rounded-2xl shadow-sm border border-white/60 space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><KeyRound size={18} className="text-indigo-500" /> Security</h3>
                    <p className="text-sm text-slate-500 mb-4">Update the dashboard configuration password</p>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white transition-all" />
                    </div>
                    <button onClick={handleUpdatePassword} className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium py-2 rounded-lg transition-colors mt-auto">
                        Update Password
                    </button>
                </div>
            </div>

            <div className="bg-white/60 p-6 rounded-2xl shadow-sm border border-white/60 space-y-6">
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Upload className="text-indigo-600" /> Upload New Lab</h3>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab ID (e.g. LAB-01)</label>
                            <input type="text" required value={uploadData.lab_id} onChange={e => setUploadData({ ...uploadData, lab_id: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Original Date String (Optional)</label>
                            <input type="text" value={uploadData.original_date_string} onChange={e => setUploadData({ ...uploadData, original_date_string: e.target.value })} placeholder="e.g. 23-02-2026" className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white transition-all" />
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                        <input type="file" ref={fileInputRef} accept=".docx" className="hidden" id="file-upload" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                            <FileIcon size={32} className="text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-600">Click to select .docx file</span>
                            <span className="text-xs text-slate-500">Only Word documents are supported</span>
                        </label>
                    </div>

                    <button type="submit" className="w-full bg-slate-800 text-white font-semibold py-3 rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-md">
                        Upload Document
                    </button>
                </form>
            </div>

            <div className="bg-white/60 p-6 rounded-2xl shadow-sm border border-white/60 space-y-4">
                <h3 className="font-bold text-xl text-slate-800">Manage Uploaded Labs</h3>
                {labs.length === 0 ? (
                    <p className="text-slate-500 italic text-sm p-4 text-center bg-white rounded-lg border border-slate-100">No labs uploaded yet.</p>
                ) : (
                    <div className="space-y-3">
                        {labs.map((l) => (
                            <div key={l.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                                        {l.lab_id.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{l.lab_id}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>📄 {l.file_name}</span>
                                            {l.original_date_string && <span>• 📅 {l.original_date_string}</span>}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(l.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Lab">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
