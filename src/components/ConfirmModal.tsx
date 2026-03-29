import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal = ({
    open,
    title = 'Confirmation',
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'warning',
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    const accentColor = variant === 'danger' ? '#ef4444' : '#f59e0b';
    const accentBg = variant === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';
    const confirmBg = variant === 'danger' ? '#ef4444' : '#f59e0b';
    const confirmHoverBg = variant === 'danger' ? '#dc2626' : '#d97706';

    return (
        <div
            ref={overlayRef}
            onClick={e => { if (e.target === overlayRef.current) onCancel(); }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                animation: 'confirmFadeIn 0.15s ease',
            }}
        >
            <div style={{
                background: '#1a1a1e',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '420px',
                border: `1px solid ${accentColor}33`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accentColor}10`,
                animation: 'confirmSlideUp 0.2s ease',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px 0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: accentBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <AlertTriangle size={18} color={accentColor} />
                        </div>
                        <h2 style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#fff',
                            margin: 0,
                        }}>{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: '16px 24px 24px',
                }}>
                    <p style={{
                        fontSize: '14px',
                        color: '#9ca3af',
                        lineHeight: 1.6,
                        margin: '0 0 24px',
                    }}>{message}</p>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end',
                    }}>
                        <button
                            onClick={onCancel}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent',
                                color: '#9ca3af',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#9ca3af';
                            }}
                        >{cancelLabel}</button>
                        <button
                            onClick={onConfirm}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                background: confirmBg,
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = confirmHoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = confirmBg)}
                        >{confirmLabel}</button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes confirmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes confirmSlideUp {
                    from { opacity: 0; transform: translateY(12px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};
