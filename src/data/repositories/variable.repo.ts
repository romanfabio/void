import { Knex } from "knex";

export default class VariableRepository {

    private readonly db : Knex;
    private readonly vars: Map<string, string | number>;

    constructor(database: Knex) {
        this.db = database;
        this.vars = new Map();
    }

    public async load() : Promise<void> {
        const rows = await this.db.select(['key','value','isInt']).from('variables');

        rows.forEach(e => {
            let value = e.value;
            if(e.isInt)
                value = parseInt(value);
            this.vars.set(e.key, value);
        });
    }

    public findByKey(key: string) : string | number {
        return this.vars.get(key) as string | number;
    }

    public async update(key: string, value: string, isInt: boolean) : Promise<void> {

        await this.db('variables').update({value, isInt}).where('key', key);

        this.vars.set(key, (isInt?parseInt(value):value));
    }
}