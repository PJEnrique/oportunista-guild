// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import gifBackground from './img/background.gif'; 

function App() {
  const [formData, setFormData] = useState({
    ign: '',
    growthRateProgress: '',
    growthRateRank: '',
    files: []
  });

  const [fileNames, setFileNames] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedSubmit, setConfirmedSubmit] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Load webhook URL from localStorage on component mount
  useEffect(() => {
    const storedUrl = localStorage.getItem('webhookUrl');
    if (storedUrl) {
      setWebhookUrl(storedUrl);
    }
  }, []);

  // Update webhook URL in localStorage when changed
  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const selectedFiles = Array.from(e.target.files).filter(file => validImageTypes.includes(file.type));

    // Limit to maximum 3 files
    const maxFiles = 3;
    const remainingSlots = maxFiles - formData.files.length;

    if (selectedFiles.length > remainingSlots) {
      alert(`You can only upload ${maxFiles} files.`);
      return;
    }

    const updatedFiles = [...formData.files, ...selectedFiles.slice(0, remainingSlots)];
    const updatedNames = updatedFiles.map(file => file.name);

    setFormData({ ...formData, files: updatedFiles });
    setFileNames(updatedNames);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmationModal(true); // Show confirmation modal
  };

  const handleConfirmSubmit = async () => {
    // Proceed with form submission
    setConfirmedSubmit(true);
    setShowConfirmationModal(false);

    // Create a new FormData object to combine text and files
    const form = new FormData();
    form.append('payload_json', JSON.stringify({
      content: `IGN: ${formData.ign}\nGrowth Rate Progress: ${formData.growthRateProgress}\nGrowth Rate Rank: ${formData.growthRateRank}`
    }));

    // Append each file to the FormData object
    for (let i = 0; i < formData.files.length; i++) {
      form.append(`file${i}`, formData.files[i]);
    }

    // Send the combined data to the Discord webhook
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: form,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);

        // Reset form after successful submission
        setFormData({
          ign: '',
          growthRateProgress: '',
          growthRateRank: '',
          files: []
        });
        setFileNames([]);
        setConfirmedSubmit(false);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmationModal(false); // Hide confirmation modal
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = [...formData.files];
    updatedFiles.splice(index, 1);

    const updatedNames = [...fileNames];
    updatedNames.splice(index, 1);

    setFormData({ ...formData, files: updatedFiles });
    setFileNames(updatedNames);
  };

  const handleWebhookUrlChange = (e) => {
    setWebhookUrl(e.target.value);
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
              {fileNames.length > 0 && (
                <div className="file-names-list">
                  {fileNames.map((name, index) => (
                    <div key={index} className="file-name">
                      <span>{name}</span>
                      <button type="button" onClick={() => handleDeleteFile(index)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit">Submit</button>
          </form>

          {/* Confirmation Modal */}
          {showConfirmationModal && (
            <div className="confirmation-modal">
              <div className="confirmation-modal-content">
                <p>Are you sure you want to submit?</p>
                <button onClick={handleConfirmSubmit}>Yes</button>
                <button onClick={handleCancelSubmit}>No</button>
              </div>
            </div>
          )}

          {/* Display success message */}
          {confirmedSubmit && (
            <div className="submission-success">
              <p>Form submitted successfully!</p>
            </div>
          )}
        </header>
      </div>
    </div>
  );
}

export default App;
