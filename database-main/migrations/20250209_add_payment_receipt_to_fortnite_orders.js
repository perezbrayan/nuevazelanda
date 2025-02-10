exports.up = function(knex) {
    return knex.schema.alterTable('fortnite_orders', function(table) {
        table.string('payment_receipt').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('fortnite_orders', function(table) {
        table.dropColumn('payment_receipt');
    });
};
