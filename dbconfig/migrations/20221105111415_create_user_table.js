exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('user', (table) => {
            table.string('id').primary();

            table.text('username');

            table.text('email');

            table.text('password');

            table.text('global_role');
        }),
    ]);
};
  
exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('user'),
    ]);
};