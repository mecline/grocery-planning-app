import React, { useRef } from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../firebase/UserContext";

const Login = () => {
    const emailRef = useRef();
    const psdRef = useRef();
    const { signInUser, forgotPassword, user } = useUserContext();

    const onSubmit = (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = psdRef.current.value;
        if (email && password) signInUser(email, password);
    };

    const forgotPasswordHandler = () => {
        const email = emailRef.current.value;
        if (email)
            forgotPassword(email).then(() => {
                emailRef.current.value = "";
            });
    };
    console.log(user);

    return (
        user ? <Navigate to="/" /> :
            <div>
                <h2> Login </h2>
                <form onSubmit={onSubmit}>
                    <input placeholder="Email" type="email" ref={emailRef} />
                    <input placeholder="Password" type="password" ref={psdRef} />
                    <button type="submit">Sign In</button>
                    <p onClick={forgotPasswordHandler}>Forgot Password?</p>
                </form>
                {console.log(user?.email)}
            </div>
    );
};

export default Login;