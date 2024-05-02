import React, { useRef, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';

const RightSection = ({ pdfFile, pdfFilePreview }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (container && pdfFilePreview) {
      const height = container.clientHeight;
      const pdf = document.querySelector('object');
      if (pdf) {
        const pdfHeight = pdf.getBoundingClientRect().height;
        const newScale = height / pdfHeight;
        setScale(newScale);
      }
    }
  }, [pdfFilePreview]);

  return (
    <div style={{ width: '50vw', height: '92vh', backgroundColor: "#28231D" }} ref={containerRef}>
      {!pdfFilePreview ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="h5" color="white">Upload PDF file to preview</Typography>
        </div>
      ) : (
        <embed src={pdfFilePreview} type="application/pdf" width="100%" height="100%" view="Fit" />
      )}
    </div>
  );
};

export default RightSection;
