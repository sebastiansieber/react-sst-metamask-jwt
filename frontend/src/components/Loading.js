import React from "react";

function Loading(props) {
    return props.isLoading ? (
        <div>Loading...</div>
    ) : (
        <div>Loaded</div>
    );
}

export default Loading;
