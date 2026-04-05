import React, { useState } from 'react'
import { loginAPICall, storeToken, saveLoggedInUser } from '../../services/VeterinaryRegistrationService';
import { useNavigate, Link } from 'react-router-dom';

const LoginComponent = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigator = useNavigate();

    async function handleLoginForm(e) {
        e.preventDefault();

        setErrorMessage(''); // Clear previous error

        await loginAPICall(username, password)
            .then((response) => {
                console.log(response.data);

                const token = 'Bearer ' + response.data.accessToken;
                const role = response.data.role;

                storeToken(token);
                saveLoggedInUser(username, role);
                navigator("//dashboard");

                window.location.reload(false);
            })
            .catch(error => {
                // Check for error response and set message
                if (error.response && error.response.data && error.response.data.message) {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage("Username or password incorrect");
                }
                console.error(error);
            });
    }

    return (
        <div className='container'>
            <br /> <br />
            <div className='row'>
                <div className='col-md-6 offset-md-3'>
                    <div className='card'>
                        <div className='card-header'>
                            <h2 className='text-center'>Login Form</h2>
                        </div>

                        <div className='card-body'>
                            {/* Registration Note */}
                            <div className="alert alert-info" role="alert">
                                <strong>Note:</strong> Only the receptionist can register users and pets. If you are not yet registered, please visit the receptionist to complete your registration. You will be able to log in and view the dashboard only after you and your pet have been registered.
                            </div>

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMessage}
                                </div>
                            )}

                            <form>
                                <div className='row mb-3'>
                                    <label className='col-md-3 control-label'>Username or Email</label>
                                    <div className='col-md-9'>
                                        <input
                                            type='text'
                                            name='username'
                                            className='form-control'
                                            placeholder='Enter username'
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className='row mb-3'>
                                    <label className='col-md-3 control-label'>Password</label>
                                    <div className='col-md-9'>
                                        <input
                                            type='password'
                                            name='password'
                                            className='form-control'
                                            placeholder='Enter password'
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className='form-group mb-3'>
                                    <button className='btn btn-primary' onClick={handleLoginForm}>Submit</button>
                                </div>
                            </form>

                            {/* Forgot Links */}
                            <div className="d-flex justify-content-between mt-3">
                                <Link to="/forgot-password">Forgot Password?</Link>
                                <Link to="/forgot-username">Forgot Username?</Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginComponent;