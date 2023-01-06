exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('lithiumSent', (table) => {
            table.string('id').primary();

            table.string('user_id');

            table.string('lithiumHood_id');

            table.timestamp('sent_at');

            table.boolean('seen');

            table.unique(['lithiumHood_id', 'user_id'], 'lithiumSent__lithiumHood_id__user_id__index');
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('lithiumSent'),
    ]);
};