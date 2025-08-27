function ProfileComponent({ user, onUpdate }) {
    const [profile, setProfile] = useState({
        bio: '',
        location: '',
        interests: [],
        emergency_contact: ''
    });
    const [touristId, setTouristId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadProfile();
        loadTouristId();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await api.get('/profile');
            setProfile({
                bio: data.bio || '',
                location: data.location || '',
                interests: data.interests || [],
                emergency_contact: data.emergency_contact || ''
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const loadTouristId = async () => {
        try {
            const data = await api.get('/tourist-id');
            setTouristId(data);
        } catch (error) {
            // Tourist ID not generated yet
            console.log('Tourist ID not found');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.put('/profile', profile);
            setMessage('Profile updated successfully!');
            onUpdate();
            
            // Load tourist ID if not exists
            if (!touristId) {
                setTimeout(loadTouristId, 1000);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInterestsChange = (e) => {
        const interests = e.target.value.split(',').map(interest => interest.trim());
        setProfile(prev => ({
            ...prev,
            interests
        }));
    };

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3><i className="fas fa-user-edit"></i> Profile Information</h3>
                {message && (
                    <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Current Location</label>
                        <input
                            type="text"
                            name="location"
                            value={profile.location}
                            onChange={handleInputChange}
                            placeholder="City, Country"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Interests (comma-separated)</label>
                        <input
                            type="text"
                            value={profile.interests.join(', ')}
                            onChange={handleInterestsChange}
                            placeholder="Adventure, Culture, Food, Photography"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Emergency Contact</label>
                        <input
                            type="text"
                            name="emergency_contact"
                            value={profile.emergency_contact}
                            onChange={handleInputChange}
                            placeholder="Name and phone number"
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Update Profile'}
                    </button>
                </form>
            </div>

            <div className="dashboard-card">
                <h3><i className="fas fa-id-card"></i> Basic Information</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <strong>Name:</strong> {user.name}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <strong>Email:</strong> {user.email}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <strong>Account Status:</strong> 
                    <span style={{ color: user.verified ? '#51cf66' : '#ff6b6b', marginLeft: '0.5rem' }}>
                        {user.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <strong>Profile Completion:</strong> 
                    <span style={{ color: user.profile_complete ? '#51cf66' : '#ff6b6b', marginLeft: '0.5rem' }}>
                        {user.profile_complete ? 'Complete' : 'Incomplete'}
                    </span>
                </div>
            </div>

            {touristId && (
                <div className="dashboard-card">
                    <h3><i className="fas fa-shield-alt"></i> Blockchain Tourist ID</h3>
                    <div className="tourist-id-card">
                        <div className="id-header">
                            <div className="id-number">{touristId.id}</div>
                            <div className="blockchain-badge">
                                <i className="fas fa-link"></i> Blockchain Verified
                            </div>
                        </div>
                        <div className="id-details">
                            <div><strong>Holder:</strong> {user.name}</div>
                            <div><strong>Status:</strong> Active</div>
                            <div><strong>Created:</strong> {new Date(touristId.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <small>Blockchain Hash:</small>
                            <div className="blockchain-hash">{touristId.blockchain_hash}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-card">
                <h3><i className="fas fa-camera"></i> Mock Photo Verification</h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                    In a real application, this would include AI-based photo verification and Aadhaar integration.
                </p>
                <div style={{ border: '2px dashed #ddd', padding: '2rem', textAlign: 'center', borderRadius: '10px' }}>
                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#ddd', marginBottom: '1rem' }}></i>
                    <p>Upload Profile Photos (Mock)</p>
                    <button className="btn-secondary">
                        <i className="fas fa-upload"></i> Choose Files
                    </button>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    • Upload 2-5 clear photos of yourself
                    • AI will verify your identity
                    • Aadhaar verification (mocked for demo)
                </div>
            </div>
        </div>
    );
}
