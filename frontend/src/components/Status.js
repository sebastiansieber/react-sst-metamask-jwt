import React from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { BsFillLightningChargeFill, BsFillXCircleFill } from 'react-icons/bs';

function Status(props) {
    if (props.isLoading) {
        return (
            <Button variant="primary" disabled>
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />
                <span className="visually-hidden">Loading...</span>
            </Button>
        );
    } else {
        switch (props.address) {
            case null:
                return (
                    <Button variant="success" disabled>
                        <BsFillXCircleFill />
                    </Button >
                );
            default:
                return (
                    <Button variant="success" disabled>
                        <BsFillLightningChargeFill />
                    </Button>
                );
        }
    }
}

export default Status;
