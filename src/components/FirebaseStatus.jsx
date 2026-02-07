import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

const FirebaseStatus = () => {
    const [status, setStatus] = useState('Checking...');
    const [logs, setLogs] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(u => {
            setUser(u);
            if (u) {
                log(`Auth User Detected: ${u.uid}`);
            } else {
                log('No User Logged In');
            }
        });
        return unsubscribe;
    }, []);

    const log = (msg) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const testFirestore = async () => {
        log('Testing Firestore Write...');
        try {
            if (!user) {
                log('Error: Must be logged in to test write');
                return;
            }
            const docRef = await addDoc(collection(db, 'test_connection'), {
                timestamp: new Date(),
                test: 'success',
                uid: user.uid
            });
            log(`Firestore Success! Written doc ID: ${docRef.id}`);
            setStatus('Firestore Connected ✅');
        } catch (error) {
            log(`Firestore Error: ${error.message}`);
            log(`Code: ${error.code}`);
            setStatus('Firestore Failed ❌');
        }
    };

    const testStorage = async () => {
        log('Testing Storage Write...');
        try {
            if (!user) {
                log('Error: Must be logged in to test storage');
                return;
            }
            const storageRef = ref(storage, `test_connection/${Date.now()}.txt`);
            await uploadString(storageRef, 'Connection Test Successful');
            log('Storage Success! File uploaded.');
            setStatus('Storage Connected ✅');
        } catch (error) {
            log(`Storage Error: ${error.message}`);
            if (error.message.includes('CORS')) {
                log('Suggest: Check CORS configuration on Firebase Console');
            }
            setStatus('Storage Failed ❌');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid #06B6D4',
            borderRadius: '8px',
            padding: '15px',
            zIndex: 99999,
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            <h3 style={{ color: '#06B6D4', margin: '0 0 10px 0' }}>Firebase Diagnostics</h3>
            <div style={{ marginBottom: '10px' }}>
                Status: <strong>{status}</strong>
            </div>
            <div style={{ marginBottom: '10px' }}>
                Auth: {user ? <span style={{ color: '#4ade80' }}>Logged In</span> : <span style={{ color: '#f87171' }}>Logged Out</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button
                    onClick={testFirestore}
                    style={{
                        flex: 1,
                        background: '#334155',
                        border: '1px solid #475569',
                        color: 'white',
                        padding: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Test DB
                </button>
                <button
                    onClick={testStorage}
                    style={{
                        flex: 1,
                        background: '#334155',
                        border: '1px solid #475569',
                        color: 'white',
                        padding: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Test Upload
                </button>
            </div>

            <div style={{
                height: '150px',
                overflowY: 'auto',
                background: '#0f172a',
                padding: '5px',
                border: '1px solid #1e293b'
            }}>
                {logs.map((l, i) => (
                    <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid #1e293b' }}>{l}</div>
                ))}
            </div>
            <button
                onClick={() => document.querySelector('.firebase-diag').remove()}
                style={{
                    marginTop: '5px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '10px'
                }}
            >
                Close Diagnostics
            </button>
        </div>
    );
};

export default FirebaseStatus;
