// Export popup UI builder
import { getSavedOutfitsContainer } from "../uiReferences";

let exportPopupRef: WoWAPI.Frame | null = null;
let exportEditBoxRef: WoWAPI.EditBox | null = null;

export function createExportPopup(): WoWAPI.Frame {
    const popup = CreateFrame('Frame', 'OutfitDesignerExportPopup', UIParent);
    popup.SetSize(300, 500);
    
    // Position underneath the Browse Saved Outfits container
    const savedOutfitsContainer = getSavedOutfitsContainer();
    if (savedOutfitsContainer) {
        popup.SetPoint('TOP', savedOutfitsContainer, 'BOTTOM', 0, -10);
    } else {
        // Fallback to center if container not found
        popup.SetPoint('CENTER', UIParent, 'CENTER', 0, 0);
    }
    
    popup.SetMovable(true);
    popup.EnableMouse(true);
    popup.RegisterForDrag('LeftButton');
    popup.SetScript('OnDragStart', (self) => self.StartMoving());
    popup.SetScript('OnDragStop', (self) => self.StopMovingOrSizing());
    popup.Hide();

    // Background
    const bg = popup.CreateTexture(undefined, 'BACKGROUND');
    bg.SetAllPoints(popup);
    bg.SetTexture(0.05, 0.05, 0.05, 0.95);

    // Title
    const title = popup.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalLarge');
    title.SetPoint('TOP', popup, 'TOP', 0, -10);
    title.SetText('Export Outfit (Datascripts)');
    title.SetTextColor(1, 0.82, 0, 1);

    // Close button
    const closeBtn = CreateFrame('Button', undefined, popup, 'UIPanelCloseButton');
    closeBtn.SetPoint('TOPRIGHT', popup, 'TOPRIGHT', -5, -5);
    closeBtn.SetScript('OnClick', () => {
        popup.Hide();
    });

    // Scroll frame for code
    const scrollFrame = CreateFrame('ScrollFrame', 'OutfitDesignerExportScrollFrame', popup, 'UIPanelScrollFrameTemplate');
    scrollFrame.SetSize(270, 380);
    scrollFrame.SetPoint('TOP', popup, 'TOP', -10, -40);

    const scrollBg = scrollFrame.CreateTexture(undefined, 'BACKGROUND');
    scrollBg.SetAllPoints(scrollFrame);
    scrollBg.SetTexture(0.1, 0.1, 0.1, 0.9);

    // Edit box for code
    const editBox = CreateFrame('EditBox', 'OutfitDesignerExportEditBox', scrollFrame);
    editBox.SetSize(250, 380);
    editBox.SetPoint('TOPLEFT', scrollFrame, 'TOPLEFT', 5, -10);
    editBox.SetMultiLine(true);
    editBox.SetAutoFocus(false);
    editBox.SetFontObject('ChatFontNormal');
    editBox.SetScript('OnEscapePressed', () => editBox.ClearFocus());
    scrollFrame.SetScrollChild(editBox);

    // Copy button
    const copyBtn = CreateFrame('Button', undefined, popup, 'UIPanelButtonTemplate');
    copyBtn.SetSize(150, 30);
    copyBtn.SetPoint('BOTTOM', popup, 'BOTTOM', 0, 10);
    copyBtn.SetText('Select All');
    copyBtn.SetScript('OnClick', () => {
        editBox.SetFocus();
        const text = editBox.GetText();
        editBox.HighlightText(0, text.length);
    });

    // Store references
    exportPopupRef = popup;
    exportEditBoxRef = editBox;

    return popup;
}

export function showExportPopup(code: string) {
    if (exportPopupRef && exportEditBoxRef) {
        exportEditBoxRef.SetText(code);
        exportEditBoxRef.SetCursorPosition(0);
        exportPopupRef.Show();
    } else {
        print('Export popup not initialized!');
    }
}

export function closeExportPopup() {
    if (exportPopupRef) {
        exportPopupRef.Hide();
    }
}

