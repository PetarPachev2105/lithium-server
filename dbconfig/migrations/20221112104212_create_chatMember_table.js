exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('chatMember', (table) => {
            table.string('id').primary();

            table.string('chatRoom_id');

            table.string('user_id');

            table.timestamp('created_at');

            table.index(['chatRoom_id', 'user_id'], 'chatRoom_id__user_id__index'); // Create an index on the chat room id and the user id for the chat members
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('chatMember'),
    ]);
};