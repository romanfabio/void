import Forum from "../../models/forum.model";
import { IForumCache } from "../Icache";

export default class ForumCache implements IForumCache {
    private _forums : Map<string, Forum | null>;

    constructor() {
        this._forums = new Map<string, Forum>();
    }

    async set(name: string, forum: Forum | null): Promise<void> {
        this._forums.set(name, forum);
    }
    async findByName(name: string): Promise<Forum | null | undefined> {
        return this._forums.get(name);
    }
   
}