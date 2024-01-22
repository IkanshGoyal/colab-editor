import React from 'react';
import Avatar from 'react-avatar';

const User = ({username}) => {
    return (
        <div id='user'>
            <Avatar name={username} size={50} round='10px' />
            <span id='userName'>{username}</span>
        </div>
    )
}

export default User;