import { MessageRegistry } from "../MessageRegistry";

export const COPY_OUTFIT_MESSAGE_ID = MessageRegistry.COPY_OUTFIT_MESSAGE_ID;

export class CopyOutfitMessage {
    dummy: uint32 = 0;

    constructor() {
        this.dummy = 1;
    }

    read(read: TSPacketRead): void {
        this.dummy = read.ReadUInt32();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(COPY_OUTFIT_MESSAGE_ID, 0);
        packet.WriteUInt32(this.dummy);
        return packet;
    }
}

