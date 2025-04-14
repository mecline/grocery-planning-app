import React, { useRef } from "react";
import { useUserContext } from "../firebase/UserContext";
import { Button, TextField, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import { Link } from "react-router-dom";
import { StyledContainer, textColor } from "../theme/MealPlannerTheme";

const Register = () => {
    const emailRef = useRef();
    const nameRef = useRef();
    const pwdRef = useRef();
    const { registerUser } = useUserContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const onSubmit = (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const name = nameRef.current.value;
        const password = pwdRef.current.value;
        if (email && password && name) registerUser(email, password, name);
    };

    return (
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
                    Register
                </Typography>
                
                <form onSubmit={onSubmit}>
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        width: '100%'
                    }}>
                        <TextField
                            required
                            id="username"
                            label="Username"
                            inputRef={nameRef}
                            fullWidth
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                        />
                        
                        <TextField
                            required
                            id="email"
                            label="Email Address"
                            inputRef={emailRef}
                            fullWidth
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                        />
                        
                        <TextField
                            required
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
                            Register
                        </Button>
                        
                        <Link 
                            to="/login" 
                            style={{ 
                                color: textColor, 
                                textDecoration: 'none',
                                textAlign: 'center',
                                marginTop: '8px'
                            }}
                        >
                            Already a user? Log in
                        </Link>
                    </Box>
                </form>
            </StyledContainer>
        </Box>
    );
};

export default Register;