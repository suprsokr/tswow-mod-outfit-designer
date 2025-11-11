// Message containing list of saved outfits
import { MessageRegistry } from "../MessageRegistry";

export const OUTFIT_LIST_MESSAGE_ID = MessageRegistry.OUTFIT_LIST_MESSAGE_ID;

export class OutfitListMessage {
    count: number;
    outfits: Array<{id: number, race: number, gender: number, savedToDB: boolean}>;

    constructor(outfits: Array<{id: number, race: number, gender: number, savedToDB: boolean}>) {
        this.outfits = outfits;
        this.count = outfits.length;
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(OUTFIT_LIST_MESSAGE_ID, 4 + (this.count * 13));
        packet.WriteUInt32(this.count);
        
        for (let i = 0; i < this.count; i++) {
            const outfit = this.outfits[i];
            packet.WriteUInt32(outfit.id);
            packet.WriteUInt32(outfit.race);
            packet.WriteUInt32(outfit.gender);
            packet.WriteUInt8(outfit.savedToDB ? 1 : 0);
        }
        
        return packet;
    }

    read(packet: TSPacketRead): void {
        this.count = packet.ReadUInt32();
        this.outfits = [];
        
        for (let i = 0; i < this.count; i++) {
            const id = packet.ReadUInt32();
            const race = packet.ReadUInt32();
            const gender = packet.ReadUInt32();
            const savedToDB = packet.ReadUInt8() === 1;
            this.outfits.push({id, race, gender, savedToDB});
        }
    }
}

