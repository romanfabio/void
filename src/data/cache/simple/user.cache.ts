import User from "../../models/user.model";
import { IUserCache } from "../Icache";

export default class UserCache implements IUserCache {

    private _users : Map<string, User | null>;

    constructor() {
        this._users = new Map<string, User | null>();
    }
    async set(username: string, user: User | null): Promise<void> {
        this._users.set(username, user);
    }
    async findByUsername(username: string): Promise<User | null | undefined> {
        return this._users.get(username);
    }
    
}