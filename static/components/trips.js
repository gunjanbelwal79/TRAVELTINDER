function TripsComponent({ user }) {
    const [trips, setTrips] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newTrip, setNewTrip] = useState({
        title: '',
        destination: '',
        start_date: '',
        end_date: '',
        description: '',
        max_participants: 4
    });

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const data = await api.get('/trips');
            setTrips(data);
        } catch (error) {
            console.error('Failed to load trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trips', newTrip);
            setNewTrip({
                title: '',
                destination: '',
                start_date: '',
                end_date: '',
                description: '',
                max_participants: 4
            });
            setShowCreateForm(false);
            loadTrips();
        } catch (error) {
            console.error('Failed to create trip:', error);
            alert('Failed to create trip: ' + error.message);
        }
    };

    const handleJoinTrip = async (tripId) => {
        try {
            await api.post(`/trips/${tripId}/join`);
            loadTrips();
        } catch (error) {
            alert('Failed to join trip: ' + error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTrip(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading trips...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2><i className="fas fa-map-marked-alt"></i> Travel Trips</h2>
                <button 
                    className="btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    <i className="fas fa-plus"></i> Create Trip
                </button>
            </div>

            {showCreateForm && (
                <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
                    <h3><i className="fas fa-plus-circle"></i> Create New Trip</h3>
                    <form onSubmit={handleCreateTrip}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Trip Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newTrip.title}
                                    onChange={handleInputChange}
                                    placeholder="Amazing Adventure in..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Destination</label>
                                <input
                                    type="text"
                                    name="destination"
                                    value={newTrip.destination}
                                    onChange={handleInputChange}
                                    placeholder="City, Country"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={newTrip.start_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={newTrip.end_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={newTrip.description}
                                onChange={handleInputChange}
                                placeholder="Tell us about your trip plan..."
                                rows="3"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Maximum Participants</label>
                            <select
                                name="max_participants"
                                value={newTrip.max_participants}
                                onChange={handleInputChange}
                            >
                                <option value={2}>2 people</option>
                                <option value={4}>4 people</option>
                                <option value={6}>6 people</option>
                                <option value={8}>8 people</option>
                                <option value={10}>10 people</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn-primary">
                                <i className="fas fa-check"></i> Create Trip
                            </button>
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {trips.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-map-marked-alt"></i>
                    <h3>No trips available</h3>
                    <p>Be the first to create a travel trip!</p>
                </div>
            ) : (
                <div className="trips-grid">
                    {trips.map(trip => (
                        <TripCard 
                            key={trip.id} 
                            trip={trip} 
                            currentUser={user}
                            onJoin={() => handleJoinTrip(trip.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function TripCard({ trip, currentUser, onJoin }) {
    const isCreator = trip.creator_id === currentUser.id;
    const isParticipant = trip.participants.includes(currentUser.id);
    const isFull = trip.participants.length >= trip.max_participants;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="trip-card">
            <div className="trip-header">
                <div className="trip-title">{trip.title}</div>
                <div className="trip-destination">
                    <i className="fas fa-map-marker-alt"></i>
                    {trip.destination}
                </div>
            </div>
            <div className="trip-content">
                <div className="trip-dates">
                    <i className="fas fa-calendar-alt"></i>
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </div>
                <div className="trip-description">
                    {trip.description}
                </div>
                <div className="trip-meta">
                    <span>
                        <i className="fas fa-users"></i>
                        {trip.participants.length}/{trip.max_participants} participants
                    </span>
                    <span>
                        Created by: {trip.creator?.name || 'Unknown'}
                    </span>
                </div>
                <div className="trip-actions">
                    {!isCreator && !isParticipant && !isFull && (
                        <button className="btn-join" onClick={onJoin}>
                            <i className="fas fa-user-plus"></i> Join Trip
                        </button>
                    )}
                    {isParticipant && (
                        <button className="btn-chat">
                            <i className="fas fa-comments"></i> Chat
                        </button>
                    )}
                    {isCreator && (
                        <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                            <i className="fas fa-crown"></i> Your Trip
                        </span>
                    )}
                    {isFull && !isParticipant && !isCreator && (
                        <span style={{ color: '#ff6b6b' }}>
                            <i className="fas fa-users"></i> Trip Full
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
