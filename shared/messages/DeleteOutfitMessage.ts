// Message to request deleting a saved outfit
import { MessageRegistry } from "../MessageRegistry";

export const DELETE_OUTFIT_MESSAGE_ID = MessageRegistry.DELETE_OUTFIT_MESSAGE_ID;

export class DeleteOutfitMessage {
    outfitId: number;

    constructor(outfitId: number) {
        this.outfitId = outfitId;
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(DELETE_OUTFIT_MESSAGE_ID, 4);
        packet.WriteUInt32(this.outfitId);
        return packet;
    }

    read(packet: TSPacketRead): void {
        this.outfitId = packet.ReadUInt32();
    }
}

