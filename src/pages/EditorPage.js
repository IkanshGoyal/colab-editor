import React, { useState, useRef, useEffect } from 'react';
import User from '../components/User';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const navigator = useNavigate();
    const { roomId } = useParams();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => errorHandler(err));
            socketRef.current.on('connect_failed', (err) => errorHandler(err));

            function errorHandler(err) {
                toast.error('Failed to connect. Try again later!');
                navigator('/');
            }

            socketRef.current.emit('join', {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on('joined', ({users, username, socketId}) => {
                if(username !== location.state?.username) {
                    toast.success(`${username} joined the room`);
                }
                setUsers(users);
                socketRef.current.emit('sync', {code: codeRef.current, socketId,});
            });

            socketRef.current.on('disconnected', ({socketId, username}) => {
                toast.success(`${username} left the room`);
                setUsers((prev) => {
                    return prev.filter((user) => user.socketId !== socketId);
                });
            });
        };
        init();
        return () => {
            if(socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off('joined');
                socketRef.current.off('disconnected');
            }
        };
    }, [location.state?.username, navigator, roomId]);

    async function copyId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("Room Id copied to clipboard");
        } catch(e) {
            toast.error("Room Id could not be copied");
            console.log(e);
        }
    }

    function exitRoom() {
        navigator('/');
    }

    if(!location.state) {
        return <Navigate to='/' />;
    }

    return (
        <div id='edit-container'>
            <div id='editor'>
                <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {
                    codeRef.current = code;
                }} />
            </div>
            <div id='menu'>
                <div id='top-container'>
                    <p id='connected'>Connected Users</p>
                    <div id='users'>
                        { users.map((user) => (
                            <User key={user.socketId} username={user.username} />
                        ))}
                    </div>
                </div>
                <div id='bottom-container'>
                    <button className='btn1' id='copy-btn' onClick={copyId} >COPY ROOM ID</button>
                    <button className='btn1' id='exit-btn' onClick={exitRoom} >EXIT</button>
                </div>
            </div>
        </div>
    )
}

export default EditorPage;