import { MessageRegistry } from "../MessageRegistry";

export const SPAWN_MESSAGE_ID = MessageRegistry.SPAWN_MESSAGE_ID;

export class SpawnMessage {
    race: uint32 = 1;
    gender: uint32 = 0;
    skin: uint32 = 0;
    face: uint32 = 0;
    hair: uint32 = 0;
    haircolor: uint32 = 0;
    facialhair: uint32 = 0;
    itemCount: uint32 = 0;
    items: Array<{slot: string, name: string, entry: uint32}> = [];

    constructor(race: uint32, gender: uint32, skin: uint32, face: uint32, hair: uint32, haircolor: uint32, facialhair: uint32, items?: Array<{slot: string, name: string, entry: uint32}>) {
        this.race = race;
        this.gender = gender;
        this.skin = skin;
        this.face = face;
        this.hair = hair;
        this.haircolor = haircolor;
        this.facialhair = facialhair;
        this.items = items || [];
        this.itemCount = this.items.length;
    }

    read(read: TSPacketRead): void {
        this.race = read.ReadUInt32();
        this.gender = read.ReadUInt32();
        this.skin = read.ReadUInt32();
        this.face = read.ReadUInt32();
        this.hair = read.ReadUInt32();
        this.haircolor = read.ReadUInt32();
        this.facialhair = read.ReadUInt32();
        this.itemCount = read.ReadUInt32();
        this.items = [];
        for (let i = 0; i < this.itemCount; i++) {
            this.items.push({
                slot: read.ReadString(),
                name: read.ReadString(),
                entry: read.ReadUInt32()
            });
        }
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(SPAWN_MESSAGE_ID, 0);
        packet.WriteUInt32(this.race);
        packet.WriteUInt32(this.gender);
        packet.WriteUInt32(this.skin);
        packet.WriteUInt32(this.face);
        packet.WriteUInt32(this.hair);
        packet.WriteUInt32(this.haircolor);
        packet.WriteUInt32(this.facialhair);
        packet.WriteUInt32(this.itemCount);
        for (let i = 0; i < this.itemCount; i++) {
            packet.WriteString(this.items[i].slot);
            packet.WriteString(this.items[i].name);
            packet.WriteUInt32(this.items[i].entry);
        }
        return packet;
    }
}

