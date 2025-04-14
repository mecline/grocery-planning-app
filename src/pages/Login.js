import { Button, TextField, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import React, { useRef } from "react";
import { Navigate, Link as RouterLink } from "react-router-dom";
import { useUserContext } from "../firebase/UserContext";
import { StyledContainer, textColor } from "../theme/MealPlannerTheme";

const Login = () => {
    const emailRef = useRef();
    const pwdRef = useRef();
    const { signInUser, forgotPassword, user } = useUserContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 70px)',
                p: isMobile ? 2 : 3
            }}>
                <StyledContainer sx={{
                    width: isMobile ? '95%' : '400px',
                    maxWidth: '100%',
                    p: isMobile ? 2 : 3,
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <Typography sx={{ 
                        fontSize: isMobile ? '1.5rem' : '1.75rem', 
                        fontWeight: 'bold', 
                        color: textColor,
                        mb: 3
                    }}>
                        Login
                    </Typography>
                    
                    <form onSubmit={onSubmit}>
                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            width: '100%'
                        }}>
                            <TextField
                                id="email"
                                label="Email Address"
                                inputRef={emailRef}
                                fullWidth
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                            />
                            
                            <TextField
                                id="password"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                inputRef={pwdRef}
                                fullWidth
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                            />
                            
                            <Button 
                                variant='outlined' 
                                sx={{ 
                                    color: textColor, 
                                    borderColor: textColor,
                                    py: isMobile ? 1 : 1.5,
                                    mt: 1
                                }} 
                                type="submit"
                                fullWidth
                            >
                                Login
                            </Button>
                            
                            <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                mt: 1
                            }}>
                                <RouterLink 
                                    to="#" 
                                    style={{ 
                                        color: textColor, 
                                        textDecoration: 'none',
                                        textAlign: 'center'
                                    }} 
                                    onClick={forgotPasswordHandler}
                                >
                                    Forgot Password?
                                </RouterLink>
                                
                                <RouterLink 
                                    to="/register" 
                                    style={{ 
                                        color: textColor, 
                                        textDecoration: 'none',
                                        textAlign: 'center'
                                    }}
                                >
                                    Not a user? Create an account
                                </RouterLink>
                            </Box>
                        </Box>
                    </form>
                </StyledContainer>
            </Box>
    );
};

export default Login;