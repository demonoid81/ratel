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

import React, { useEffect } from "react";
import classnames from "classnames";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import useInterval from "use-interval";

import GraphIcon from "./GraphIcon";
import SantaHat from "./SantaHat";

import { Fetching, FetchError, OK, Unknown } from "lib/constants";
import { checkHealth } from "actions/connection";
import HealthDot from "./HealthDot";

import "../assets/css/Sidebar.scss";

export default function Sidebar({ currentMenu, currentOverlay, onToggleMenu }) {
    const currentServer = useSelector(
        state => state.connection.serverHistory[0],
    );

    const dispatch = useDispatch();
    useInterval(() => dispatch(checkHealth({ unknownOnStart: false })), 30000);

    useEffect(() => {
        dispatch(checkHealth({ unknownOnStart: false }));
    }, [currentServer.url, currentServer.refreshToken, dispatch]);

    const renderButton = ({
        menuId,
        label,
        fontAwesomeIcon,
        extraClassname,
        locked,
    }) => {
        const className = currentMenu === menuId ? "link active" : "link";
        return (
            <li className={extraClassname || ""}>
                <a
                    href={"#" + menuId}
                    className={className}
                    onClick={e => {
                        e.preventDefault();
                        onToggleMenu(menuId);
                    }}
                >
                    {<i className={"icon " + fontAwesomeIcon} />}
                    <label>{label}</label>
                    {locked && (
                        <i
                            title="Graph Server seems to restrict access to this feature. Are you logged in?"
                            className="acl-lock fas fa-lock"
                        />
                    )}
                </a>
            </li>
        );
    };

    const renderConnectionString = () => {
        const serverDisplayString = currentServer.url.replace(
            /^[a-z]*:\/\//i,
            "",
        );

        let errorStyle = "";
        if (currentServer.health !== Unknown && currentServer.health !== OK) {
            errorStyle = "error";
        }

        return (
            <div className={"connection-string " + errorStyle}>
                <HealthDot
                    health={currentServer.health}
                    version={currentServer.version}
                />
                <span className="server-name">
                    &nbsp;
                    {serverDisplayString}
                </span>
            </div>
        );
    };

    const getConnectionStatus = () => {
        if (currentServer.health === Unknown) {
            return "Unknown";
        }
        if (currentServer.health === Fetching) {
            return "Establishing connection";
        }
        if (currentServer.health === FetchError) {
            return "Connection Error";
        }
        if (currentServer.health === OK) {
            return "Connected";
        }
    };

    const renderConnectionButton = () => {

        // Santa hat from Dec 20 to Jan 14th (Old New Year is Jan 14th)
        const now = new Date();
        const isChristmas =
            (now.getMonth() === 11 && now.getDate() >= 20) ||
            (now.getMonth() === 0 && now.getDate() < 15);

        const label =
            currentMenu === "connection" ? (
                renderConnectionString()
            ) : (
                <OverlayTrigger
                    placement="right"
                    overlay={
                        <Tooltip>
                            {renderConnectionString()}
                            <span>Status:&nbsp;</span>
                            <label>{getConnectionStatus()}</label>
                        </Tooltip>
                    }
                >
                    {renderConnectionString()}
                </OverlayTrigger>
            );

        return renderButton({
            extraClassname: "brand",
            menuId: "connection",
            label: label,
        });
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-menu">
                <ul>
                    {renderConnectionButton()}

                    {renderButton({
                        menuId: "",
                        icon: (
                            <div
                                style={{
                                    width: "44px",
                                    display: "inline-block",
                                }}
                            >
                            </div>
                        ),
                        label: "Console",
                        locked: currentServer.aclState !== OK,
                    })}

                    {renderButton({
                        menuId: "schema",
                        label: "Schema",
                        locked: currentServer.aclState !== OK,
                    })}

                    {currentServer?.isAclEnabled &&
                        renderButton({
                            menuId: "acl",
                            label: "ACL",
                            locked: currentServer.aclState !== OK,
                        })}

                    {renderButton({
                        menuId: "cluster",
                        label: "Cluster",
                        locked: currentServer.aclState !== OK,
                    })}

                    {currentServer?.isBackupEnabled &&
                        renderButton({
                            menuId: "backups",
                            label: "Backups",
                            locked: currentServer.aclState !== OK,
                        })}
                </ul>
            </div>
            <div
                className={classnames("sidebar-content", {
                    open: !!currentOverlay,
                })}
            >
                {currentOverlay}
            </div>
        </div>
    );
}
