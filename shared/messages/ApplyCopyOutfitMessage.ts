import { MessageRegistry } from "../MessageRegistry";

export const APPLY_COPY_OUTFIT_MESSAGE_ID = MessageRegistry.APPLY_COPY_OUTFIT_MESSAGE_ID;

export class ApplyCopyOutfitMessage {
    dummy: uint32 = 0;

    constructor() {
        this.dummy = 1;
    }

    read(read: TSPacketRead): void {
        this.dummy = read.ReadUInt32();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(APPLY_COPY_OUTFIT_MESSAGE_ID, 0);
        packet.WriteUInt32(this.dummy);
        return packet;
    }
}

