// Main frame creation for Outfit Designer
import { closeSavedOutfitsSection } from "../uiUpdates";

export function createMainFrame(): WoWAPI.Frame {
    const frame = CreateFrame('Frame', 'OutfitDesignerFrame', UIParent);
    frame.SetSize(500, 850);
    frame.SetPoint('CENTER', UIParent, 'CENTER', 0, 0);
    frame.SetMovable(true);
    frame.EnableMouse(true);
    frame.RegisterForDrag('LeftButton');
    frame.SetScript('OnDragStart', (self) => self.StartMoving());
    frame.SetScript('OnDragStop', (self) => self.StopMovingOrSizing());

    // Background
    const bg = frame.CreateTexture(undefined, 'BACKGROUND');
    bg.SetAllPoints(frame);
    bg.SetTexture(0, 0, 0, 0.8);

    // Title
    const title = frame.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalLarge');
    title.SetPoint('TOP', frame, 'TOP', 0, -10);
    title.SetText('Outfit Designer');

    // Close button
    const closeBtn = CreateFrame('Button', 'OutfitDesignerCloseBtn', frame, 'UIPanelCloseButton');
    closeBtn.SetPoint('TOPRIGHT', frame, 'TOPRIGHT', -5, -5);
    closeBtn.SetScript('OnClick', () => {
        frame.Hide();
    });

    // Close saved outfits section when main frame is hidden
    frame.SetScript('OnHide', () => {
        closeSavedOutfitsSection();
    });

    return frame;
}

