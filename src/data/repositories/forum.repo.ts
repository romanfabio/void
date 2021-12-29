import Forum from "../models/forum.model";
import knex, { Knex } from "knex";
import { IForumCache } from "../cache/Icache";

type ForumSummary = Pick<Forum, 'name' | 'starred'>;

export default class ForumRepository {

    private readonly db : Knex;
    private readonly cache: IForumCache;

    constructor(cache: IForumCache, database: Knex) {
        this.cache = cache;
        this.db = database;
    }

    public async all() : Promise<Forum[]> {
        return await this.db.select(['name','description','creator','userMask','moderatorMask','starred']).from('forums').orderBy([{column: 'starred', order: 'desc'},{column: 'name', order: 'asc'}]) as Forum[];
    }

    public async page(offset: number, size: number) {
        return await this.db.select(['name','description','creator','userMask','moderatorMask','starred'])
            .from('forums')
            .orderBy([{column: 'starred', order: 'desc'},{column: 'name', order: 'asc'}])
            .offset(offset).limit(size);
    }

    public async names() : Promise<string[]> {
        let names = await this.cache.names();

        if(names === null) {
            const rows = await this.db.select('name').from('forums').orderBy([{column: 'starred', order: 'desc'},{column: 'name', order: 'asc'}]);

            names = rows.map(r => r.name);
            await this.cache.cacheNames(names);
        }
        return names;
    }

    public async findByName(name: string) : Promise<Forum | null> {
        let forum = await this.cache.findByName(name);

        if(forum === null) {
            const rows = await this.db.select(['name','description','creator','userMask','moderatorMask','starred']).from('forums').where('name', name);

            if(!rows.length) {
                return null;
            }

            forum = rows[0] as Forum;
            await this.cache.cache(forum);
        }

        return forum;
    }

    public async insert(forum: Forum) : Promise<void> {
        await this.db('forums').insert(forum);
        const names = await this.names();
        names.push(forum.name);
        await this.cache.cacheNames(names);
    }

    public async invertStarred(name: string) : Promise<void> {
        await this.db('forums').update({
            starred: this.db.raw('NOT ??', ['starred'])
        }).where('name', name);
    }

    public async summaries() : Promise<ForumSummary[]> {
        return await this.db.select(['name','starred'])
            .from('forums')
            .orderBy([{column: 'starred', order: 'desc'},{column: 'name', order: 'asc'}]) as Forum[];
    }
}