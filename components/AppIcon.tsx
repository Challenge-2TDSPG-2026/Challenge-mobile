import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';

type IconSet = 'Ionicons' | 'MaterialCommunityIcons';

interface AppIconProps {
    name: string;
    set: IconSet;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
}

export function AppIcon({ name, set, size = 22, color = '#1a1512', style }: AppIconProps) {
    if (set === 'MaterialCommunityIcons') {
        return <MaterialCommunityIcons name={name as any} size={size} color={color} style={style} />;
    }
    return <Ionicons name={name as any} size={size} color={color} style={style} />;
}