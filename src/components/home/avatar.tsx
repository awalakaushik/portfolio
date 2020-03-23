import React from 'react';
import logo from '../../assets/avatar.svg';

export default class Avatar extends React.Component {
    render() {
        return (
            <React.Fragment>
                <img className="avatar" src={logo} alt="avatar_logo"/>
            </React.Fragment>
        )
    }
}
