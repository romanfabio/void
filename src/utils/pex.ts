import GroupRepository from "../data/repositories/group.repo";
import { getBit, setBit } from "./mask";

export enum Group {
    ANONYMOUS = 0,
    USER = 1,
    MODERATOR = 2,
    ADMIN = 3
};

export enum GroupBit {
    REGISTER = 0
}

export enum GroupBitTag {
    REGISTER = 'REGISTER'
}

function getRequiredMask(group: Group) : Uint8Array {
    switch(group) {
        case Group.ANONYMOUS:
            return new Uint8Array([0b00000000]);
        case Group.USER:
            return new Uint8Array([0b10000000]);
        case Group.MODERATOR:
            return new Uint8Array([0b10000000]);
        case Group.ADMIN:
            return new Uint8Array([0b11111111]);
    }
}

export class PexManager {

    private readonly groups: GroupRepository;

    public constructor(groups: GroupRepository) {
        this.groups = groups;
    }

    public isGlobalSet(group: Group, bit: GroupBit) : boolean {
        return getBit(this.groups.findById(group).mask, bit);
    }

    public exportGlobal(group: Group) : {code: GroupBitTag; name: string; value: boolean}[] {
        const mask = this.groups.findById(group).mask;

        return [
            {code: GroupBitTag.REGISTER, name: 'Register', value: getBit(mask, GroupBit.REGISTER)}
        ];
    }

    public async setGlobal(group: Group, mask: string[]) {
        const required = getRequiredMask(group);

        if((!getBit(required, GroupBit.REGISTER)) && mask.includes(GroupBitTag.REGISTER)) {
            setBit(required, GroupBit.REGISTER, true);
        } 

        await this.groups.updateMaskById(group, required);
    }


}

export default{ Group, GroupBit, PexManager };