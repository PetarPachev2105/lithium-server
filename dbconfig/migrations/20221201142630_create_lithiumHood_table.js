exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('lithiumHood', (table) => {
            table.string('id').primary();

            table.string('user_id');

            table.timestamp('created_at');

        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('lithiumHood'),
    ]);
};
