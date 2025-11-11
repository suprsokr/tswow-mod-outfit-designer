import { MessageRegistry } from "../MessageRegistry";

export const SET_CUSTOM_OUTFIT_MESSAGE_ID = MessageRegistry.SET_CUSTOM_OUTFIT_MESSAGE_ID;

export class SetCustomOutfitMessage {
    creatureGUID: string = "";
    race: uint32 = 1;
    gender: uint32 = 0;
    skin: uint32 = 0;
    face: uint32 = 0;
    hair: uint32 = 0;
    haircolor: uint32 = 0;
    facialhair: uint32 = 0;

    constructor(creatureGUID: string, race: uint32, gender: uint32, skin: uint32, face: uint32, hair: uint32, haircolor: uint32, facialhair: uint32) {
        this.creatureGUID = creatureGUID;
        this.race = race;
        this.gender = gender;
        this.skin = skin;
        this.face = face;
        this.hair = hair;
        this.haircolor = haircolor;
        this.facialhair = facialhair;
    }

    read(read: TSPacketRead): void {
        this.creatureGUID = read.ReadString();
        this.race = read.ReadUInt32();
        this.gender = read.ReadUInt32();
        this.skin = read.ReadUInt32();
        this.face = read.ReadUInt32();
        this.hair = read.ReadUInt32();
        this.haircolor = read.ReadUInt32();
        this.facialhair = read.ReadUInt32();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(SET_CUSTOM_OUTFIT_MESSAGE_ID, 0);
        packet.WriteString(this.creatureGUID);
        packet.WriteUInt32(this.race);
        packet.WriteUInt32(this.gender);
        packet.WriteUInt32(this.skin);
        packet.WriteUInt32(this.face);
        packet.WriteUInt32(this.hair);
        packet.WriteUInt32(this.haircolor);
        packet.WriteUInt32(this.facialhair);
        return packet;
    }
}

