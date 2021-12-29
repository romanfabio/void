import Group from "../models/group.model";
import { Knex } from "knex";

export default class GroupRepository {

    private readonly _db : Knex;
    private readonly _groups : Group[];

    constructor(database: Knex) {
        this._db = database;
        this._groups = [];
    }

    async load() : Promise<void> {
        const rows = await this._db.select('id','name','mask').from('groups').orderBy('id','asc');

        if(rows.length !== 4) {
            console.log('missing required groups');
        }

        rows.forEach(r => this._groups.push(r));
    }

    findById(id: number) : Group {
        return this._groups[id];
    }

    async updateMaskById(id: number, mask: Uint8Array) : Promise<void> {
        await this._db('groups').update({mask}).where('id', id);
        this._groups[id].mask = mask;
    }

}