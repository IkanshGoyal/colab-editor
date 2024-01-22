import React, { useState } from 'react';
import {v4} from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');

    const createNewRoom = (e) => {
        if(!userName) {
            toast.error("User name is required!");
            return;
        }

        e.preventDefault();
        const id = v4();
        setRoomId(id);
        toast.success('Created new room');

        navigate(`/editor/${id}`, {
            state: { username: userName, },
        });
    };

    const joinRoom = () => {
        if(!roomId || !userName) {
            toast.error("Room Id and User name is required!");
            return;
        }

        navigate(`/editor/${roomId}`, {
            state: { username: userName, },
        });
    };

    const handleEnter = (e) => {
        if(e.code === 'Enter') {
            e.preventDefault();
            joinRoom();
        }
    };

    return (
        <div id='home-container'>
            <div id='container'>
                <h1 className="heading">Colab Editor</h1>
                <p className='info'>Join Existing Room</p>
                <div className="input-container">
                    <input className='input' type='text' placeholder='USER NAME' onChange={(e) => setUserName(e.target.value)} value={userName} onKeyUp={ handleEnter } />
                    <input className='input' type='text' placeholder='ROOM ID' onChange={(e) => setRoomId(e.target.value)} onKeyUp={ handleEnter } />
                    <button className='btn' id='join-btn' onClick={ joinRoom } >JOIN</button>
                </div>
                <p className='info'>OR</p>
                <p className='info'>Create New Room</p>
                <div className="input-container">
                    <input className='input' type='text' placeholder='USER NAME' onChange={(e) => setUserName(e.target.value)} value={userName} />
                    <button onClick={createNewRoom} className='btn' id='join-btn'>CREATE ROOM</button>
                </div>
            </div>
            <footer>
                <h2>Developed by &nbsp;<a href='https://ikanshgoyal.github.io/personal-portfolio/'>Ikansh Goyal</a></h2>
            </footer>
        </div>
    )
}

export default Home