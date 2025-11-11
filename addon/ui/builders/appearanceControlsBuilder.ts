// Appearance controls (Race, Gender, Skin, Face, Hair, etc.) builder
import { SetCustomOutfitMessage } from "../../../shared/Messages";
import {
    getRace,
    getGender,
    getSkin,
    getFace,
    getHair,
    getHairColor,
    getFacialHair,
    setRace,
    setGender,
    setSkin,
    setFace,
    setHair,
    setHairColor,
    setFacialHair
} from "../../state/addonState";
import {
    setRaceText,
    setGenderText,
    setSkinText,
    setFaceText,
    setHairText,
    setHairColorText,
    setFacialHairText
} from "../uiReferences";
import { getRaceName } from "../../utils/constants";

function createAppearanceControlRow(
    parent: WoWAPI.Frame,
    yOffset: number,
    getValue: () => number,
    setValue: (val: number) => void,
    getDisplayText: (val: number) => string,
    min: number,
    max: number | undefined,
    setTextRef: (text: WoWAPI.FontString) => void
): number {
    const col1Width = 200;
    const col2Width = 30;
    const col3Width = 30;
    const col2XPos = 220;
    const col3XPos = 255;
    const rowHeight = 25;

    // Label/Value text
    const text = parent.CreateFontString(undefined, 'OVERLAY', 'GameFontNormal');
    text.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    text.SetText(getDisplayText(getValue()));
    text.SetWidth(col1Width);
    text.SetJustifyH('LEFT');
    setTextRef(text);

    // Decrement button
    const decBtn = CreateFrame('Button', undefined, parent, 'UIPanelButtonTemplate');
    decBtn.SetSize(col2Width, rowHeight);
    decBtn.SetPoint('TOPLEFT', parent, 'TOPLEFT', col2XPos, yOffset);
    decBtn.SetText('<');
    
    decBtn.SetScript('OnClick', () => {
        const current = getValue();
        if (current > min) {
            const newVal = current - 1;
            setValue(newVal);
            text.SetText(getDisplayText(newVal));
            
            const targetGUID = UnitGUID('target');
            if (targetGUID && targetGUID !== '') {
                const packet = new SetCustomOutfitMessage(
                    targetGUID,
                    getRace(),
                    getGender(),
                    getSkin(),
                    getFace(),
                    getHair(),
                    getHairColor(),
                    getFacialHair()
                );
                packet.write().Send();
            }
        }
    });

    // Increment button
    const incBtn = CreateFrame('Button', undefined, parent, 'UIPanelButtonTemplate');
    incBtn.SetSize(col3Width, rowHeight);
    incBtn.SetPoint('TOPLEFT', parent, 'TOPLEFT', col3XPos, yOffset);
    incBtn.SetText('>');
    incBtn.SetScript('OnClick', () => {
        const current = getValue();
        if (max === undefined || current < max) {
            const newVal = current + 1;
            setValue(newVal);
            text.SetText(getDisplayText(newVal));
            
            const targetGUID = UnitGUID('target');
            if (targetGUID && targetGUID !== '') {
                const packet = new SetCustomOutfitMessage(
                    targetGUID,
                    getRace(),
                    getGender(),
                    getSkin(),
                    getFace(),
                    getHair(),
                    getHairColor(),
                    getFacialHair()
                );
                packet.write().Send();
            }
        }
    });

    return yOffset - (rowHeight + 5);
}

export function createAppearanceControls(parent: WoWAPI.Frame, startY: number): number {
    let yOffset = startY;

    // Race
    yOffset = createAppearanceControlRow(
        parent, yOffset,
        getRace, setRace,
        (val) => `Race: ${getRaceName(val)} (${val})`,
        1, 21,
        setRaceText
    );

    // Gender
    yOffset = createAppearanceControlRow(
        parent, yOffset,
        getGender, setGender,
        (val) => `Gender: ${val === 0 ? 'Male' : 'Female'} (${val})`,
        0, 1,
        setGenderText
    );

    // Skin
    yOffset = createAppearanceControlRow(
        parent, yOffset,
        getSkin, setSkin,
        (val) => `Skin: ${val}`,
        0, undefined,
        setSkinText
    );

    // Face
    yOffset = createAppearanceControlRow(
        parent, yOffset,
        getFace, setFace,
        (val) => `Face: ${val}`,
        0, undefined,
        setFaceText
    );

    // Hair
    yOffset = createAppearanceControlRow(
        parent, yOffset,
        getHair, setHair,
        (val) => `Hair: ${val}`,
        0, undefined,
        setHairText
    );

    // Hair Color
    yOffset = createAppearanceControlRow(
        parent, yOffset,
        getHairColor, setHairColor,
        (val) => `Hair Color: ${val}`,
        0, undefined,
        setHairColorText
    );

    // Facial Hair
    yOffset = createAppearanceControlRow(
        parent, yOffset,
        getFacialHair, setFacialHair,
        (val) => `Facial Hair: ${val}`,
        0, undefined,
        setFacialHairText
    );

    return yOffset;
}

