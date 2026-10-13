import React from 'react';
import { Image } from 'react-native';

const LOGO = require('../assets/university-of-mindanao-logo.png');

export default function UniversityLogo({ size = 90 }) {
  return (
    <Image
      source={LOGO}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="University of Mindanao logo"
    />
  );
}
