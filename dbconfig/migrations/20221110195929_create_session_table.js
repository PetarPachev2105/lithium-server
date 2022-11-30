exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('session', (table) => {
            table.string('id').primary();

            table.text('access_token');

            table.string('user_id');

            table.timestamp('created_at');

            table.index(['access_token', 'user_id'], 'access_token__user_id__index'); // Create an index on the access token and the user id for the session
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('session'),
    ]);
};