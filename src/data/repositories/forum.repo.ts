import Forum from "../models/forum.model";
import knex, { Knex } from "knex";
import { IForumCache } from "../cache/Icache";

export default class ForumRepository {

    private readonly _db : Knex;
    private readonly _cache: IForumCache;
    private _names: string[] | undefined;

    constructor(cache: IForumCache, database: Knex) {
        this._cache = cache;
        this._db = database;
        this._names = undefined;
    }

    public async all() : Promise<Forum[]> {
        return await this._db.select(['name','description','creator','userMask','moderatorMask','orderId'])
                    .from('forums')
                    .orderBy('orderId', 'asc') as Forum[];
    }

    public async page(offset: number, size: number) {
        return await this._db.select(['name','description','creator','userMask','moderatorMask','orderId'])
            .from('forums')
            .orderBy('orderId', 'asc')
            .offset(offset).limit(size);
    }

    public async names() : Promise<string[]> {

        if(this._names === undefined) {
            const rows = await this._db.select('name').from('forums').orderBy('orderId', 'asc');

            this._names = rows.map(r => r.name);
        }

        return this._names;
    }

    public async findByName(name: string) : Promise<Forum | null> {
        let forum = await this._cache.findByName(name);

        if(forum === undefined) {
            const rows = await this._db.select(['name','description','creator','userMask','moderatorMask','orderId']).from('forums').where('name', name);

            forum = null;
            if(rows.length) {
                forum = rows[0] as Forum;
            }

            await this._cache.set(name, forum);
        }

        return forum;
    }

    public async insert(forum: Forum) : Promise<void> {
        await this._db('forums').insert(forum);
        await this._cache.set(forum.name, forum);
        if(this._names === undefined) this._names = [];
        this._names.push(forum.name);
    }

    public async moveUp(forumName: string, index: number) : Promise<void> {
        await this._db.transaction(async (trx) => {
            await trx('forums').where('orderId', index-1).increment('orderId', 1);
            await trx('forums').update({orderId: index-1}).where('name', forumName);
        });

        const names = this._names as string[];
        const temp = names[index];
        names[index] = names[index-1];
        names[index-1] = temp;
    }

    public async moveDown(forumName: string, index: number) : Promise<void> {
        await this._db.transaction(async (trx) => {
            await trx('forums').where('orderId', index+1).decrement('orderId', 1);
            await trx('forums').update({orderId: index+1}).where('name', forumName);
        });

        const names = this._names as string[];
        const temp = names[index];
        names[index] = names[index+1];
        names[index+1] = temp;
    }

}