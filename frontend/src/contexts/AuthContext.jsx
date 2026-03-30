import React, { createContext, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
const VITE_BACKEND_URL = "http://localhost:3000";

const AuthContext = createContext(null);

// TODO: get the BACKEND_URL.

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // TODO: Modify me.

    useEffect(()=>{
        // TODO: complete me, by retriving token from localStorage and make an api call to GET /user/me.
        const token = localStorage.getItem('token');

        if (token){
            fetch(`${VITE_BACKEND_URL}/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then (res => res.ok? res.json() : Promise.reject())
                .then(data => setUser(data.user))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                });
        } else {
            setUser(null);
        }
    }, []);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        // Implement the login function using the Fetch API to send a request to /login. 
        // If login fails, return the error message from the response. If it succeeds, you need to do three things:

        // Store the received token in localStorage.
        // Please use 'token' as the key, otherwise the autotester will have trouble restoring session state across hard reloads.
        // Update the user context state.
        // Lastly, redirect the user to /profile. 
        const res = await fetch(`${VITE_BACKEND_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok){return data.message};
        localStorage.setItem('token', data.token);

        const user = await fetch(`${VITE_BACKEND_URL}/user/me`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
        });

        const userData = await user.json();
        setUser(userData.user);
        navigate("/profile");
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        const res = await fetch(`${VITE_BACKEND_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await res.json();
        if (!res.ok){return data.message};
        navigate("/success");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
