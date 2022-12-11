exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('lithiumHoodRequest', (table) => {
            table.string('id').primary();

            table.string('lithiumHood_id');

            table.string('user_id');

            table.timestamp('sent_at');

            table.unique(['lithiumHood_id', 'user_id'], 'lithiumHoodRequest__lithiumHood_id__user_id__index');
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('lithiumHoodRequest'),
    ]);
};