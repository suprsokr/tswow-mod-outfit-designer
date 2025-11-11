// Saved outfits UI builder (collapsible section)
import { SaveOutfitMessage } from "../../../shared/Messages";
import { setSavedOutfitsToggleBtn, setSavedOutfitsContainer, setSavedOutfitsScrollFrame } from "../uiReferences";
import { toggleSavedOutfitsSection } from "../uiUpdates";

export function createSavedOutfitsUI(parent: WoWAPI.Frame, startY: number): number {
    let yOffset = startY;

    // 2-column button structure
    const buttonWidth = 155;
    const buttonSpacing = 5;

    // Browse button (column 1)
    const toggleBtn = CreateFrame('Button', 'OutfitDesignerSavedOutfitsToggle', parent, 'UIPanelButtonTemplate');
    toggleBtn.SetSize(buttonWidth, 25);
    toggleBtn.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    toggleBtn.SetText('Browse');
    toggleBtn.SetScript('OnClick', () => {
        toggleSavedOutfitsSection();
    });
    setSavedOutfitsToggleBtn(toggleBtn);

    // Save button (column 2)
    const saveBtn = CreateFrame('Button', 'OutfitDesignerSaveOutfit', parent, 'UIPanelButtonTemplate');
    saveBtn.SetSize(buttonWidth, 25);
    saveBtn.SetPoint('LEFT', toggleBtn, 'RIGHT', buttonSpacing, 0);
    saveBtn.SetText('Temp Save');
    saveBtn.SetScript('OnClick', () => {
        const targetGUID = UnitGUID('target');
        if (targetGUID && targetGUID !== '') {
            print('Saving outfit...');
            const packet = new SaveOutfitMessage();
            packet.write().Send();
        } else {
            print('No target selected! Target a creature first.');
        }
    });

    yOffset -= 30;

    // Collapsible container - positioned to LEFT of main frame, sized for ~5 entries
    const container = CreateFrame('Frame', undefined, UIParent);
    const containerHeight = 200; // Tall enough for ~5 entries
    container.SetSize(580, containerHeight); // Width for 4 action buttons
    container.SetPoint('TOPRIGHT', parent, 'TOPLEFT', -10, 0); // Same Y as main frame
    container.Hide();
    setSavedOutfitsContainer(container);

    // Container background
    const containerBg = container.CreateTexture(undefined, 'BACKGROUND');
    containerBg.SetAllPoints(container);
    containerBg.SetTexture(0.05, 0.05, 0.05, 0.9);

    let containerYOffset = -10;

    // Title
    const titleText = container.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalLarge');
    titleText.SetPoint('TOP', container, 'TOP', 0, containerYOffset);
    titleText.SetText('Browse Saved Outfits');
    titleText.SetTextColor(1, 0.82, 0, 1); // Gold color

    containerYOffset -= 30;

    // Column headers
    const headerIdText = container.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    headerIdText.SetPoint('TOPLEFT', container, 'TOPLEFT', 15, containerYOffset);
    headerIdText.SetText('ID');
    headerIdText.SetJustifyH('LEFT');
    headerIdText.SetWidth(80);

    const headerRaceText = container.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    headerRaceText.SetPoint('TOPLEFT', container, 'TOPLEFT', 100, containerYOffset);
    headerRaceText.SetText('Race');
    headerRaceText.SetJustifyH('LEFT');
    headerRaceText.SetWidth(70);

    const headerGenderText = container.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    headerGenderText.SetPoint('TOPLEFT', container, 'TOPLEFT', 175, containerYOffset);
    headerGenderText.SetText('Gender');
    headerGenderText.SetJustifyH('LEFT');
    headerGenderText.SetWidth(70);

    const headerSavedToDBText = container.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    headerSavedToDBText.SetPoint('TOPLEFT', container, 'TOPLEFT', 250, containerYOffset);
    headerSavedToDBText.SetText('Saved to DB');
    headerSavedToDBText.SetJustifyH('LEFT');
    headerSavedToDBText.SetWidth(80);

    const headerActionsText = container.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    headerActionsText.SetPoint('TOPLEFT', container, 'TOPLEFT', 330, containerYOffset);
    headerActionsText.SetText('Actions');
    headerActionsText.SetJustifyH('LEFT');
    headerActionsText.SetWidth(220);

    containerYOffset -= 25;

    // Scroll frame - smaller to fit ~5 entries
    const scrollFrame = CreateFrame('ScrollFrame', 'OutfitDesignerSavedOutfitsScroll', container, 'UIPanelScrollFrameTemplate');
    const scrollHeight = containerHeight - 70; // Leave room for title and headers
    scrollFrame.SetSize(540, scrollHeight); // Width to accommodate scrollbar and action buttons
    scrollFrame.SetPoint('TOPLEFT', container, 'TOPLEFT', 10, containerYOffset);
    
    const scrollBg = scrollFrame.CreateTexture(undefined, 'BACKGROUND');
    scrollBg.SetAllPoints(scrollFrame);
    scrollBg.SetTexture(0.1, 0.1, 0.1, 0.9);

    // Scroll child
    const scrollChild = CreateFrame('Frame', 'OutfitDesignerSavedOutfitsScrollChild', scrollFrame);
    scrollChild.SetSize(520, scrollHeight); // Width accounting for scrollbar
    scrollFrame.SetScrollChild(scrollChild);

    // Store references
    setSavedOutfitsScrollFrame(scrollFrame, scrollChild);

    // Return updated yOffset (container is hidden, so only account for toggle button)
    return startY - 30;
}

