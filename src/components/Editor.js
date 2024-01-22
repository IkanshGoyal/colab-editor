import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/clike/clike'; 
import 'codemirror/mode/python/python'; 
import 'codemirror/mode/javascript/javascript';

var initialText = "console.log('Hello World');";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');

    useEffect(() => {
        async function init() {
            const mode = getModeFromLanguage(selectedLanguage);

            editorRef.current = Codemirror.fromTextArea(document.getElementById('edit'), {
                mode,
                theme: 'dracula',
                lineNumbers: true,
                autoCloseTags: true,
                autoCloseBrackets: true,
            });

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit('code_change', {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, [roomId, socketRef, onCodeChange, selectedLanguage]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on('code_change', ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('code_change');
            }
        };
    }, [socketRef.current]);

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
        editorRef.current.setValue('${initialText}');
    };

    return (
        <div>
            <div id='header'>
                <h1 className='heading'>Colab Editor</h1>
                <label htmlFor="language">Language:</label>
                <select id="language" onChange={handleLanguageChange} value={selectedLanguage}>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                </select>
            </div>
            <textarea id='edit'></textarea>
        </div>
    );
};

export default Editor;

function getModeFromLanguage(language) {
    switch (language) {
        case 'cpp':
        case 'java':
            initialText = "//Hello World";
            return 'text/x-c++src';
        case 'python':
            initialText = "print('Hello World')";
            return 'python';
        case 'javascript':
            initialText = "console.log('Hello World');";
            return 'javascript';
        default:
            return 'javascript';
    }
}