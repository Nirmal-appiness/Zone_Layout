import React from 'react'

function TypeModal({
    visible,
    selectedType,
    onTypeChange,
    onCancel,
    onConfirm,
    ROI_TYPES
  }) {
    if (!visible) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          width: '300px',
          boxShadow: '0 0 15px rgba(0,0,0,0.2)'
        }}>
          <h4>Select Polygon Type</h4>
          <select
            value={selectedType}
            onChange={onTypeChange}
            style={{
              width: '100%',
              padding: '8px',
              margin: '12px 0',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            {Object.entries(ROI_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <div style={{ display: 'flex', justifyContent:"flex-end", gap:"12px"}}>
            <button onClick={onCancel} style={{ padding: '6px 10px', color:"white",backgroundColor:"red", border:"none", borderRadius:"5px"  }}>Cancel</button>
            <button onClick={onConfirm} style={{ padding: '6px 10px', color:"white",backgroundColor:"green",  border:"none", borderRadius:"5px" }}>Confirm</button>
          </div>
        </div>
      </div>
    );
  };

export default TypeModal