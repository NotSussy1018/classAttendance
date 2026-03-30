'use client';

/**
 * Modal Component
 * 재사용 가능한 모달
 */

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ isOpen, title, onClose, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* 모달 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4">{children}</div>

        {/* 푸터 */}
        {footer && <div className="px-6 py-4 border-t border-gray-200 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}
