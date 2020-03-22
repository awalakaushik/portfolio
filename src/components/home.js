import React from "react";
import "./home.scss";

import Avatar from 'avataaars';

export default class Home extends React.Component {
    render() {
        return (
            <div className="home">
                <Avatar
                    avatarStyle='Transparent'
                    topType='ShortHairShortWaved'
                    accessoriesType='Round'
                    hairColor='Black'
                    facialHairType='BeardLight'
                    facialHairColor='Black'
                    clotheType='BlazerSweater'
                    eyeType='Default'
                    eyebrowType='Default'
                    mouthType='Smile'
                    skinColor='Yellow'
                    />
                Kaushik Reddy Awala
            </div>
        );
    }
}
