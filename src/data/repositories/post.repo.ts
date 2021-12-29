import Post from "../models/post.model";
import { Knex } from "knex";

export default class PostRepository {

    private readonly db : Knex;

    constructor(database: Knex) {
        this.db = database;
    }

    public async findById(id: number) : Promise<Post | null> {
        const rows = await this.db.select(['id','forumName','title','description', 'creator', 'createdAt'])
                                    .from('posts')
                                    .where('id', id);

        if(!rows.length)
            return null;

        return rows[0] as Post;
    }

    public async countByForumName(name: string) : Promise<number> {
        const result = await this.db('posts').count('id', {as: 'count'}).where('forumName', name);
        return result[0].count as number;
    }

    public async findByForumName(name: string) : Promise<Post[]> {
        return await this.db.select(['id','forumName','title','description','creator','createdAt']).from('posts').where('forumName', name) as Post[];
    }

    public async page(offset: number, size: number, name: string) {
        return await this.db.select(['id','forumName','title','description','creator','createdAt'])
            .from('posts').where('forumName',name)
            .orderBy('createdAt','desc')
            .offset(offset).limit(size);
    }

    public async insert(post: Omit<Post, 'createdAt' | 'id'>) : Promise<void> {
        await this.db('posts').insert(post);
    }
}