import { useAuth } from '../context/authContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                        Table<span className="text-violet-400">Reserve</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {user?.role === 'admin' && (
                        <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                            Admin
                        </span>
                    )}
                    <span className="text-sm text-gray-400 hidden sm:block">
                        Hello, <span className="text-white font-medium">{user?.name}</span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-gray-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
