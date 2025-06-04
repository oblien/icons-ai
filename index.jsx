// icon-agent.js
import React, { useEffect, useState } from 'react';

const ICON_STORAGE_KEY = '__icon_agent_cache__';
let iconMap = null;
let subscribers = [];
const iconRegistry = new Map();
let isFetching = false;

// Notify all components to rerender
function notify() {
    subscribers.forEach((fn) => fn({}));
}

// Call this once at app start
export const initIcons = async (token) => {
    try {
        if (iconMap || isFetching) return;
        isFetching = true;

        try {
            iconMap = JSON.parse(localStorage.getItem(ICON_STORAGE_KEY) || '{}');
        } catch {
            iconMap = {};
        }

        const missing = [];
        iconRegistry.forEach((desc, name) => {
            if (!iconMap[name]) missing.push({ name, description: desc });
        });


        if (missing.length > 0) {
            const res = await fetch('https://api.oblien.com/ai/icons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    icons: missing
                }),
            });
            const fetched = await res.json();

            iconMap = { ...iconMap, ...fetched };
            localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(iconMap));
        }

        notify();
        isFetching = false;
    } catch (error) {
        console.error(error);
    }
};

setTimeout(() => {
    initIcons();
}, 1000);

export const Icon = ({ name, description = '', size = 24, color = '#000', style = {}, isRaw = false }) => {
    const [, forceUpdate] = useState({});

    // Register icon on first render
    useEffect(() => {
        iconRegistry.set(name, description);

        if (!iconMap) {
            // Subscribe to changes (after fetch)
            subscribers.push(forceUpdate);
            return () => {
                subscribers = subscribers.filter((fn) => fn !== forceUpdate);
            };
        }
    }, [name, description]);

    const url = iconMap?.[name];
    if (!url) return null;

    const finalUrl = url.replace(/ /g, '%20');

    if (isRaw) {
        return <img src={finalUrl} alt={name} style={{
            width: size,
            height: size,
            objectFit: 'contain',
            ...style
        }} />;
    }

    return <div style={{
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

export default Icon;
