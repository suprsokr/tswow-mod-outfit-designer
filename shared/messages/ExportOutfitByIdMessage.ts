// Message to export a specific outfit by ID
import { MessageRegistry } from "../MessageRegistry";

export const EXPORT_OUTFIT_BY_ID_MESSAGE_ID = MessageRegistry.EXPORT_OUTFIT_BY_ID_MESSAGE_ID;

export class ExportOutfitByIdMessage {
    outfitId: uint32;

    constructor(outfitId: number = 0) {
        this.outfitId = outfitId;
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(EXPORT_OUTFIT_BY_ID_MESSAGE_ID, 4);
        packet.WriteUInt32(this.outfitId);
        return packet;
    }

    read(packet: TSPacketRead): void {
        this.outfitId = packet.ReadUInt32();
    }
}

