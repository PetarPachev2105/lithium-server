exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('chatRoom', (table) => {
            table.string('id').primary();

            table.string('name');

            table.boolean('is_group');

            table.timestamp('created_at');

        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('chatRoom'),
    ]);
};
