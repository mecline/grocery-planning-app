import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';
import { useUserContext } from '../firebase/UserContext';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const Navigation = () => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [value, setValue] = React.useState(0); // tabs
    const { user, logoutUser } = useUserContext();
    const navigate = useNavigate();

    React.useEffect(() => {
        // Set active tab based on current path
        const path = window.location.hash.replace('#/', '');
        if (path === '') setValue(0);
        else if (path === 'list') setValue(1);
    }, []);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                backgroundColor: backgroundColor 
            }}
        >
            <Container maxWidth={false}>
                <Toolbar disableGutters sx={{ height: '70px' }}>
                    {/* Logo for mobile */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon sx={{ color: textColor }} />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            <MenuItem onClick={() => {handleCloseNavMenu(); navigate('/');}}>
                                <Typography textAlign="center" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <RestaurantMenuIcon sx={{ mr: 1, fontSize: 20 }} />
                                    Meals
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={() => {handleCloseNavMenu(); navigate('/list');}}>
                                <Typography textAlign="center" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ListAltIcon sx={{ mr: 1, fontSize: 20 }} />
                                    Shopping List
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>

                    {/* App Title */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#/"
                        sx={{
                            mr: 4,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: textColor,
                            textDecoration: 'none',
                        }}
                    >
                        MEAL PLANNER
                    </Typography>

                    {/* Navigation Tabs - Desktop */}
                    {user && (
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Tabs 
                                value={value} 
                                onChange={handleTabChange}
                                textColor="inherit"
                                TabIndicatorProps={{
                                    style: {
                                        backgroundColor: textColor,
                                    }
                                }}
                                sx={{
                                    '& .MuiTab-root': {
                                        color: textColor,
                                        opacity: 0.7,
                                        '&.Mui-selected': {
                                            opacity: 1,
                                            fontWeight: 'bold',
                                        }
                                    }
                                }}
                            >
                                <Tab 
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <RestaurantMenuIcon sx={{ mr: 1 }} />
                                            Meals
                                        </Box>
                                    } 
                                    component={Link} 
                                    to="/" 
                                />
                                <Tab 
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ListAltIcon sx={{ mr: 1 }} />
                                            Shopping List
                                        </Box>
                                    } 
                                    component={Link} 
                                    to="/list" 
                                />
                            </Tabs>
                        </Box>
                    )}

                    {/* Login/Register or User Profile */}
                    <Box sx={{ flexGrow: 0 }}>
                        {user ? (
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <AccountBoxIcon fontSize='large' sx={{color: textColor }}/>
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Link 
                                    to="/login" 
                                    style={{ 
                                        color: textColor, 
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    style={{ 
                                        color: textColor, 
                                        textDecoration: 'none',
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '6px 16px',
                                        borderRadius: '4px'
                                    }}
                                >
                                    Register
                                </Link>
                            </Box>
                        )}
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem 
                                onClick={() => {
                                    handleCloseUserMenu();
                                    navigate('/profile');
                                }}
                            >
                                <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                                <Typography textAlign="center">Profile</Typography>
                            </MenuItem>
                            <MenuItem 
                                onClick={() => {
                                    handleCloseUserMenu();
                                    logoutUser();
                                }}
                            >
                                <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                                <Typography textAlign="center">Logout</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navigation;