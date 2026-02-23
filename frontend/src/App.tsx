import { useState } from 'react'
import AdminPanel from './components/AdminPanel'
import PublicArea from './components/PublicArea'
import { GraduationCap, Shield } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'public' | 'admin'>('public');

  return (
    <div className="gradient-bg min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 text-slate-800">
          <h1 className="text-4xl font-extrabold flex items-center justify-center gap-3">
            <span className="text-indigo-600">📝</span> Lab Doc Shaper
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Easily adapt lab documents with your personal details instantly.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-2 sm:p-4 mb-8">
          <div className="flex space-x-2 bg-white/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'public'
                  ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]'
                  : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600'
                }`}
            >
              <GraduationCap size={20} />
              Public Area
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'admin'
                  ? 'bg-slate-800 text-white shadow-md transform scale-[1.02]'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
            >
              <Shield size={20} />
              Admin Area
            </button>
          </div>
        </div>

        <main className="glass-panel rounded-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'public' ? <PublicArea /> : <AdminPanel />}
        </main>
      </div>
    </div>
  )
}

export default App
