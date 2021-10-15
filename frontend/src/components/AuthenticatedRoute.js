import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";

// <Redirect to={`/?redirect=${pathname}${search}`} />

export default function AuthenticatedRoute({ children, ...rest }) {
    //const { pathname, search } = useLocation();
    const { isAuthenticated } = useAppContext();
    return (
        <Route {...rest}>
            {isAuthenticated ? (
                children
            ) : (
                <Redirect to="/" />
            )}
        </Route>
    );
}
