import React from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "./UserContext";

function PrivateRoute({ children }) {
    const { user } = useUserContext();

    return (
        <React.Fragment>
            {user ? children : <Navigate to="/login" />}
        </React.Fragment>
    );
}

export default PrivateRoute;