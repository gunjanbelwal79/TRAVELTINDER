function AuthComponent({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/login' : '/register';
            const response = await api.post(endpoint, formData);
            
            if (isLogin) {
                onLogin(response.user, response.token);
            } else {
                // Show mock OTP verification
                setShowOTP(true);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerify = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Mock OTP verification
            await api.post('/mock-otp', { code: otpCode });
            
            // Now register the user
            const response = await api.post('/register', formData);
            onLogin(response.user, response.token);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (showOTP) {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <h2><i className="fas fa-mobile-alt"></i> Verify OTP</h2>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleOTPVerify}>
                        <div className="form-group">
                            <label>Enter OTP Code (Mock: any 6 digits)</label>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="123456"
                                maxLength="6"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Verify OTP'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => setShowOTP(false)}
                        >
                            Back
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>
                    <i className="fas fa-plane"></i>
                    {isLogin ? 'Welcome Back' : 'Join Travel Tinder'}
                </h2>
                {error && <div className="alert alert-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    
                    {!isLogin && (
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                            />
                        </div>
                    )}
                    
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>
                
                <div className="auth-toggle">
                    {isLogin ? (
                        <p>
                            Don't have an account? 
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>
                                Sign up here
                            </a>
                        </p>
                    ) : (
                        <p>
                            Already have an account? 
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>
                                Sign in here
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
