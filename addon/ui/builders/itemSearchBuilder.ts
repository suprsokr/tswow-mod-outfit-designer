// Item search UI builder
import { ItemSearchMessage } from "../../../shared/Messages";
import { setResultsScrollFrame } from "../uiReferences";

export function createItemSearchUI(parent: WoWAPI.Frame, startY: number): number {
    let yOffset = startY;

    // Search label
    const searchLabel = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormal');
    searchLabel.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    searchLabel.SetText('Search Items:');

    yOffset -= 25;

    // Search input
    const searchInput = CreateFrame('EditBox', 'OutfitDesignerSearchInput', parent);
    searchInput.SetSize(380, 25);
    searchInput.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    searchInput.SetAutoFocus(false);
    searchInput.SetFontObject('ChatFontNormal');
    
    const searchInputBg = searchInput.CreateTexture(undefined, 'BACKGROUND');
    searchInputBg.SetAllPoints(searchInput);
    searchInputBg.SetTexture(0.2, 0.2, 0.2, 0.9);

    searchInput.SetScript('OnEscapePressed', () => searchInput.ClearFocus());
    searchInput.SetScript('OnEnterPressed', () => {
        const text = searchInput.GetText();
        if (text && text.length > 0) {
            const packet = new ItemSearchMessage(text);
            packet.write().Send();
        }
        searchInput.ClearFocus();
    });

    // Search button
    const searchBtn = CreateFrame('Button', 'OutfitDesignerSearchBtn', parent, 'UIPanelButtonTemplate');
    searchBtn.SetSize(90, 25);
    searchBtn.SetPoint('LEFT', searchInput, 'RIGHT', 5, 0);
    searchBtn.SetText('Search');
    searchBtn.SetScript('OnClick', () => {
        const text = searchInput.GetText();
        if (text && text.length > 0) {
            const packet = new ItemSearchMessage(text);
            packet.write().Send();
        }
    });

    yOffset -= 35;

    // Results label
    const resultsLabel = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormal');
    resultsLabel.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    resultsLabel.SetText('Results:');

    yOffset -= 20;

    // Column headers
    const headerItemName = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    headerItemName.SetPoint('TOPLEFT', parent, 'TOPLEFT', 15, yOffset);
    headerItemName.SetText('Item Name');
    headerItemName.SetJustifyH('LEFT');
    headerItemName.SetWidth(280);

    const searchHeaderSlot = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    searchHeaderSlot.SetPoint('TOPLEFT', parent, 'TOPLEFT', 300, yOffset);
    searchHeaderSlot.SetText('Slot');
    searchHeaderSlot.SetJustifyH('LEFT');
    searchHeaderSlot.SetWidth(100);

    yOffset -= 20;

    // Results scroll frame
    const resultsScrollFrame = CreateFrame('ScrollFrame', 'OutfitDesignerScrollFrame', parent, 'UIPanelScrollFrameTemplate');
    resultsScrollFrame.SetSize(460, 180);
    resultsScrollFrame.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    
    const scrollBg = resultsScrollFrame.CreateTexture(undefined, 'BACKGROUND');
    scrollBg.SetAllPoints(resultsScrollFrame);
    scrollBg.SetTexture(0.1, 0.1, 0.1, 0.9);

    // Scroll child (content container)
    const resultsScrollChild = CreateFrame('Frame', 'OutfitDesignerScrollChild', resultsScrollFrame);
    resultsScrollChild.SetSize(440, 180);
    resultsScrollFrame.SetScrollChild(resultsScrollChild);

    // Store references
    setResultsScrollFrame(resultsScrollFrame, resultsScrollChild);

    yOffset -= 190;

    return yOffset;
}

