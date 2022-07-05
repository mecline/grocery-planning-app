import { Button, Container, Link, TextField, Typography } from '@mui/material';
import React, { useRef } from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../firebase/UserContext";
import { backgroundColor, StyledContainer, textColor } from "../theme/MealPlannerTheme";

const Login = () => {
    const emailRef = useRef();
    const pwdRef = useRef();
    const { signInUser, forgotPassword, user } = useUserContext();

    const onSubmit = (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = pwdRef.current.value;
        if (email && password) signInUser(email, password);
    };

    const forgotPasswordHandler = () => {
        const email = emailRef.current.value;
        if (email)
            forgotPassword(email).then(() => {
                emailRef.current.value = "";
            });
    };

    return (
        user ? <Navigate to="/" /> :
            <div style={{
                margin: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <StyledContainer>
                    <Typography style={{ paddingTop: '25px', fontSize: 'large', fontWeight: 'bold', color: textColor }
                    } > Login</ Typography>
                    <form onSubmit={onSubmit}>
                        <div style={{ display: 'inline-grid', padding: '25px' }}>
                            <TextField style={{ marginBottom: '10px' }}
                                id="outlined"
                                label="Email Address"
                                inputRef={emailRef}
                            />
                            <TextField style={{ marginBottom: '10px' }}
                                id="outlined-password-input"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                inputRef={pwdRef}
                            />
                            <Button variant='outlined' style={{ color: textColor, marginBottom: '10px' }} type="submit">Submit</Button>
                            <Link underline="hover" style={{ color: textColor, marginBottom: '10px' }} onClick={() => forgotPasswordHandler}>Forgot Password?</Link>
                            {/* Enable forgot password to pop open a different form where only email should be entered */}
                            <Link underline="hover" style={{ color: textColor }} href={'/register'}>Not a user? Create an account</Link>
                        </div>
                    </form>
                </StyledContainer>
            </div >
    );
};

export default Login;