function DashboardComponent() {
    const [stats, setStats] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsData, heatmapData] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/heatmap')
            ]);
            setStats(statsData);
            setHeatmapData(heatmapData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <h2><i className="fas fa-chart-bar"></i> Authority Dashboard</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Mock dashboard for tourism authorities and safety monitoring
            </p>

            {/* Stats Grid */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3><i className="fas fa-users"></i> Total Users</h3>
                    <div className="stat-number">{stats?.total_users || 0}</div>
                    <div className="stat-label">Registered travelers</div>
                </div>

                <div className="dashboard-card">
                    <h3><i className="fas fa-route"></i> Active Trips</h3>
                    <div className="stat-number">{stats?.active_trips || 0}</div>
                    <div className="stat-label">Currently ongoing</div>
                </div>

                <div className="dashboard-card">
                    <h3><i className="fas fa-map-marked-alt"></i> Total Trips</h3>
                    <div className="stat-number">{stats?.total_trips || 0}</div>
                    <div className="stat-label">All time</div>
                </div>

                <div className="dashboard-card">
                    <h3><i className="fas fa-exclamation-triangle"></i> Emergency Alerts</h3>
                    <div className="stat-number" style={{ color: '#ff6b6b' }}>
                        {stats?.emergency_alerts || 0}
                    </div>
                    <div className="stat-label">Active SOS calls</div>
                </div>

                <div className="dashboard-card">
                    <h3><i className="fas fa-id-card"></i> Verified Tourists</h3>
                    <div className="stat-number" style={{ color: '#51cf66' }}>
                        {stats?.verified_tourists || 0}
                    </div>
                    <div className="stat-label">Blockchain verified</div>
                </div>

                <div className="dashboard-card">
                    <h3><i className="fas fa-shield-alt"></i> Safety Score</h3>
                    <div className="stat-number" style={{ color: '#51cf66' }}>95%</div>
                    <div className="stat-label">Overall safety rating</div>
                </div>
            </div>

            {/* Risk Areas */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <h3><i className="fas fa-exclamation-circle"></i> Risk Assessment</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {stats?.risk_areas?.map((area, index) => (
                        <div key={index} style={{ 
                            padding: '1rem', 
                            border: '1px solid #e1e1e1', 
                            borderRadius: '10px',
                            backgroundColor: area.risk_level === 'High' ? '#ffe3e3' : 
                                           area.risk_level === 'Medium' ? '#fff3cd' : '#d4edda'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {area.location}
                            </div>
                            <div style={{ 
                                color: area.risk_level === 'High' ? '#dc3545' : 
                                       area.risk_level === 'Medium' ? '#856404' : '#155724'
                            }}>
                                Risk Level: {area.risk_level}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tourist Heatmap */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <h3><i className="fas fa-map"></i> Tourist Activity Heatmap</h3>
                <div style={{ 
                    height: '300px', 
                    background: '#f8f9fa', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    border: '2px dashed #ddd'
                }}>
                    <i className="fas fa-map" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
                    <p style={{ color: '#666', textAlign: 'center' }}>
                        Mock Heatmap Visualization<br/>
                        In a real app, this would show tourist density using mapping libraries like Leaflet or Google Maps
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                        {heatmapData.map((point, index) => (
                            <div key={index} style={{ 
                                display: 'inline-block', 
                                margin: '0.25rem', 
                                padding: '0.5rem', 
                                background: 'white', 
                                borderRadius: '5px',
                                fontSize: '0.8rem'
                            }}>
                                Lat: {point.lat}, Lng: {point.lng} (Intensity: {point.intensity})
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Anomaly Detection */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <h3><i className="fas fa-brain"></i> AI Anomaly Detection (Mock)</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>Monitoring Status</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '5px', textAlign: 'center' }}>
                            <i className="fas fa-walking"></i><br/>
                            <strong>Activity Monitoring</strong><br/>
                            <span style={{ color: '#155724' }}>Active</span>
                        </div>
                        <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '5px', textAlign: 'center' }}>
                            <i className="fas fa-map-marker-alt"></i><br/>
                            <strong>Location Tracking</strong><br/>
                            <span style={{ color: '#155724' }}>Active</span>
                        </div>
                        <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '5px', textAlign: 'center' }}>
                            <i className="fas fa-route"></i><br/>
                            <strong>Route Deviation</strong><br/>
                            <span style={{ color: '#155724' }}>Monitoring</span>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#666' }}>
                        <i className="fas fa-info-circle"></i>
                        AI system monitors tourist behavior patterns to detect anomalies like prolonged inactivity, 
                        sudden location drops, or significant deviations from planned routes.
                    </p>
                </div>
            </div>

            {/* Digital E-FIR System */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <h3><i className="fas fa-file-medical-alt"></i> Digital E-FIR System (Mock)</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4>Recent Cases</h4>
                        <button className="btn-secondary">
                            <i className="fas fa-plus"></i> Generate E-FIR
                        </button>
                    </div>
                    <div style={{ border: '1px solid #e1e1e1', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #e1e1e1', fontWeight: 'bold' }}>
                            No active missing person cases
                        </div>
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                            <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: '#51cf66', marginBottom: '0.5rem' }}></i>
                            <p>All tourists are safe and accounted for</p>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#666' }}>
                        <i className="fas fa-info-circle"></i>
                        Automated E-FIR generation for missing tourists based on AI anomaly detection and emergency alerts.
                    </p>
                </div>
            </div>
        </div>
    );
}
