function SOSComponent({ user }) {
    const [sosActive, setSosActive] = useState(false);
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);

    const triggerSOS = async () => {
        if (sosActive) return;

        if (!showForm) {
            setShowForm(true);
            return;
        }

        try {
            setSosActive(true);
            
            const response = await api.post('/sos', {
                location: location || 'Location unavailable',
                message: message || 'Emergency assistance needed'
            });

            alert(`SOS Alert Sent Successfully!\n\nAlert ID: ${response.alert_id}\nNearby users notified: ${response.nearby_users_notified}\nAuthorities notified: ${response.authorities_notified ? 'Yes' : 'No'}`);
            
            // Reset after 30 seconds (in real app, this would be handled by authorities)
            setTimeout(() => {
                setSosActive(false);
                setShowForm(false);
                setLocation('');
                setMessage('');
            }, 30000);
            
        } catch (error) {
            setSosActive(false);
            alert('Failed to send SOS alert: ' + error.message);
        }
    };

    const cancelSOS = () => {
        setShowForm(false);
        setLocation('');
        setMessage('');
    };

    return (
        <>
            <div className="sos-container">
                <button 
                    className="sos-button"
                    onClick={triggerSOS}
                    style={{
                        background: sosActive ? 
                            'linear-gradient(135deg, #ff9999 0%, #ff6666 100%)' : 
                            'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                    }}
                    disabled={sosActive}
                >
                    {sosActive ? (
                        <>
                            <i className="fas fa-exclamation-triangle"></i>
                            <small style={{ fontSize: '0.7rem' }}>ACTIVE</small>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-exclamation"></i>
                            <small style={{ fontSize: '0.7rem' }}>SOS</small>
                        </>
                    )}
                </button>
            </div>

            {showForm && !sosActive && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '15px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{ 
                            color: '#ff6b6b', 
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <i className="fas fa-exclamation-triangle"></i> Emergency SOS
                        </h3>
                        
                        <div className="form-group">
                            <label>Current Location (Optional)</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Describe your location..."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Emergency Message (Optional)</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your emergency..."
                                rows="3"
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button 
                                onClick={triggerSOS}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                <i className="fas fa-exclamation"></i> SEND SOS
                            </button>
                            <button 
                                onClick={cancelSOS}
                                style={{
                                    flex: 1,
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                        
                        <div style={{ 
                            marginTop: '1rem', 
                            padding: '1rem', 
                            background: '#fff3cd', 
                            borderRadius: '5px',
                            fontSize: '0.9rem',
                            color: '#856404'
                        }}>
                            <i className="fas fa-info-circle"></i>
                            <strong> SOS will:</strong>
                            <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                                <li>Alert nearby travelers within 10km</li>
                                <li>Notify local police dashboard</li>
                                <li>Send SMS to emergency contacts</li>
                                <li>Share your live location</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {sosActive && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '15px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    zIndex: 2000,
                    textAlign: 'center',
                    border: '3px solid #ff6b6b'
                }}>
                    <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                        <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                        SOS ALERT ACTIVE
                    </h3>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        Emergency services have been notified.<br/>
                        Help is on the way!
                    </p>
                    <div style={{ 
                        background: '#f8f9fa', 
                        padding: '1rem', 
                        borderRadius: '5px',
                        fontSize: '0.9rem',
                        color: '#666'
                    }}>
                        Stay calm and remain in a safe location if possible.
                    </div>
                </div>
            )}
        </>
    );
}
