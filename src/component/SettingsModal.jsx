import React, { useState } from 'react';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const SettingsModal = ({ visible, onClose, roiTypes, setRoiTypes, typeColors, setTypeColors,setPolygons,polygons }) => {
  const [newType, setNewType] = useState('');
  const [newColor, setNewColor] = useState('#888888');
  const [newSubtypes, setNewSubtypes] = useState({});

  if (!visible) return null;

  const handleAddType = () => {
    const trimmed = newType.trim();
    if (!trimmed || roiTypes[trimmed]) return;
    setRoiTypes((prev) => ({ ...prev, [trimmed]: [] }));
    setTypeColors((prev) => ({ ...prev, [trimmed]: newColor }));
    setNewType('');
    setNewColor('#888888');
  };

  const handleDeleteType = (type) => {
    // Check if any existing polygons use this type
    const typeIndex = Object.keys(roiTypes).indexOf(type);
    const polygonsUsingType = polygons.filter(polygon => polygon.type === typeIndex);
    
    if (polygonsUsingType.length > 0) {
      const confirmDelete = window.confirm(
        `This type is used by ${polygonsUsingType.length} polygon(s). Deleting it will reset those polygons to the first available type. Continue?`
      );
      if (!confirmDelete) return;
    }
  
    const updatedTypes = { ...roiTypes };
    delete updatedTypes[type];
    setRoiTypes(updatedTypes);
  
    const updatedColors = { ...typeColors };
    delete updatedColors[type];
    setTypeColors(updatedColors);
  
    // Update existing polygons that used the deleted type
    if (polygonsUsingType.length > 0) {
      const newPolygons = polygons.map(polygon => {
        if (polygon.type === typeIndex) {
          return { ...polygon, type: 0 }; // Reset to first type
        }
        return polygon;
      });
      setPolygons(newPolygons);
    }
  };

  const handleAddSubtype = (type) => {
    const value = (newSubtypes[type] || '').trim();
    if (!value || roiTypes[type].includes(value)) return;
    setRoiTypes((prev) => ({
      ...prev,
      [type]: [...prev[type], value],
    }));
    setNewSubtypes((prev) => ({ ...prev, [type]: '' }));
  };

  const handleDeleteSubtype = (type, subtype) => {
    setRoiTypes((prev) => ({
      ...prev,
      [type]: prev[type].filter((s) => s !== subtype),
    }));
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        width: '400px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Manage ROI Types</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X />
          </button>
        </div>

     <div style={{
        maxHeight: '70vh',
        overflowY: 'auto',
        }}>

        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Add New Type</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="e.g., NEW_ROI"
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              style={{ width: '40px', height: '40px', border: 'none' }}
            />
            <button
              onClick={handleAddType}
              style={{ padding: '8px 12px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              Add
            </button>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          {Object.entries(roiTypes).map(([type, subtypes]) => (
            <div key={type} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{type}</h3>
                <button
                  onClick={() => handleDeleteType(type)}
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize:"12px" }}>Add Subtype</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    value={newSubtypes[type] || ''}
                    onChange={(e) => setNewSubtypes((prev) => ({ ...prev, [type]: e.target.value }))}
                    placeholder="Subtype name"
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button
                    onClick={() => handleAddSubtype(type)}
                    style={{ padding: '8px 12px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px' }}
                  >
                    <PlusCircle size={18} />
                  </button>
                </div>
              </div>

              <div style={{
                    marginTop: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                     {subtypes?.length === 0 ? 
                     <div style={{
                      padding: '8px',
                      textAlign: 'center',
                      color: '#666',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '2px dashed #dee2e6',
                      marginTop: '10px'
                    }}>
                      <span style={{ fontSize: '14px' }}>No subtypes added yet</span>
                    </div> :
                      <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#495057',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Subtypes ({subtypes.length})
                    </div> 
                    }
                    
                    <div style={{
                      display: 'grid',
                      gap: '6px'
                    }}>
                      {subtypes.map((sub, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = '#007bff';
                            e.target.style.boxShadow = '0 2px 4px rgba(0,123,255,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = '#dee2e6';
                            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              backgroundColor: '#007bff',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              minWidth: '10px',
                              textAlign: 'center'
                            }}>
                              {i + 1}
                            </span>
                            <span style={{
                              fontWeight: '500',
                              color: '#212529',
                              fontSize: '14px'
                            }}>
                              {sub}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteSubtype(type, sub)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              opacity: '0.7'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f8d7da';
                              e.target.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.opacity = '0.7';
                            }}
                            title={`Delete ${sub}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
            </div>
          ))}
        </div>
    </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;