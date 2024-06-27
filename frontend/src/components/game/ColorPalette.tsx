import React, { useState } from 'react';
import { SliderPicker } from 'react-color';

const ColorSliderPicker = ({ defaultColor = '#000', onChange }) => {
  const [color, setColor] = useState(defaultColor);

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    if (onChange) {
      onChange(newColor);
    }
  };

  return (
    <div style={{ margin: '20px auto', textAlign: 'center' }}>
      <SliderPicker color={color} onChange={handleColorChange} />
      <div style={{ marginTop: '10px', fontSize: '16px', color: '#333' }}>
        Selected Color: {color}
      </div>
    </div>
  );
};

export default ColorSliderPicker;
