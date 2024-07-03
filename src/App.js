import React, { useState, useEffect } from 'react';
import './App.css';
import gifBackground from './img/background.gif'; 
import Dashboard from '../src/dashboard.jsx';
import { firestore } from './firebase'; // Assuming your Firebase configuration is in a separate file

function App() {
  const [formData, setFormData] = useState({
    ign: '',
    acc: '',
    mq: '',
    growthRateProgress: '',
    growthRateRank: ''
  });

  const [fileList, setFileList] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedSubmit, setConfirmedSubmit] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUrl = localStorage.getItem('webhookUrl');
    if (storedUrl) {
      setWebhookUrl(storedUrl);
    }
  }, []);

  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

  useEffect(() => {
    // Fetch data from Firestore when component mounts
    const fetchUsers = async () => {
      try {
        const snapshot = await firestore.collection('submissions').get();
        const fetchedUsers = snapshot.docs.map(doc => doc.data());
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'growthRateProgress' || name === 'growthRateRank') && !/^\d*(,\d*)*$/.test(value)) {
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const files = Array.from(e.target.files);

    const filteredFiles = files.filter(file => validImageTypes.includes(file.type));
    if (filteredFiles.length > 3) {
      alert('You can upload a maximum of 3 files.');
      return;
    }

    setFileList(filteredFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmedSubmit(true);
    setShowConfirmationModal(false);

    try {
      await sendToDiscord();
      await firestore.collection('submissions').add({
        ign: formData.ign,
        acc: formData.acc,
        mq: formData.mq,
        growthRateProgress: formData.growthRateProgress,
        growthRateRank: formData.growthRateRank,
      });

      console.log('Document successfully written to Firestore!');

      // Update users state with the new submission
      setUsers([...users, { ...formData }]);
      setFormData({
        ign: '',
        acc: '',
        mq: '',
        growthRateProgress: '',
        growthRateRank: ''
      });
      setFileList([]);
      setConfirmedSubmit(false);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmationModal(false);
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = [...fileList];
    updatedFiles.splice(index, 1);
    setFileList(updatedFiles);
  };

  const handleWebhookUrlChange = (e) => {
    setWebhookUrl(e.target.value);
  };

  const sendToDiscord = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('content', `IGN: ${formData.ign}\nACC: ${formData.acc}\nMQ: ${formData.mq}\nProgress: ${formData.growthRateProgress}\nRank: ${formData.growthRateRank}`);

      fileList.forEach((file, index) => {
        formDataToSend.append(`file${index + 1}`, file);
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error sending message to Discord:', errorText);
      } else {
        console.log('Message sent to Discord successfully!');
      }
    } catch (error) {
      console.error('Error sending message to Discord:', error);
    }
  };

  return (
    <div className="background-container">
      <img src={gifBackground} alt="GIF Background" className="background-gif" />
      <div className="App">
        <header className="App-header">
          <h1>OPORTUNISTA GUILD</h1>
          <div className="webhook-url-input">
            <label htmlFor="webhookUrl">Webhook URL:</label>
            <input
              type="text"
              id="webhookUrl"
              value={webhookUrl}
              onChange={handleWebhookUrlChange}
              placeholder="Enter your webhook URL"
            />
          </div>
          <form onSubmit={handleSubmit} className="App-form">
            <div className="form-group">
              <label htmlFor="ign">IGN:</label>
              <input type="text" id="ign" name="ign" value={formData.ign} onChange={handleChange} placeholder="Fill your IGN" required />
            </div>
            <div className="form-group">
              <label htmlFor="acc">ACC:</label>
              <input type="text" id="acc" name="acc" value={formData.acc} onChange={handleChange} placeholder="Enter your ACC" required />
            </div>
            <div className="form-group">
              <label htmlFor="mq">MQ:</label>
              <input type="text" id="mq" name="mq" value={formData.mq} onChange={handleChange} placeholder="Enter your MQ" required />
            </div>
            <div className="form-group">
              <label htmlFor="growthRateProgress">Growth Rate Progress:</label>
              <input type="text" id="growthRateProgress" name="growthRateProgress" value={formData.growthRateProgress} onChange={handleChange} placeholder="Enter your Growth Rate Progress" required />
            </div>
            <div className="form-group">
              <label htmlFor="growthRateRank">Growth Rate Rank:</label>
              <input type="text" id="growthRateRank" name="growthRateRank" value={formData.growthRateRank} onChange={handleChange} placeholder="Enter your Growth Rate Rank" required />
            </div>
            <div className="form-group">
              <label htmlFor="files">Upload Photos (Max 3):</label>
              <input type="file" id="files" name="files" onChange={handleFileChange} multiple accept="image/jpeg,image/png,image/gif" required />
            </div>
            <div className="file-names">
              {fileList.length > 0 && (
                <div className="file-names-list">
                  {fileList.map((file, index) => (
                    <div key={index} className="file-name">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => handleDeleteFile(index)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit">Submit</button>
          </form>

          {showConfirmationModal && (
            <div className="confirmation-modal">
              <div className="confirmation-modal-content">
                <p>Are you sure you want to submit?</p>
                <button onClick={handleConfirmSubmit}>Yes</button>
                <button onClick={handleCancelSubmit}>No</button>
              </div>
            </div>
          )}

          {confirmedSubmit && (
            <div className="submission-success">
              <p>Form submitted successfully!</p>
            </div>
          )}
        </header>
        <Dashboard users={users} />
      </div>
    </div>
  );
}

export default App;
