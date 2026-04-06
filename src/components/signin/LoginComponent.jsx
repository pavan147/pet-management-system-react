import React, { useState } from 'react'
import { loginAPICall, storeToken, saveLoggedInUser } from '../../services/VeterinaryRegistrationService';
import { useNavigate, Link } from 'react-router-dom';
import './signin.css';

const LoginComponent = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigator = useNavigate();

    async function handleLoginForm(e) {
        e.preventDefault();
        setErrorMessage(''); // Clear previous error
        setIsLoading(true);

        try {
            const response = await loginAPICall(username, password);
            console.log(response.data);

            const token = 'Bearer ' + response.data.accessToken;
            const role = response.data.role;
            const displayName = (response.data.name || '').trim() || username;

            storeToken(token);
            saveLoggedInUser(displayName, role);
            navigator("/");
            window.location.reload(false);
        } catch (error) {
            // Check for error response and set message
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Username or password incorrect");
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='login-container'>
            <div className='container mt-5 pt-5 pb-5'>
                <div className='row align-items-center min-vh-100'>
                    <div className='col-md-6 offset-md-3 col-lg-4 offset-lg-4'>
                        <div className='login-card'>
                            {/* Header */}
                            <div className='login-header'>
                                <div className='login-icon'>🐾</div>
                                <h2 className='login-title'>PetCare Pro</h2>
                                <p className='login-subtitle'>Welcome back to your pet's care center</p>
                            </div>

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    <i className="bi bi-exclamation-circle"></i> {errorMessage}
                                    <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                                </div>
                            )}

                            {/* Info Alert */}
                            <div className="alert alert-info alert-sm" role="alert">
                                <strong>ℹ️ Note:</strong> Only registered users can log in. Contact reception to register.
                            </div>

                            {/* Form */}
                            <form onSubmit={handleLoginForm}>
                                <div className='form-group mb-4'>
                                    <label className='form-label'>
                                        <i className="bi bi-person"></i> Username or Email
                                    </label>
                                    <input
                                        type='text'
                                        name='username'
                                        className='form-control form-control-lg'
                                        placeholder='Enter your username or email'
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className='form-group mb-4'>
                                    <label className='form-label'>
                                        <i className="bi bi-lock"></i> Password
                                    </label>
                                    <input
                                        type='password'
                                        name='password'
                                        className='form-control form-control-lg'
                                        placeholder='Enter your password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className='form-group mb-4'>
                                    <button 
                                        className='btn btn-primary w-100 btn-lg fw-bold' 
                                        type='submit'
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Footer Links */}
                            <div className="login-footer">
                                <div className="d-flex justify-content-between">
                                    <Link to="/forgot-password" className="footer-link">
                                        <i className="bi bi-question-circle"></i> Forgot Password?
                                    </Link>
                                    <Link to="/forgot-username" className="footer-link">
                                        <i className="bi bi-question-circle"></i> Forgot Username?
                                    </Link>
                                </div>
                                <div className="text-center mt-3 pt-3 border-top">
                                    <p className="text-muted mb-0">
                                        Not registered yet? <Link to="/book-appointment" className="register-link">Book an appointment</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;