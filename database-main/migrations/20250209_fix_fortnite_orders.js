exports.up = async function(knex) {
    // Verificar si la tabla existe
    const exists = await knex.schema.hasTable('fortnite_orders');
    
    if (exists) {
        // Si existe, modificar la tabla
        await knex.schema.alterTable('fortnite_orders', function(table) {
            // Agregar la columna payment_receipt si no existe
            table.text('payment_receipt').nullable();
        });
    } else {
        // Si no existe, crear la tabla
        await knex.schema.createTable('fortnite_orders', function(table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().references('id').inTable('users');
            table.string('username').notNullable();
            table.string('offer_id').notNullable();
            table.string('item_name').notNullable();
            table.integer('price').notNullable();
            table.boolean('is_bundle').defaultTo(false);
            table.enum('status', ['pending', 'completed', 'failed']).defaultTo('pending');
            table.text('metadata').nullable();
            table.text('error_message').nullable();
            table.text('payment_receipt').nullable();
            table.timestamps(true, true);
        });
    }
};

exports.down = async function(knex) {
    const exists = await knex.schema.hasTable('fortnite_orders');
    
    if (exists) {
        await knex.schema.alterTable('fortnite_orders', function(table) {
            table.dropColumn('payment_receipt');
        });
    }
};
