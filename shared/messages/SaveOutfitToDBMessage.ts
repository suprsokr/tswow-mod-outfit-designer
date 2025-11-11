// Message to save a specific outfit to database
import { MessageRegistry } from "../MessageRegistry";

export const SAVE_OUTFIT_TO_DB_MESSAGE_ID = MessageRegistry.SAVE_OUTFIT_TO_DB_MESSAGE_ID;

export class SaveOutfitToDBMessage {
    outfitId: uint32;

    constructor(outfitId: number = 0) {
        this.outfitId = outfitId;
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(SAVE_OUTFIT_TO_DB_MESSAGE_ID, 4);
        packet.WriteUInt32(this.outfitId);
        return packet;
    }

    read(packet: TSPacketRead): void {
        this.outfitId = packet.ReadUInt32();
    }
}

