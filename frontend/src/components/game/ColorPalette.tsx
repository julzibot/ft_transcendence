import React, { useState } from 'react';
import { SliderPicker } from 'react-color';
import './slider.css'

const ColorSliderPicker = ({ defaultColor = '#000', onChange }) => {
  const [color, setColor] = useState(defaultColor);

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    if (onChange) {
      onChange(newColor);
    }
  };

  return (
    <div style={{ margin: '15px auto', textAlign: 'center', width: 250 }}>
      <div className="color-slider-container">
        <SliderPicker color={color} onChange={handleColorChange} />
      </div>
    </div>
  );
};

export default ColorSliderPicker