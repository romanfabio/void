import Forum from "../../models/forum.model";
import { IForumCache } from "../Icache";

export default class ForumCache implements IForumCache {
    private _forums : Map<string, Forum>;
    private _names : string[] | null;

    constructor() {
        this._forums = new Map<string, Forum>();
        this._names = null;
    }

    async names(): Promise<string[] | null> {
        return this._names;
    }
    async cacheNames(names: string[]) : Promise<void> {
        this._names = names;
    }
    async cache(forum: Forum): Promise<void> {
        this._forums.set(forum.name, forum);
    }
    async findByName(name: string) : Promise<Forum | null> {
        return this._forums.get(name) as Forum | null;
    }
}