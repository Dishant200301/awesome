import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  description?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Delete Item?',
  itemName,
  description,
  confirmText = 'Delete',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-neutral-900 text-sm">{title}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {description ? (
                description
              ) : itemName ? (
                <>
                  Are you sure you want to delete <strong className="text-neutral-900 font-semibold">"{itemName}"</strong>? This action cannot be undone.
                </>
              ) : (
                'Are you sure you want to delete this item? This action cannot be undone.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="text-xs h-8 px-3 border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3.5 font-medium cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
