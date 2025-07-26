'use client'
import React, { useEffect, useState, memo } from 'react';

let iconsMap = { current: {} };
let resources = { current: {} };

(async () => {
    try {
        iconsMap.current = await import('../../../icons.json');
        resources.current = await import('../../../resources.json')
    } catch (error) {
        console.error('Error loading icons.json or resources.json:', error);
    }
})()

export { resources }

export const Icon = ({ name, size = 24, className = '', color = '#000', style = {}, isRaw = false }) => {
    const [icon, setIcon] = useState(null)

    useEffect(() => {
        setIcon(iconsMap.current?.[name])
    }, [iconsMap, name, iconsMap.current])

    if (!icon) return null;

    const { Component } = icon

    if (Component) {
        return <Component {...{ name, className, size, color, style, isRaw }} />;
    }

    const isValidIcon = typeof icon === 'string' || (typeof icon === 'object' && icon?.url)

    if (!isValidIcon) return null

    const finalUrl = typeof icon === 'string' ? icon : icon.url.replace(/ /g, '%20');

    if (isRaw) {
        return <img src={finalUrl} alt={name} className={className} style={{
            width: size,
            height: size,
            objectFit: 'contain',
            ...style
        }} />;
    }

    return <div className={className} style={{
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
    }} />;
};

export default memo(Icon);
