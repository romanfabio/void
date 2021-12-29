import Group from "../models/group.model";
import { Knex } from "knex";

export default class GroupRepository {

    private readonly db : Knex;
    private readonly groups : Group[];

    constructor(database: Knex) {
        this.db = database;
        this.groups = [];
    }

    async load() : Promise<void> {
        const rows = await this.db.select('id','name','mask').from('groups').orderBy('id','asc');

        if(rows.length !== 4) {
            console.log('missing required groups');
        }

        rows.forEach(r => this.groups.push(r));
    }

    findById(id: number) : Group {
        return this.groups[id];
    }

    async updateMaskById(id: number, mask: Uint8Array) : Promise<void> {
        await this.db('groups').update({mask}).where('id', id);
        this.groups[id].mask = mask;
    }

}