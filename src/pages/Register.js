import React, { useRef } from "react";
import { useUserContext } from "../firebase/UserContext";
import { Button, TextField, Link, Typography } from '@mui/material';
import { StyledContainer, textColor } from "../theme/MealPlannerTheme";

const Register = () => {
    const emailRef = useRef();
    const nameRef = useRef();
    const pwdRef = useRef();
    const { registerUser } = useUserContext();

    const onSubmit = (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const name = nameRef.current.value;
        const password = pwdRef.current.value;
        if (email && password && name) registerUser(email, password, name);
    };

    return (
        <div style={{
            margin: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <StyledContainer>
                <Typography style={{ paddingTop: '25px', fontSize: 'large', fontWeight: 'bold', color: textColor }
                } > Register</ Typography>
                <form onSubmit={onSubmit}>
                    <div style={{ display: 'inline-grid', padding: '25px' }}>
                        <TextField style={{ marginBottom: '10px' }}
                            required
                            id="outlined"
                            label="Username"
                            inputRef={nameRef}
                        />
                        <TextField style={{ marginBottom: '10px' }}
                            required
                            id="outlined"
                            label="Email Address"
                            inputRef={emailRef}
                        />
                        <TextField style={{ marginBottom: '10px' }}
                            required
                            id="outlined-password-input"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            inputRef={pwdRef}
                        />
                        <Button variant='outlined' style={{ color: textColor, marginBottom: '10px' }} type="submit">Submit</Button>
                        <Link underline="hover" style={{ color: textColor }} href={'/login'}>Already a user? Log in</Link>
                    </div>
                </form>
            </StyledContainer>
        </div >
    );
};

export default Register;