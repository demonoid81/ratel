// Copyright 2017-2021 Dgraph Labs, Inc. and Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

export default function EditUserModal({
    executeMutation,
    isCreate,
    onCancel,
    onDone,
    saveUser,
    userName: userNameSupplied,
    userUid,
}) {
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState(userNameSupplied || "");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const validate = () => {
        if (isCreate && !userName) {
            setErrorMessage("Username is required");
            return false;
        }
        if (!password) {
            setErrorMessage("Password is required");
            return false;
        }
        if (password !== passwordConfirm) {
            setErrorMessage("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            await saveUser(isCreate, userUid, userName, password);
            setLoading(false);
            onDone();
        } catch (errorMessage) {
            setErrorMessage(`Could not save user: ${errorMessage}`);
            setLoading(false);
        }
    };

    return (
        <Modal show={true} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>{isCreate ? "Create" : "Edit"} User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="userId">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Username"
                        disabled={!isCreate || loading}
                        onChange={({ target: { value: userName } }) =>
                            setUserName(userName)
                        }
                        value={userName}
                    />
                </Form.Group>

                <Form.Group controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter password"
                        disabled={loading}
                        onChange={({ target: { value } }) => setPassword(value)}
                        value={password}
                    />
                </Form.Group>

                <Form.Group controlId="passwordRepeat">
                    Re-enter password
                    <Form.Control
                        type="password"
                        placeholder="Enter password again"
                        onChange={({ target: { value } }) =>
                            setPasswordConfirm(value)
                        }
                        disabled={loading}
                        value={passwordConfirm}
                    />
                </Form.Group>
                {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={onCancel}
                    disabled={loading}
                    variant="default"
                    className="pull-left"
                >
                    Cancel
                </Button>

                <Button
                    variant="primary"
                    disabled={loading}
                    onClick={handleSave}
                >
                    &nbsp;
                    {loading ? "Altering ACL..." : "Save"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
