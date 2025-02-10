exports.up = async function(knex) {
    // Primero arreglamos la tabla settings
    await knex.schema.dropTableIfExists('settings');
    await knex.schema.createTable('settings', function(table) {
        table.string('key').primary();
        table.text('value');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Insertar el valor inicial de vbucks_rate
    await knex('settings').insert({
        key: 'vbucks_rate',
        value: '1.0',
        created_at: new Date(),
        updated_at: new Date()
    });

    // Crear tabla vbucks_rate_history si no existe
    await knex.schema.createTable('vbucks_rate_history', function(table) {
        table.increments('id').primary();
        table.decimal('rate', 10, 2).notNullable();
        table.integer('created_by').unsigned().references('id').inTable('admins');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Crear nueva tabla para pedidos de Fortnite
    await knex.schema.createTable('fortnite_orders', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users');
        table.string('username').notNullable();
        table.string('offer_id').notNullable();
        table.string('item_name').notNullable();
        table.integer('price').notNullable();
        table.boolean('is_bundle').defaultTo(false);
        table.enum('status', ['pending', 'completed', 'failed']).defaultTo('pending');
        table.text('metadata').nullable(); // Para almacenar metadatos adicionales en formato JSON
        table.text('error_message').nullable();
        table.text('payment_receipt').nullable(); // Agregar columna para el comprobante de pago
        table.timestamps(true, true);
    });

    // Actualizar la tabla gifts para Fortnite
    await knex.schema.alterTable('gifts', function(table) {
        // Eliminar columnas relacionadas con Roblox si existen
        table.dropForeign(['product_id']);
        table.dropColumn('product_id');
        
        // Agregar columnas específicas para Fortnite
        table.string('offer_id').notNullable();
        table.integer('price').notNullable();
        table.boolean('is_bundle').defaultTo(false);
        table.string('item_name').notNullable();
    });
};

exports.down = async function(knex) {
    // Revertir los cambios en la tabla gifts
    await knex.schema.alterTable('gifts', function(table) {
        table.dropColumn('offer_id');
        table.dropColumn('price');
        table.dropColumn('is_bundle');
        table.dropColumn('item_name');
        
        // Restaurar la columna product_id
        table.integer('product_id').unsigned().references('id').inTable('roblox_products');
    });

    // Eliminar las tablas en orden inverso
    await knex.schema.dropTableIfExists('fortnite_orders');
    await knex.schema.dropTableIfExists('vbucks_rate_history');
    await knex.schema.dropTableIfExists('settings');
};
