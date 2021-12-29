import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {

    await knex('groups').del();

    await knex('groups').insert([
        { id: 0, name: 'anonymous', mask: new Uint8Array([0b10000000]) },
        { id: 1, name: 'user', mask: new Uint8Array([0b10000000]) },
        { id: 2, name: 'moderator', mask: new Uint8Array([0b10000000]) },
        { id: 3, name: 'admin', mask: new Uint8Array([0b11111111]) }
    ]);
};
