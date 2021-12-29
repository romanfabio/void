import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {

    await knex('variables').del();

    await knex('variables').insert([
        { key: 'FORUM NAME', value: 'void', isInt: false},
        {key: 'FORUM PAGINATION', value: '5', isInt: true},
        { key: 'HOME PAGINATION', value: '5', isInt: true}
    ]);
};
