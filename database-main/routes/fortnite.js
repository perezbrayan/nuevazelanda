const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/payment_receipts');
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    },
    fileFilter: function (req, file, cb) {
        // Aceptar solo imágenes
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Solo se permiten archivos de imagen'));
        }
        cb(null, true);
    }
});

// Obtener todas las órdenes (solo admin)
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
    try {
        const db = req.db;
        const orders = await db('fortnite_orders')
            .select('*')
            .orderBy('created_at', 'desc');

        res.json({
            success: true,
            data: orders,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al obtener órdenes de Fortnite:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener la lista de órdenes',
            timestamp: new Date().toISOString()
        });
    }
});

// Actualizar estado de una orden (solo admin)
router.put('/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, error_message } = req.body;
        const db = req.db;

        // Validar estado
        if (!['pending', 'completed', 'failed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido',
                timestamp: new Date().toISOString()
            });
        }

        // Actualizar estado de la orden
        await db('fortnite_orders')
            .where({ id })
            .update({
                status,
                error_message: error_message || null,
                updated_at: new Date()
            });

        res.json({
            success: true,
            message: 'Estado de la orden actualizado exitosamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al actualizar estado de la orden:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el estado de la orden',
            timestamp: new Date().toISOString()
        });
    }
});

// Crear una nueva orden (usuario autenticado o no)
router.post('/orders', upload.single('payment_receipt'), async (req, res) => {
    try {
        console.log('Recibiendo solicitud de nueva orden:', {
            body: req.body,
            file: req.file
        });

        const { offer_id, item_name, price, is_bundle, metadata, username } = req.body;
        const db = req.db;

        // Validar campos requeridos
        if (!offer_id || !item_name || !price || !username) {
            console.log('Faltan campos requeridos:', {
                offer_id,
                item_name,
                price,
                username
            });
            // Si hay un archivo subido, eliminarlo ya que la validación falló
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos',
                timestamp: new Date().toISOString()
            });
        }

        // Preparar los datos de la orden
        const orderData = {
            user_id: req.user?.id || null,
            username,
            offer_id,
            item_name,
            price: Number(price),
            is_bundle: is_bundle || false,
            metadata: metadata ? JSON.stringify(metadata) : null,
            status: 'pending',
            payment_receipt: req.file ? `/payment-receipt/${req.file.filename}` : null,
            created_at: new Date(),
            updated_at: new Date()
        };

        // Guardar el archivo si existe
        if (req.file) {
            console.log('Archivo de comprobante recibido:', req.file.filename);
        }

        console.log('Creando orden con datos:', orderData);

        // Crear nueva orden
        const [orderId] = await db('fortnite_orders').insert(orderData);

        console.log('Orden creada con ID:', orderId);

        // Verificar que la orden se creó correctamente
        const order = await db('fortnite_orders').where({ id: orderId }).first();

        if (!order) {
            console.error('No se pudo encontrar la orden después de crearla');
            // Si hay un archivo subido, eliminarlo ya que la orden no se creó
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            throw new Error('No se pudo crear la orden');
        }

        console.log('Orden recuperada de la base de datos:', order);

        // Enviar respuesta exitosa
        res.json({
            success: true,
            data: {
                order: {
                    ...order,
                    message: '¡Orden creada exitosamente! Tu pedido está siendo procesado.'
                },
                message: 'Orden creada exitosamente',
                payment_receipt: req.file ? `/payment-receipt/${req.file.filename}` : null
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        // Si hay un archivo subido, eliminarlo ya que hubo un error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Error al crear orden de Fortnite:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Error al crear la orden. Por favor, intente nuevamente.',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Servir imágenes de comprobantes de pago (solo admin)
router.get('/payment-receipt/:filename', verifyToken, isAdmin, (req, res) => {
    try {
        const { filename } = req.params;
        console.log('Solicitando comprobante:', filename);
        
        const filePath = path.join(__dirname, '../uploads/payment_receipts', filename);
        console.log('Ruta completa del archivo:', filePath);
        
        // Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
            console.error('Archivo no encontrado en:', filePath);
            return res.status(404).json({
                success: false,
                error: 'Comprobante de pago no encontrado',
                timestamp: new Date().toISOString()
            });
        }

        console.log('Archivo encontrado, enviando...');
        // Enviar el archivo
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error al obtener comprobante de pago:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el comprobante de pago',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
