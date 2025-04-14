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
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';
import { useUserContext } from '../firebase/UserContext';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMediaQuery, useTheme, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

const Navigation = () => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [value, setValue] = React.useState(0); // tabs
    const { user, logoutUser } = useUserContext();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    React.useEffect(() => {
        // Set active tab based on current path
        const path = location.pathname;
        if (path === '/' || path === '') setValue(0);
        else if (path === '/list') setValue(1);
        else if (path === '/profile') setValue(2);
    }, [location.pathname]);

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

    const handleBottomNavChange = (event, newValue) => {
        setValue(newValue);
        if (newValue === 0) navigate('/');
        else if (newValue === 1) navigate('/list');
        else if (newValue === 2) navigate('/profile');
    };

    return (
        <>
            <AppBar 
                position="static" 
                elevation={0}
                sx={{ 
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: backgroundColor 
                }}
            >
                <Container maxWidth={false}>
                    <Toolbar disableGutters sx={{ height: isMobile ? '60px' : '70px' }}>
                        {/* App Title */}
                        <Typography
                            variant={isMobile ? "h6" : "h5"}
                            noWrap
                            component="a"
                            href="#/"
                            sx={{
                                mr: 4,
                                display: { xs: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.1rem',
                                color: textColor,
                                textDecoration: 'none',
                                fontSize: isMobile ? '1.15rem' : '1.5rem',
                            }}
                        >
                            MEAL PLANNER
                        </Typography>

                        {/* Navigation Tabs - Desktop Only */}
                        {user && !isMobile && (
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
                        <Box sx={{ flexGrow: 0, ml: 'auto' }}>
                            {user ? (
                                <Tooltip title="Account Settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: isMobile ? 0.5 : 1 }}>
                                        <AccountBoxIcon fontSize={isMobile ? 'medium' : 'large'} sx={{color: textColor }}/>
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2 }}>
                                    <Link 
                                        to="/login" 
                                        style={{ 
                                            color: textColor, 
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: isMobile ? '14px' : '16px'
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
                                            padding: isMobile ? '4px 12px' : '6px 16px',
                                            borderRadius: '4px',
                                            fontSize: isMobile ? '14px' : '16px'
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

            {/* Bottom Navigation for Mobile */}
            {user && isMobile && (
                <Paper 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 0, 
                        left: 0, 
                        right: 0,
                        zIndex: 1000,
                        borderTop: '1px solid rgba(0,0,0,0.05)'
                    }} 
                    elevation={3}
                >
                    <BottomNavigation
                        value={value}
                        onChange={handleBottomNavChange}
                        showLabels
                        sx={{
                            backgroundColor: backgroundColor,
                            '& .MuiBottomNavigationAction-root': {
                                color: textColor,
                                opacity: 0.6
                            },
                            '& .Mui-selected': {
                                opacity: 1
                            }
                        }}
                    >
                        <BottomNavigationAction 
                            label="Meals" 
                            icon={<RestaurantMenuIcon />} 
                        />
                        <BottomNavigationAction 
                            label="List" 
                            icon={<ListAltIcon />} 
                        />
                        <BottomNavigationAction 
                            label="Profile" 
                            icon={<PersonIcon />} 
                        />
                    </BottomNavigation>
                </Paper>
            )}
        </>
    );
};

export default Navigation;