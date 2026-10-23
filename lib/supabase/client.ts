'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
}

const TAB_AUTH_ID_KEY = 'internjourneys-auth-tab-id';

function createTabId() {
  return typeof window.crypto.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getTabAuthStorageKey() {
  if (typeof window === 'undefined') return 'internjourneys-auth-server';

  try {
    let tabId = window.sessionStorage.getItem(TAB_AUTH_ID_KEY);
    if (!tabId) {
      tabId = createTabId();
      window.sessionStorage.setItem(TAB_AUTH_ID_KEY, tabId);
    }
    return `internjourneys-auth-${tabId}`;
  } catch {
    return `internjourneys-auth-${createTabId()}`;
  }
}

const tabSessionStorage = {
  getItem(key: string) {
    try {
      return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value);
    } catch {
      // Session persistence is unavailable in this browser context.
    }
  },
  removeItem(key: string) {
    try {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
    } catch {
      // Session persistence is unavailable in this browser context.
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: tabSessionStorage,
    storageKey: getTabAuthStorageKey(),
  },
});
