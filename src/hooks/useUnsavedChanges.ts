import { useEffect } from 'react';

/**
 * Synchronise window.__lifegps_unsaved_changes avec l'état "dirty" passé en paramètre.
 * Appellez avec `true` quand un formulaire a des modifications non sauvegardées,
 * et `false` quand elles sont sauvegardées ou annulées.
 */
export const useUnsavedChanges = (isDirty: boolean) => {
    useEffect(() => {
        (window as any).__lifegps_unsaved_changes = isDirty;
        return () => {
            // Nettoyage au démontage du composant
            (window as any).__lifegps_unsaved_changes = false;
        };
    }, [isDirty]);
};

/** Retrieve the current unsaved changes flag */
export const getUnsavedChanges = (): boolean => {
    return !!(window as any).__lifegps_unsaved_changes;
};

/** Reset the unsaved changes flag manually */
export const resetUnsavedChanges = (): void => {
    (window as any).__lifegps_unsaved_changes = false;
};
