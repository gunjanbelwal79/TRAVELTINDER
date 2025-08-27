function MessagingComponent({ user }) {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [trips, setTrips] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserTrips();
    }, []);

    useEffect(() => {
        if (selectedTrip) {
            loadMessages();
            // In a real app, we'd set up WebSocket connection here
            const interval = setInterval(loadMessages, 3000); // Poll for new messages
            return () => clearInterval(interval);
        }
    }, [selectedTrip]);

    const loadUserTrips = async () => {
        try {
            const allTrips = await api.get('/trips');
            // Filter trips where user is a participant
            const userTrips = allTrips.filter(trip => 
                trip.participants.includes(user.id)
            );
            setTrips(userTrips);
            
            if (userTrips.length > 0 && !selectedTrip) {
                setSelectedTrip(userTrips[0]);
            }
        } catch (error) {
            console.error('Failed to load trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        if (!selectedTrip) return;
        
        try {
            const data = await api.get(`/messages/${selectedTrip.id}`);
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTrip) return;

        try {
            await api.post(`/messages/${selectedTrip.id}`, {
                content: newMessage.trim()
            });
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading conversations...</p>
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="empty-state">
                <i className="fas fa-comments"></i>
                <h3>No conversations yet</h3>
                <p>Join a trip to start chatting with fellow travelers!</p>
            </div>
        );
    }

    return (
        <div>
            <h2><i className="fas fa-comments"></i> Messages</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginTop: '2rem' }}>
                {/* Trip List */}
                <div className="dashboard-card">
                    <h3><i className="fas fa-list"></i> Your Trips</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {trips.map(trip => (
                            <div
                                key={trip.id}
                                style={{
                                    padding: '1rem',
                                    margin: '0.5rem 0',
                                    border: selectedTrip?.id === trip.id ? '2px solid #667eea' : '1px solid #e1e1e1',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedTrip?.id === trip.id ? '#f8f9ff' : 'white'
                                }}
                                onClick={() => setSelectedTrip(trip)}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>
                                    {trip.title}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                    <i className="fas fa-map-marker-alt"></i> {trip.destination}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.3rem' }}>
                                    <i className="fas fa-users"></i> {trip.participants.length} participants
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Interface */}
                {selectedTrip && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <i className="fas fa-comments"></i>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{selectedTrip.title}</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                    {selectedTrip.participants.length} participants
                                </div>
                            </div>
                        </div>
                        
                        <div className="chat-messages" id="chatMessages">
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    <i className="fas fa-comment-slash"></i>
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.sender_id === user.id ? 'own' : 'other'}`}
                                    >
                                        {message.sender_id !== user.id && (
                                            <div className="message-sender">{message.sender_name}</div>
                                        )}
                                        <div>{message.content}</div>
                                        <div className="message-time">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <form className="chat-input" onSubmit={sendMessage}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                maxLength="500"
                            />
                            <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <h4><i className="fas fa-info-circle"></i> Chat Features (Mock)</h4>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                    In a real application, this would include:
                </p>
                <ul style={{ marginLeft: '2rem', color: '#666' }}>
                    <li>Real-time messaging with WebSockets</li>
                    <li>Message encryption and security</li>
                    <li>File and photo sharing</li>
                    <li>Location sharing</li>
                    <li>Message history and search</li>
                    <li>Push notifications</li>
                </ul>
            </div>
        </div>
    );
}
