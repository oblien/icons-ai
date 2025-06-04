'use client';

import React, { useEffect, useState, memo } from 'react';
import iconsMap from '../../../icons.config.js';
export const Icon = ({
  name,
  size = 24,
  className = '',
  color = '#000',
  style = {},
  isRaw = false
}) => {
  const [icon, setIcon] = useState(null);
  if (!iconsMap) {
    return null;
  }
  useEffect(() => {
    setIcon(iconsMap?.[name]);
  }, [iconsMap, name]);
  if (!icon) return null;
  const {
    Component
  } = icon;
  if (Component) {
    return /*#__PURE__*/React.createElement(Component, {
      name,
      className,
      size,
      color,
      style,
      isRaw
    });
  }
  const isValidIcon = typeof icon === 'string' || typeof icon === 'object' && icon?.url;
  if (!isValidIcon) return null;
  const finalUrl = typeof icon === 'string' ? icon : icon.url.replace(/ /g, '%20');
  if (isRaw) {
    return /*#__PURE__*/React.createElement("img", {
      src: finalUrl,
      alt: name,
      className: className,
      style: {
        width: size,
        height: size,
        objectFit: 'contain',
        ...style
      }
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      maskImage: `url(${finalUrl})`,
      WebkitMaskImage: `url(${finalUrl})`,
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      width: size,
      height: size,
      backgroundColor: color,
      ...style
    }
  });
};
export default /*#__PURE__*/memo(Icon);
