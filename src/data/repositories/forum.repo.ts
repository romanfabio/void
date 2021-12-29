import Forum from "../models/forum.model";
import knex, { Knex } from "knex";
import { IForumCache } from "../cache/Icache";

type ForumSummary = Pick<Forum, 'name' | 'starred'>;

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
        return await this._db.select(['name','description','creator','userMask','moderatorMask','starred']).from('forums').orderBy([{column: 'starred', order: 'desc'},{column: 'name', order: 'asc'}]) as Forum[];
    }

    public async page(offset: number, size: number) {
        return await this._db.select(['name','description','creator','userMask','moderatorMask','starred'])
            .from('forums')
            .orderBy([{column: 'starred', order: 'desc'},{column: 'name', order: 'asc'}])
            .offset(offset).limit(size);
    }

    public async names() : Promise<string[]> {

        if(this._names === undefined) {
            const rows = await this._db.select('name').from('forums').orderBy([{column: 'starred', order: 'desc'},{column: 'name', order: 'asc'}]);

            this._names = rows.map(r => r.name);
        }

        return this._names;
    }

    public async findByName(name: string) : Promise<Forum | null> {
        let forum = await this._cache.findByName(name);

        if(forum === undefined) {
            const rows = await this._db.select(['name','description','creator','userMask','moderatorMask','starred']).from('forums').where('name', name);

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

    public async invertStarred(name: string) : Promise<void> {
        await this._db('forums').update({
            starred: this._db.raw('NOT ??', ['starred'])
        }).where('name', name);
    }

    public async summaries() : Promise<ForumSummary[]> {
        return await this._db.select(['name','starred'])
            .from('forums')
            .orderBy([{column: 'starred', order: 'desc'},{column: 'name', order: 'asc'}]) as Forum[];
    }
}