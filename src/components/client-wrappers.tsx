'use client';

import dynamic from 'next/dynamic';
export const ConfirmDialogWrapper = dynamic(() => import('@/components/ConfirmDialog'), {
  ssr: false,
  loading: () => <div data-unique-id="19e12820-e05c-4e51-9c0e-0093df0ca442" data-file-name="components/client-wrappers.tsx"><span className="editable-text" data-unique-id="1707819a-5ae2-4cd5-8f06-caeefe8d5c63" data-file-name="components/client-wrappers.tsx">Loading...</span></div>
});
export const AnnouncementPopup = dynamic(() => import('@/components/AnnouncementPopup'), {
  ssr: false,
  loading: () => <div data-unique-id="35af0071-307c-4a36-b541-673be8596a9b" data-file-name="components/client-wrappers.tsx"><span className="editable-text" data-unique-id="6ea46a49-109d-4ee8-ae0e-c2b5da2b5eb3" data-file-name="components/client-wrappers.tsx">Loading announcements...</span></div>
});
export const ExpirationTracker = dynamic(() => import('@/components/ExpirationTracker'), {
  ssr: false,
  loading: () => <div data-unique-id="eaaa8520-c493-4e6e-8728-bd83d979f106" data-file-name="components/client-wrappers.tsx"><span className="editable-text" data-unique-id="7416fed4-bc95-4230-8c12-c41c9bec41ac" data-file-name="components/client-wrappers.tsx">Loading expiration tracker...</span></div>
});