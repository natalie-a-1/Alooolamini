/**
 * React Native image with fallback support.
 */
import React, { useState } from 'react';
import { Image, ImageProps } from 'react-native';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export interface ImageWithFallbackProps extends ImageProps {
  fallbackUri?: string;
}

/** React Native component for Image With Fallback. */
export function ImageWithFallback({ fallbackUri = ERROR_IMG_SRC, style, ...props }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const source = didError ? { uri: fallbackUri } : props.source;

  return <Image {...props} source={source} onError={() => setDidError(true)} style={style} />;
}
