import React, { useState, useEffect, useRef } from 'react';
import "./App.css";

function App() {
    const [messages, setMessages] = useState([]);
    const [channel, setChannel] = useState('');
    const [connectedChannel, setConnectedChannel] = useState('');
    const [socket, setSocket] = useState(null);
    const chatWindowRef = useRef(null);

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    setMessages(prevMessages => [data, ...prevMessages]);
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            };

            return () => {
                if (socket) {
                    socket.close();
                }
            };
        }
    }, [socket]);

    useEffect(() => {
        const chatWindow = chatWindowRef.current;
        if (chatWindow) {
            chatWindow.scrollTop = 0; // Always scroll to top
        }
    }, [messages]);

    const handleChannelChange = (e) => {
        setChannel(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('https://twitchchat-backend.onrender.com/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ channel })
        })
        .then(response => response.json())
        .then(data => {
            const newSocket = new WebSocket('wss://twitchchat-backend.onrender.com');
            setSocket(newSocket);
            setConnectedChannel(channel);
        })
        .catch(error => console.error('Error starting channel:', error));
    };

    return (
        <div className="App">
            <h1>Twitch Chat {connectedChannel && ` - ${connectedChannel}`}</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={channel}
                    onChange={handleChannelChange}
                    placeholder="Enter channel name"
                />
                <button type="submit">Connect</button>
            </form>
            <div
                className="chat-window"
                ref={chatWindowRef}
            >
                {messages.slice().map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${msg.type === 'notification' ? 'notification' : ''}`}
                    >
                        <strong>{msg.user}</strong> {msg.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;