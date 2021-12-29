import { config } from 'dotenv';
config();

module.exports = {

  development: {
    client: "postgresql",
    connection: process.env.DATABASE,
    seeds: {
      directory: './src/data/seeds'
    },
    migrations: {
      directory: './src/data/migrations'
    }
  },

  staging: {
    client: "postgresql",
    connection: process.env.DATABASE,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "postgresql",
    connection: process.env.DATABASE,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }

};
