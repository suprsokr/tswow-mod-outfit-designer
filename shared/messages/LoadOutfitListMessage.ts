// Message to request list of saved outfits
import { MessageRegistry } from "../MessageRegistry";

export const LOAD_OUTFIT_LIST_MESSAGE_ID = MessageRegistry.LOAD_OUTFIT_LIST_MESSAGE_ID;

export class LoadOutfitListMessage {
    dummy: uint32 = 1;

    constructor() {
        this.dummy = 1;
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(LOAD_OUTFIT_LIST_MESSAGE_ID, 4);
        packet.WriteUInt32(this.dummy);
        return packet;
    }

    read(packet: TSPacketRead): void {
        this.dummy = packet.ReadUInt32();
    }
}

