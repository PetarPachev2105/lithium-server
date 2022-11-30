exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('message', (table) => {
            table.string('id').primary();

            table.string('chatRoom_id');

            table.string('user_id');

            table.integer('number');

            table.text('content');

            table.timestamp('sent_at');

            table.unique(['chatRoom_id', 'number'], 'chatRoom_id__number__index'); // Create UNIQUE index
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('message'),
    ]);
};
