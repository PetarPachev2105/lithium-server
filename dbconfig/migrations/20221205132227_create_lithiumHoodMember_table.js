exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('lithiumHoodMember', (table) => {
            table.string('id').primary();

            table.string('lithiumHood_id');

            table.string('user_id');

            table.string('role');

            table.timestamp('in_the_hood_since');

            table.unique(['lithiumHood_id', 'user_id'], 'lithiumHoodMember__lithiumHood_id__user_id__index'); // Create an index on the access token and the user id for the session
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('lithiumHoodMember'),
    ]);
};