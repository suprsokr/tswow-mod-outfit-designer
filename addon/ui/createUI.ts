// Main UI creation - composes all UI builders
import { getMainFrame, setMainFrame } from "./uiReferences";
import { createMainFrame } from "./builders/mainFrameBuilder";
import { createActionButtons } from "./builders/actionButtonsBuilder";
import { createAppearanceControls } from "./builders/appearanceControlsBuilder";
import { createItemSearchUI } from "./builders/itemSearchBuilder";
import { createEquippedItemsUI } from "./builders/equippedItemsBuilder";
import { createSavedOutfitsUI } from "./builders/savedOutfitsBuilder";
import { createExportPopup } from "./builders/exportPopupBuilder";

export function createUI() {
    if (getMainFrame()) {
        return; // Already created
    }

    // Create the main frame
    const frame = createMainFrame();
    setMainFrame(frame);

    let yOffset = -40;

    // Create action buttons (Spawn, Despawn, Reset, Copy, Apply Copy)
    yOffset = createActionButtons(frame, yOffset);

    // Create saved outfits section (collapsible)
    yOffset = createSavedOutfitsUI(frame, yOffset);

    // Create appearance controls (Race, Gender, Skin, Face, Hair, Hair Color, Facial Hair)
    yOffset = createAppearanceControls(frame, yOffset);

    yOffset -= 35;

    // Create equipped items display
    yOffset = createEquippedItemsUI(frame, yOffset);

    // Create item search UI
    yOffset = createItemSearchUI(frame, yOffset);

    // Create export popup (hidden by default)
    createExportPopup();
}

export function toggleUI() {
    const frame = getMainFrame();
    if (!frame) {
        createUI();
        // After creating UI, show it immediately (first time opening)
        const newFrame = getMainFrame();
        if (newFrame) {
            newFrame.Show();
        }
        return;
    }
    
    // Frame already exists, toggle its visibility
    if (frame.IsShown()) {
        frame.Hide();
    } else {
        frame.Show();
    }
}

