import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert, Snackbar } from '@mui/material';
import { useUserContext } from '../firebase/UserContext';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';

const ProfilePage = () => {
    const { user, updateUserProfile } = useUserContext();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(displayName, email);
            setSuccess(true);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
        setLoading(false);
    };

    return (
        <Container style={{ 
            backgroundColor: 'white', 
            borderRadius: '10px', 
            padding: '20px', 
            marginTop: '50px',
            maxWidth: '600px' 
        }}>
            <Typography variant="h4" style={{ color: textColor, marginBottom: '20px' }}>
                Edit Profile
            </Typography>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <TextField
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    fullWidth
                    variant="outlined"
                />

                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    variant="outlined"
                    type="email"
                />

                <Button
                    type="submit"
                    variant="contained"
                    style={{ backgroundColor: backgroundColor }}
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Save Changes'}
                </Button>
            </form>
            <Snackbar 
                open={success} 
                autoHideDuration={6000} 
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    Profile updated successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProfilePage;
