import { MessageRegistry } from "../MessageRegistry";

export const DESPAWN_MESSAGE_ID = MessageRegistry.DESPAWN_MESSAGE_ID;

export class DespawnMessage {
    creatureGUID: string = "";

    constructor(creatureGUID: string) {
        this.creatureGUID = creatureGUID;
    }

    read(read: TSPacketRead): void {
        this.creatureGUID = read.ReadString();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(DESPAWN_MESSAGE_ID, 0);
        packet.WriteString(this.creatureGUID);
        return packet;
    }
}

