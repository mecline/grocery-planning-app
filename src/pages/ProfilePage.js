import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert, Snackbar, Box, useMediaQuery, useTheme } from '@mui/material';
import { useUserContext } from '../firebase/UserContext';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';

const ProfilePage = () => {
    const { user, updateUserProfile } = useUserContext();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <Box sx={{ 
            p: isMobile ? 2 : 4,
            pt: isMobile ? 2 : 4,
            pb: isMobile ? 6 : 4, // Extra padding at bottom for mobile navigation
            height: '100%',
            boxSizing: 'border-box'
        }}>
            <Container style={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                padding: isMobile ? '20px' : '30px', 
                maxWidth: isMobile ? '100%' : '600px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    style={{ 
                        color: textColor, 
                        marginBottom: '20px',
                        fontWeight: isMobile ? '500' : 'bold'
                    }}
                >
                    Edit Profile
                </Typography>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <TextField
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        fullWidth
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                    />

                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        variant="outlined"
                        type="email"
                        size={isMobile ? "small" : "medium"}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        style={{ backgroundColor: backgroundColor, color: textColor }}
                        disabled={loading}
                        size={isMobile ? "medium" : "large"}
                        sx={{ 
                            mt: 2,
                            py: isMobile ? 1 : 1.5
                        }}
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
        </Box>
    );
};

export default ProfilePage;