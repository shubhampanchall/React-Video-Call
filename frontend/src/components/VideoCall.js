import React, { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import '../App.css'; // Adjust the path to go one level up to access App.css
// src/components/VideoCall.js
import { sendEmail } from '../api/emailService'; // Use named import instead of default import


const VideoCall = () => {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [email, setEmail] = useState('');
  const [inCall, setInCall] = useState(false); // Track if a call is active
  const [recordingURL, setRecordingURL] = useState(null); // Track the URL of the recorded video
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false); // Track download prompt visibility
  const [redirectToMain, setRedirectToMain] = useState(false); // Track if we should redirect to main page

  const peerRef = useRef(null);
  const callRef = useRef(null);
  const localStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null); // For recording
  const recordedChunks = useRef([]); // For holding recorded video data

  const handleEndCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.close(); // End the call
      setInCall(false); // Update state to indicate call has ended

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop(); // Stop recording
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop()); // Stop all media tracks
      }

      const videoElement = document.querySelector('video#remoteVideo');
      videoElement.srcObject = null; // Remove the remote video stream

      // Show the download prompt
      setShowDownloadPrompt(true);

      // Notify the remote peer that the call has ended
      if (callRef.current) {
        const conn = peerRef.current.connect(remotePeerId);
        conn.on('open', () => {
          conn.send('endCall'); // Send message to remote peer to end call
        });
      }
    }
  }, [remotePeerId]); // Include remotePeerId as a dependency

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer; // Store peer instance

    peer.on('open', id => {
      setPeerId(id); // Set peer ID when peer connection opens
    });

    peer.on('call', call => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        localStreamRef.current = stream;
        call.answer(stream); // Answer incoming call with local stream
        callRef.current = call; // Store the call instance
        setInCall(true); // Mark that a call is in progress

        call.on('stream', remoteStream => {
          const videoElement = document.querySelector('video#remoteVideo');
          videoElement.srcObject = remoteStream; // Display remote video stream
        });

        // Start recording the local stream
        startRecording(stream);
      });
    });

    // Listen for messages from the remote peer
    peer.on('connection', conn => {
      conn.on('data', data => {
        if (data === 'endCall') {
          handleEndCall(); // End call if the message is received
        }
      });
    });

    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [handleEndCall]); // Include handleEndCall in the dependency array

  const handleSendEmail = async () => {
    if (!email) {
      alert('Please enter an email address.'); // Validate email input
      return; // Exit the function if no email is provided
    }
  
    try {
      await sendEmail(peerId, email); // Use sendEmail instead of emailService
      alert('Peer ID sent via email'); // Success message
    } catch (error) {
      alert('Failed to send email. Please try again.'); // Error handling
      console.error('Error sending email:', error); // Log the error for debugging
    }
  };
  
  const handleCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStreamRef.current = stream;
      const call = peerRef.current.call(remotePeerId, stream); // Call remote peer
      callRef.current = call; // Store the call instance
      setInCall(true); // Mark that a call is in progress

      call.on('stream', remoteStream => {
        const videoElement = document.querySelector('video#remoteVideo');
        videoElement.srcObject = remoteStream; // Display remote video stream
      });

      // Start recording the local stream
      startRecording(stream);
    });
  };

  const startRecording = (stream) => {
    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunks.current = []; // Reset recorded chunks

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordingURL(url); // Set URL to download the recording
    };

    mediaRecorderRef.current.start(); // Start recording
  };

  const handleCopyPeerId = () => {
    navigator.clipboard.writeText(peerId).then(() => {
      alert('Peer ID copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleDownload = () => {
    // Trigger the download of the video
    const link = document.createElement('a');
    link.href = recordingURL;
    link.download = 'video-call-recording.webm';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Redirect to main page
    setRedirectToMain(true);
  };

  const handleNoDownload = () => {
    // Redirect to main page
    setRedirectToMain(true);
  };

  if (redirectToMain) {
    // Redirect logic (you can replace this with your main page's URL)
    window.location.href = '/'; // Update with the path of your main page
  }

  return (
    <div className="video-call-container">
      {/* Left side with buttons and inputs */}
      <div className="controls-container">
        <h1>Connect Here</h1>
        <button className="action-button" onClick={handleCopyPeerId}>Copy ID</button>

        <input 
          type="text" 
          placeholder="Enter a ID" 
          className="input-field"
          onChange={e => setRemotePeerId(e.target.value)} 
          disabled={inCall} 
        />
        <button className="action-button" onClick={handleCall} disabled={inCall || !remotePeerId}>Start Call</button>

        {inCall && (
          <button className="end-call-button" onClick={handleEndCall}>
            End Call
          </button>
        )}

        {showDownloadPrompt && (
          <div>
            <p>Do you want to Download Call?</p>
            <button className="download-button" onClick={handleDownload}>Yes, Download</button>
            <button className="action-button" onClick={handleNoDownload}>No</button>
          </div>
        )}

        {/* Email Input and Button Moved to Bottom */}
        <div className="email-container">
          <input 
            type="email" 
            placeholder="Enter email to send Peer ID" 
            className="input-field"
            value={email} // Bind the input value
            onChange={e => setEmail(e.target.value)} // Update email state
          />
          <button className="action-button" onClick={handleSendEmail}>Send Peer ID via Email</button>
        </div>
      </div>

      {/* Right side for the video */}
      <div className="video-container">
        <video id="remoteVideo" autoPlay className="remote-video"></video>
      </div>
    </div>
  );
};

export default VideoCall;
