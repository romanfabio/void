import User from "../models/user.model";
import { Knex } from "knex";
import { IUserCache } from "../cache/Icache";

export default class UserRepository {

    private readonly _db : Knex;
    private readonly _cache : IUserCache;

    constructor(cache: IUserCache, database: Knex) {
        this._cache = cache;
        this._db = database;
    }

    public async findByUsername(username: string) : Promise<User | null> {

        let user = await this._cache.findByUsername(username);

        if(user === undefined) {
            const rows = await this._db.select(['username','password','email','group']).from('users').where('username', username);

            user = null;
            if(rows.length) {
                user = rows[0] as User;
            }

            await this._cache.set(username, user);
        }

        return user;
    }

    public async insert(user: User) : Promise<void> {
        await this._db('users').insert(user);
        await this._cache.set(user.username, user);
    }
}