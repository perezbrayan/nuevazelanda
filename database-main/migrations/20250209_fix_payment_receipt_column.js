exports.up = function(knex) {
    return knex.schema.alterTable('fortnite_orders', function(table) {
        // Eliminar la columna si existe
        table.dropColumn('payment_receipt');
        // Agregar la columna nuevamente con el tipo correcto
        table.text('payment_receipt').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('fortnite_orders', function(table) {
        table.dropColumn('payment_receipt');
    });
};
