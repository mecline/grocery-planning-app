// import Button from "@restart/ui/esm/Button";
// import "bootstrap/dist/css/bootstrap.min.css";
import React from 'react';
import { Container, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from 'react-router-bootstrap';
import { useUserContext } from "../firebase/UserContext";

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#fff",
//         alignItems: "center",
//         justifyContent: "center",
//     },
// });

const Navigation = () => {
    const { user, logoutUser } = useUserContext();

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="#home">Meal Planning App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        {user ?
                            <React.Fragment>
                                <LinkContainer to="/">
                                    <Nav.Link>Home</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/meals">
                                    <Nav.Link>Meal Page</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/list">
                                    <Nav.Link>List Page</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/">
                                    <Nav.Link onClick={() => logoutUser()}>Sign Out</Nav.Link>
                                </LinkContainer>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <LinkContainer to="/login">
                                    <Nav.Link>Login</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/signup">
                                    <Nav.Link>Register</Nav.Link>
                                </LinkContainer>
                            </React.Fragment>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Navigation;
