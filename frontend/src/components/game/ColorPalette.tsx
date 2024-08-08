import React, { useState } from 'react';
import { SliderPicker, ColorResult } from 'react-color';

interface ColorSliderPickerProps {
	defaultColor?: string;
	onChange?: (color: ColorResult) => void;
}

const ColorSliderPicker: React.FC<ColorSliderPickerProps> = ({ defaultColor = '#000', onChange }) => {
	const [color, setColor] = useState(defaultColor);

	const handleColorChange = (newColor: ColorResult) => {
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

export default ColorSliderPicker;
