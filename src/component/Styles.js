export const Styles = {
    container: {
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    },
    leftPanel: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#333'
    },
    canvasContainer: {
      width: '100%',
      height: '100%',
      position: 'relative'
    },
    controlsTop: {
      display: 'flex',
      gap: '8px',
      margin:"10px 0px 0px 12px "
    },

    uploadContainer:{
        display:"flex",
        justifyContent:'center',
        alignItems:"center"
    },
    uploadButton:{
      padding: '8px 16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      width:"120px"
    },
    controlButton: {
      padding: '8px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    zoomIndicator: {
      backgroundColor: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontSize: '14px'
    },
    canvas: {
      border: '1px solid #ccc',
      width: '100%',
      height: '100%',
      display: 'block'
    },
    drawingStatus: {
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      backgroundColor: '#fff3cd',
      padding: '8px 12px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontSize: '14px',
      border: '1px solid #ffeaa7'
    },
    rightPanel: {
      width: '345px',
      backgroundColor: 'white',
      borderLeft: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column'
    },
    controlsSection: {
      padding: '16px',
      borderBottom: '1px solid #eee'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px'
    },
    primaryButton: {
      flex: 1,
      padding: '8px 16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px'
    },
    secondaryButton: {
      flex: 1,
      padding: '8px 16px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px'
    },
    instructions: {
      fontSize: '14px',
      color: '#666'
    },
    instructionsList: {
      margin: '8px 0',
      paddingLeft: '16px',
      fontSize: '12px'
    },
    instructionsListItem: {
      marginBottom: '4px'
    },
    polygonList: {
      flex: 1,
      overflow: 'auto',
      padding: '16px'
    },
    polygonListHeader: {
      fontWeight: 'bold',
      marginBottom: '12px',
      fontSize: '16px'
    },
    emptyState: {
      color: '#999',
      fontSize: '14px',
      fontStyle: 'italic'
    },
    polygonItem: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '12px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    polygonItemSelected: {
      padding: '12px',
      border: '2px solid #007bff',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '12px',
      backgroundColor: '#f8f9ff',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 8px rgba(0,123,255,0.15)',
      position:'relative'
    },
    polygonHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    polygonNumber: {
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      flexShrink: 0
    },
    typeDropdown: {
      padding: '4px 8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '12px',
      backgroundColor: 'white',
      cursor: 'pointer',
      minWidth: '80px'
    },
    polygonDetails: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px'
    },
    polygonNameInput: {
      flex: 1,
      padding: '4px 4px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '12px',
      backgroundColor: 'white',
      width:"80px"
    },
    polygonItemHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    polygonName: {
      fontWeight: '500',
      fontSize: '14px'
    },
    polygonInfo: {
      fontSize: '12px',
      color: '#666',
      marginTop: '2px'
    },
    deleteButton: {
      color: '#dc3545',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      padding: '4px 8px',
      marginLeft:"8px"
    },
    coordinatesDisplay: {
      marginTop: '8px',
      fontSize: '10px',
      backgroundColor: '#f8f9fa',
      padding: '8px',
      borderRadius: '4px',
      maxHeight: '128px',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      fontFamily: 'monospace'
    },
    hiddenInput: {
      display: 'none'
    }
  };