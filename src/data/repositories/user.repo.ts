import User from "../models/user.model";
import { Knex } from "knex";
import { IUserCache } from "../cache/Icache";

export default class UserRepository {

    private readonly db : Knex;
    private readonly cache : IUserCache;

    constructor(cache: IUserCache, database: Knex) {
        this.cache = cache;
        this.db = database;
    }

    public async findByUsername(username: string) : Promise<User | null> {
        
        let user = await this.cache.findByUsername(username);

        if(!user) {
            const rows = await this.db.select(['username','password','email','group']).from('users').where('username', username);

            if(!rows.length)
                return null;

            user = rows[0] as User;
            await this.cache.cache(user);
        }

        return user;
    }

    public async insert(user: User) : Promise<void> {
        await this.db('users').insert(user);
        await this.cache.cache(user);
    }
}