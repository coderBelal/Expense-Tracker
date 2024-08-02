import { useState } from 'react';
import "./Auth.css";
import { auth, provider } from "../../Config/Firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const Index = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const signInWithGoogle = async () => {
        setIsLoading(true);
        try {
            const results = await signInWithPopup(auth, provider);
            const authInfo = {
                userID: results.user.uid,
                name: results.user.displayName,
                profilePhoto: results.user.photoURL,
                isAuth: true,
            };
            localStorage.setItem("auth", JSON.stringify(authInfo));
            navigate("/expense");
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            if (error.code === 'auth/popup-blocked') {
                alert("Please enable pop-ups in your browser settings and try again.");
            } else if (error.code === 'auth/cancelled-popup-request') {
                console.log("Another sign-in request was made. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <button 
                className="login-with-google-btn" 
                onClick={signInWithGoogle} 
                disabled={isLoading}>
                <FontAwesomeIcon icon={faGoogle} className="google-icon" />
                {isLoading ? 'Signing In...' : 'Sign In With Google'}
            </button>
        </div>
    );
};

export default Index;
