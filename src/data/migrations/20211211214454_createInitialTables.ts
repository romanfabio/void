import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('variables', function(table) {
        table.string('key', 32).notNullable();
        table.string('value', 255).notNullable();
        table.boolean('isInt').notNullable().defaultTo(false);

        table.primary(['key']);
    });

    await knex.schema.createTable('groups', function(table) {
        table.increments('id', {primaryKey: true});
        table.string('name', 32).notNullable();
        table.binary('mask').notNullable();
    });

    await knex.schema.createTable('users', function(table) {
        table.string('username', 32).notNullable();
        table.string('password', 60).notNullable();
        table.string('email', 128).notNullable();
        table.integer('group').notNullable();

        table.primary(['username']);
        table.unique(['email']);
        table.foreign('group').references('groups.id');
    });

    await knex.schema.createTable('forums', function(table) {
        table.string('name', 32).notNullable();
        table.string('description', 255).notNullable();
        table.string('creator', 32);
        table.string('userMask', 255).notNullable();
        table.string('moderatorMask', 255).notNullable();
        table.boolean('starred').notNullable().defaultTo(false);

        table.primary(['name']);
        table.foreign('creator').references('users.username');
    });

    await knex.schema.createTable('posts', function(table) {
        table.increments('id', {primaryKey: true});
        table.string('forumName', 32).notNullable();
        table.string('title', 255).notNullable();
        table.text('description').notNullable();
        table.string('creator', 32);
        table.timestamp('createdAt', {useTz: true}).notNullable().defaultTo(knex.fn.now());

        table.foreign('forumName').references('forums.name');
        table.foreign('creator').references('users.username');
    });

    await knex.schema.createTable('comments', function(table) {
        table.increments('id', {primaryKey: true});
        table.integer('postId').notNullable();
        table.integer('reply');
        table.text('description').notNullable();
        table.string('creator', 32);
        table.timestamp('createdAt', {useTz: true}).notNullable().defaultTo(knex.fn.now());

        table.foreign('postId').references('posts.id');
        table.foreign('creator').references('users.username');
    });

    await knex.schema.createTable('forumModerators', function(table) {
        table.string('username', 32).notNullable();
        table.string('forumName', 32).notNullable();

        table.foreign('username').references('users.username');
        table.foreign('forumName').references('forums.name');
        table.primary(['username','forumName']);
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('forumModerators')
    await knex.schema.dropTable('comments')
    await knex.schema.dropTable('posts')
    await knex.schema.dropTable('forums')
    await knex.schema.dropTable('users')
    await knex.schema.dropTable('groups')
    await knex.schema.dropTable('variables');
}

