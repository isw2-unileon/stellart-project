import { useEffect } from "react";
import { Button } from "./ui/button";

export default function ConfirmDialog({ 
    open = false, 
    onOpenChange, 
    title = "Confirm Action",
    description = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "destructive",
    onConfirm
}) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "unset";
        }
    }, [open]);

    if (!open) return null;

    const handleConfirm = () => {
        onOpenChange(false);
        if (onConfirm) {
            onConfirm();
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={handleCancel}
            />
            <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
                    <p className="text-slate-500">{description}</p>
                </div>
                <div className="flex gap-3 p-6 pt-0">
                    <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleCancel}
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        variant={variant} 
                        className="flex-1"
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
