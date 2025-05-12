import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated from 'react-native-reanimated';

type ClothingLayerProps = {
  type: 'shirt' | 'pants' | 'shoes';
  color?: string;
};

export default function ClothingLayer({ type, color = '#fff' }: ClothingLayerProps) {
  const getClothingPath = () => {
    switch (type) {
      case 'shirt':
        return (
          <Path
            d="M60 125 Q100 140 140 125 L150 280 Q100 290 50 280 Z"
            fill={color}
            stroke="#000"
            strokeWidth="1"
          />
        );
      case 'pants':
        return (
          <Path
            d="M60 280 Q80 285 100 285 Q120 285 140 280 L150 380 L130 380 L115 290 L85 290 L70 380 L50 380 Z"
            fill={color}
            stroke="#000"
            strokeWidth="1"
          />
        );
      case 'shoes':
        return (
          <>
            <Path
              d="M50 380 L70 380 L75 390 L45 390 Z"
              fill={color}
              stroke="#000"
              strokeWidth="1"
            />
            <Path
              d="M130 380 L150 380 L155 390 L125 390 Z"
              fill={color}
              stroke="#000"
              strokeWidth="1"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 200 400">
        {getClothingPath()}
      </Svg>
    </Animated.View>
  );
} 