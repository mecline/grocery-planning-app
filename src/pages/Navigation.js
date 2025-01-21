import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';
import { useUserContext } from '../firebase/UserContext';

const pages = [
    {
        title: 'Meals',
        path: 'meals',
        loggedIn: true
    },
    {
        title: 'List',
        path: 'list',
        loggedIn: true
    },
    {
        title: 'Login',
        path: 'login',
        loggedIn: false
    },
    {
        title: 'Register',
        path: 'register',
        loggedIn: false
    }
]
const settings = ['Profile', 'Account', 'Logout'];

const Navigation = () => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const { user, logoutUser } = useUserContext();

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

    const handleLinkClick = (page) => {
        return (
            <Link underline="hover" style={{ color: textColor, textDecoration: 'none' }} to={`/${page.path}`}>
                {page.title}
            </Link>
        )
    }

    return (
        <AppBar position="static">
            <Container style={{ backgroundColor: backgroundColor }} maxWidth={false}>
                <Toolbar>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
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
                            {/* {pages.map((page) => (
                                <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">
                                        <Link underline="hover" style={{ color: textColor, textDecoration: 'none' }} to={`/${page.path}`}>
                                            {page.title}
                                        </Link>
                                    </Typography>
                                </MenuItem>
                            ))} */}
                        </Menu>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {user ? // controls what pages a user is able to navigate to from toolbar
                            <React.Fragment>
                                {pages.map((page) => (
                                    page.loggedIn &&
                                    <Button
                                        key={page.title}
                                        onClick={() => handleLinkClick(page)}
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        <Link underline="hover" style={{ color: textColor, textDecoration: 'none' }} to={`/${page.path}`}>
                                            {page.title}
                                        </Link>
                                    </Button>
                                ))}
                                {user &&
                                    <Button sx={{ my: 2, color: 'white', display: 'block' }} onClick={() => logoutUser()}>
                                        <Typography style={{ fontSize: 'small', color: textColor }}>Sign out</Typography>
                                    </Button>
                                }
                            </React.Fragment>
                            :
                            <React.Fragment>
                                {pages.map((page) => (
                                    !page.loggedIn &&
                                    <Button
                                        key={page.title}
                                        onClick={() => handleLinkClick(page)}
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        <Link underline="hover" style={{ color: textColor, textDecoration: 'none' }} to={`/${page.path}`}>
                                            {page.title}
                                        </Link>
                                    </Button>
                                ))}
                                {user &&
                                    <Button sx={{ my: 2, color: 'white', display: 'block' }} onClick={() => logoutUser()}>
                                        <Typography style={{ fontSize: 'small', color: textColor }}>Sign out</Typography>
                                    </Button>
                                }
                            </React.Fragment>
                        }
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                            </IconButton>
                        </Tooltip>
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
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default Navigation;
