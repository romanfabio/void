import { Knex } from "knex";

export default class VariableRepository {

    private readonly _db : Knex;
    private readonly _vars: Map<string, string | number>;

    constructor(database: Knex) {
        this._db = database;
        this._vars = new Map();
    }

    public async load() : Promise<void> {
        const rows = await this._db.select(['key','value','isInt']).from('variables');

        rows.forEach(e => {
            let value = e.value;
            if(e.isInt)
                value = parseInt(value);
            this._vars.set(e.key, value);
        });
    }

    public findByKey(key: string) : string | number {
        return this._vars.get(key) as string | number;
    }

    public async update(key: string, value: string, isInt: boolean) : Promise<void> {

        await this._db('variables').update({value, isInt}).where('key', key);

        this._vars.set(key, (isInt?parseInt(value):value));
    }
}