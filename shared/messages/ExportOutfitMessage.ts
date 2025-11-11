import { MessageRegistry } from "../MessageRegistry";

export const EXPORT_OUTFIT_MESSAGE_ID = MessageRegistry.EXPORT_OUTFIT_MESSAGE_ID;

export class ExportOutfitMessage {
    dummy: uint32 = 1; // Ensure packet has data

    constructor() {}

    read(read: TSPacketRead): void {
        this.dummy = read.ReadUInt32();
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(EXPORT_OUTFIT_MESSAGE_ID, 0);
        packet.WriteUInt32(this.dummy);
        return packet;
    }
}

