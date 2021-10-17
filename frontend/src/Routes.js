import React from "react";
import { Route, Switch } from "react-router-dom";

import AuthenticatedRoute from "./components/AuthenticatedRoute";

import NotFound from "./containers/NotFound";
import Private from "./containers/Private";
import Public from "./containers/Public";

export default function Routes() {
    return (
        <Switch>
            <Route exact path="/">
                <Public />
            </Route>
            <AuthenticatedRoute exact path="/private">
                <Private />
            </AuthenticatedRoute>
            {/* Finally, catch all unmatched routes */}
            <Route>
                <NotFound />
            </Route>
        </Switch>
    );
}
