import { MessageRegistry } from "../MessageRegistry";

export const EXPORTED_CODE_MESSAGE_ID = MessageRegistry.EXPORTED_CODE_MESSAGE_ID;

export class ExportedCodeMessage {
    code: string = '';

    constructor(code?: string) {
        this.code = code || '';
    }

    read(read: TSPacketRead): void {
        this.code = read.ReadString();
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(EXPORTED_CODE_MESSAGE_ID, 0);
        packet.WriteString(this.code);
        return packet;
    }
}

