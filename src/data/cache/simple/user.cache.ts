import User from "../../models/user.model";
import { IUserCache } from "../Icache";

export default class UserCache implements IUserCache {

    private _users : Map<string, User>;

    constructor() {
        this._users = new Map<string, User>();
    }

    async findByUsername(username: string): Promise<User | null> {
        return this._users.get(username) as User | null;
    }
    async cache(user: User): Promise<void> {
        this._users.set(user.username, user);
    }
    
}