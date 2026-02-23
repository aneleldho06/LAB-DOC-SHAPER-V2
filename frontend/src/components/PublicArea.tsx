import { useState, useEffect } from 'react';
import { api } from '../api';
import { FileDown, Loader2, Sparkles, User, FileText, Calendar } from 'lucide-react';

export default function PublicArea() {
    const [labs, setLabs] = useState<any[]>([]);
    const [adminProfile, setAdminProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        userName: '',
        userRoll: '',
        userDate: '',
        selectedLabId: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch initial data
        Promise.all([api.getLabs(), api.getProfile()])
            .then(([labsData, profileData]) => {
                setLabs(labsData || []);
                if (labsData && labsData.length > 0) {
                    setFormData(f => ({ ...f, selectedLabId: labsData[0].id.toString() }));
                }
                if (profileData) {
                    setAdminProfile(profileData);
                }
            })
            .catch(console.error);
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.userName || !formData.userRoll) {
            setError('Please provide your Full Name and Roll Number.');
            return;
        }
        if (!formData.selectedLabId) {
            setError('Please select a Lab.');
            return;
        }

        setLoading(true);
        try {
            const blob = await api.generateDocument({
                labId: parseInt(formData.selectedLabId),
                userName: formData.userName,
                userRoll: formData.userRoll,
                userDate: formData.userDate
            });

            // Create a download link and trigger it
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Find the lab name for the file download
            const lab = labs.find(l => l.id.toString() === formData.selectedLabId);
            a.download = `My_${lab ? lab.lab_id : 'Lab'}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (err: any) {
            setError(err.message || 'An error occurred during generation.');
        } finally {
            setLoading(false);
        }
    };

    const isProfileIncomplete = adminProfile && (!adminProfile.name || !adminProfile.roll_number);

    if (labs.length === 0) {
        return (
            <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                    <FileText className="text-indigo-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Labs Available</h3>
                <p className="text-slate-500 max-w-sm mx-auto">The admin hasn't uploaded any lab documents yet. Check back later!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isProfileIncomplete && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3 text-sm shadow-sm">
                    <span className="text-xl">⚠️</span>
                    <p>The Admin hasn't fully set up their replacement profile yet. The document generation might not replace everything correctly.</p>
                </div>
            )}

            <form onSubmit={handleGenerate} className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-lg border border-white space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-100 transition-colors duration-700"></div>

                <div className="relative z-10 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Sparkles className="text-indigo-500" />
                            Customize Your Doc
                        </h3>
                        <p className="text-slate-500 mt-1">Enter your details and get the lab ready instantly.</p>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <User size={14} /> Your Full Name
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. John Doe"
                                value={formData.userName}
                                onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-3.5 h-3.5 bg-slate-400 rounded-sm text-white text-[8px] flex items-center justify-center">#</span>
                                Your Roll Number
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 21X001"
                                value={formData.userRoll}
                                onChange={e => setFormData({ ...formData, userRoll: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} /> Date (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Leave empty to keep original doc date"
                            value={formData.userDate}
                            onChange={e => setFormData({ ...formData, userDate: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white shadow-sm transition-all"
                        />
                    </div>

                    <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-3">
                        <label className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
                            Target Lab Document
                        </label>
                        <select
                            value={formData.selectedLabId}
                            onChange={e => setFormData({ ...formData, selectedLabId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234F46E5%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                        >
                            {labs.map(l => (
                                <option key={l.id} value={l.id.toString()}>
                                    [{l.lab_id}] - {l.file_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98]'}`}
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" size={24} /> Generating Magic...</>
                            ) : (
                                <><FileDown size={24} /> Generate & Download</>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                            <FileText size={12} /> Exports as .docx seamlessly
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
