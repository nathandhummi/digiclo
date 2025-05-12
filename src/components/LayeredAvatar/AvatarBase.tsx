import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

export default function AvatarBase() {
  return (
    <View style={{ width: '100%', aspectRatio: 1 }}>
      <Svg width="100%" height="100%" viewBox="0 0 200 400">
        {/* Head */}
        <Circle
          cx="100"
          cy="70"
          r="40"
          fill="#8D5524"
        />
        
        {/* Neck */}
        <Path
          d="M85 105 Q100 115 115 105 L115 125 L85 125 Z"
          fill="#8D5524"
        />

        {/* Body */}
        <Path
          d="M60 125 Q100 140 140 125 L150 280 Q100 290 50 280 Z"
          fill="#8D5524"
        />

        {/* Arms */}
        <Path
          d="M55 130 Q40 180 45 230 Q42 235 35 230 Q30 180 50 125"
          fill="#8D5524"
        />
        <Path
          d="M145 130 Q160 180 155 230 Q158 235 165 230 Q170 180 150 125"
          fill="#8D5524"
        />

        {/* Legs */}
        <Path
          d="M60 280 Q80 285 100 285 Q120 285 140 280 L150 380 L130 380 L115 290 L85 290 L70 380 L50 380 Z"
          fill="#8D5524"
        />

        {/* Facial Features */}
        <G transform="translate(100, 70)">
          {/* Eyes */}
          <Circle cx="-15" cy="-5" r="3" fill="#000" />
          <Circle cx="15" cy="-5" r="3" fill="#000" />
          
          {/* Eyebrows */}
          <Path
            d="M-25 -15 Q-15 -18 -5 -15"
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M5 -15 Q15 -18 25 -15"
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />

          {/* Beard */}
          <Path
            d="M-20 10 Q0 25 20 10 Q0 40 -20 10"
            fill="#000"
          />
        </G>
      </Svg>
    </View>
  );
} 