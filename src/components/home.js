import React from "react";
import "./home.scss";

import Avatar from './home/avatar';
import ProfileName from './home/profile-name';

export default class Home extends React.Component {
    render() {
        return (
            <div className="home">
                <Avatar />
                <ProfileName />
            </div>
        );
    }
}
