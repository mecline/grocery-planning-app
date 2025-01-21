import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Avatar } from '@mui/material';
import { useUserContext } from '../firebase/UserContext';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';

const ProfilePage = () => {
    const { user, updateUserProfile } = useUserContext();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(displayName, email, avatar);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
        setLoading(false);
    };

    const handleAvatarChange = (e) => {
        if (e.target.files[0]) {
            setAvatar(e.target.files[0]);
        }
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
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <Avatar
                        src={user?.photoURL}
                        sx={{ width: 100, height: 100 }}
                    />
                </div>
                
                <Button
                    variant="contained"
                    component="label"
                    style={{ backgroundColor: backgroundColor, marginBottom: '20px' }}
                >
                    Upload Photo
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </Button>

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
        </Container>
    );
};

export default ProfilePage;
