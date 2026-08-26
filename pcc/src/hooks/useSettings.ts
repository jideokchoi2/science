import { useEffect, useState } from 'react';

export interface Settings {
  sound: boolean;
  highContrast: boolean;
}

const KEY = 'pcc:settings:v1';

/** 소리·고대비 설정을 저장하고 <body> 클래스에 반영합니다. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { sound: true, highContrast: false, ...JSON.parse(raw) };
    } catch {
      /* 무시 */
    }
    return { sound: true, highContrast: false };
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* 무시 */
    }
    document.body.classList.toggle('hc', settings.highContrast);
  }, [settings]);

  const toggle = (key: keyof Settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return { settings, toggle };
}
