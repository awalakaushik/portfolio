import React from 'react'
import './profile-name.scss'

export default class ProfileName extends React.Component {
    render() {
        return (
            <React.Fragment>
                <span className="profile-name">I'm Kaushik</span>
                <span className="profile-description">a full-stack web developer</span>
            </React.Fragment>
        )
    }
}
