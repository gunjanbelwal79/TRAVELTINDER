const { useState, useEffect } = React;

// API Configuration
const API_BASE = 'http://localhost:5000/api';

// API utility functions
const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers,
                ...options
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async get(endpoint) {
        return this.request(endpoint);
    },

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
};

// Main App Component
function App() {
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('trips');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            loadUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await api.get('/profile');
            setUser(profile);
        } catch (error) {
            console.error('Failed to load profile:', error);
            localStorage.removeItem('authToken');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (userData, token) => {
        localStorage.setItem('authToken', token);
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setCurrentView('trips');
    };

    if (loading) {
        return (
            <div className="loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <AuthComponent onLogin={handleLogin} />;
    }

    return (
        <div>
            <Header 
                user={user} 
                currentView={currentView} 
                onViewChange={setCurrentView}
                onLogout={handleLogout}
            />
            <main className="main-content">
                <div className="container">
                    {currentView === 'trips' && <TripsComponent user={user} />}
                    {currentView === 'profile' && <ProfileComponent user={user} onUpdate={loadUserProfile} />}
                    {currentView === 'messages' && <MessagingComponent user={user} />}
                    {currentView === 'dashboard' && <DashboardComponent />}
                </div>
            </main>
            <SOSComponent user={user} />
        </div>
    );
}

// Header Component
function Header({ user, currentView, onViewChange, onLogout }) {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <i className="fas fa-plane"></i>
                        Travel Tinder
                    </div>
                    <nav>
                        <ul className="nav-menu">
                            <li>
                                <a 
                                    href="#" 
                                    className={currentView === 'trips' ? 'active' : ''}
                                    onClick={(e) => { e.preventDefault(); onViewChange('trips'); }}
                                >
                                    <i className="fas fa-map-marked-alt"></i> Trips
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className={currentView === 'messages' ? 'active' : ''}
                                    onClick={(e) => { e.preventDefault(); onViewChange('messages'); }}
                                >
                                    <i className="fas fa-comments"></i> Messages
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className={currentView === 'profile' ? 'active' : ''}
                                    onClick={(e) => { e.preventDefault(); onViewChange('profile'); }}
                                >
                                    <i className="fas fa-user"></i> Profile
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className={currentView === 'dashboard' ? 'active' : ''}
                                    onClick={(e) => { e.preventDefault(); onViewChange('dashboard'); }}
                                >
                                    <i className="fas fa-chart-bar"></i> Dashboard
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <div className="user-info">
                        <span>Welcome, {user.name}</span>
                        <button className="btn-logout" onClick={onLogout}>
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
