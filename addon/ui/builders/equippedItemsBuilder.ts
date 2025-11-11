// Equipped items display UI builder
import { setEquippedScrollFrame } from "../uiReferences";

export function createEquippedItemsUI(parent: WoWAPI.Frame, startY: number): number {
    let yOffset = startY;

    // Equipped Items label
    const equippedLabel = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormal');
    equippedLabel.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    equippedLabel.SetText('Equipped Items:');

    yOffset -= 25;

    // Column headers
    const equippedHeaderCol1Width = 200;
    const equippedHeaderCol2Width = 120;

    const equippedHeaderName = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    equippedHeaderName.SetPoint('TOPLEFT', parent, 'TOPLEFT', 20, yOffset);
    equippedHeaderName.SetText('Item Name');
    equippedHeaderName.SetJustifyH('LEFT');
    equippedHeaderName.SetWidth(equippedHeaderCol1Width);

    const equippedHeaderSlot = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    equippedHeaderSlot.SetPoint('TOPLEFT', parent, 'TOPLEFT', 20 + equippedHeaderCol1Width, yOffset);
    equippedHeaderSlot.SetText('Slot');
    equippedHeaderSlot.SetJustifyH('LEFT');
    equippedHeaderSlot.SetWidth(equippedHeaderCol2Width);

    const equippedHeaderActions = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
    equippedHeaderActions.SetPoint('TOPLEFT', parent, 'TOPLEFT', 20 + equippedHeaderCol1Width + equippedHeaderCol2Width, yOffset);
    equippedHeaderActions.SetText('Actions');
    equippedHeaderActions.SetJustifyH('LEFT');

    yOffset -= 20;

    // Equipped items scroll frame
    const equippedScrollFrame = CreateFrame('ScrollFrame', 'OutfitDesignerEquippedScrollFrame', parent, 'UIPanelScrollFrameTemplate');
    equippedScrollFrame.SetSize(460, 100);
    equippedScrollFrame.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    
    const equippedScrollBg = equippedScrollFrame.CreateTexture(undefined, 'BACKGROUND');
    equippedScrollBg.SetAllPoints(equippedScrollFrame);
    equippedScrollBg.SetTexture(0.1, 0.1, 0.1, 0.9);

    // Scroll child for equipped items
    const equippedScrollChild = CreateFrame('Frame', 'OutfitDesignerEquippedScrollChild', equippedScrollFrame);
    equippedScrollChild.SetSize(440, 100);
    equippedScrollFrame.SetScrollChild(equippedScrollChild);

    // Store references
    setEquippedScrollFrame(equippedScrollFrame, equippedScrollChild);

    yOffset -= 110;

    return yOffset;
}

