const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and its dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *       503:
 *         description: Service is unhealthy
 */

// Basic health check
router.get('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      dependencies: {}
    };

    // Check MongoDB connection
    try {
      const mongoStart = Date.now();
      await mongoose.connection.db.admin().ping();
      healthCheck.dependencies.mongodb = {
        status: 'connected',
        responseTime: Date.now() - mongoStart,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };
    } catch (error) {
      healthCheck.dependencies.mongodb = {
        status: 'disconnected',
        error: error.message,
        readyState: mongoose.connection.readyState
      };
      healthCheck.status = 'degraded';
    }

    // Check Redis connection (if available)
    try {
      const redis = require('../config/redis').getRedisClient();
      if (redis) {
        const redisStart = Date.now();
        await redis.ping();
        healthCheck.dependencies.redis = {
          status: 'connected',
          responseTime: Date.now() - redisStart
        };
      }
    } catch (error) {
      healthCheck.dependencies.redis = {
        status: 'disconnected',
        error: error.message
      };
    }

    // Check if any critical services are down
    const criticalServices = ['mongodb'];
    const failedCriticalServices = criticalServices.filter(
      service => healthCheck.dependencies[service]?.status !== 'connected'
    );

    if (failedCriticalServices.length > 0) {
      healthCheck.status = 'unhealthy';
      return res.status(503).json(healthCheck);
    }

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Kubernetes readiness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready to receive traffic
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if the service is ready to handle requests
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Database not connected'
      });
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Kubernetes liveness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Application metrics
 *     description: Returns application performance metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Metrics data
 */
router.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024) // MB
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    process: {
      pid: process.pid,
      ppid: process.ppid,
      platform: process.platform,
      version: process.version
    },
    eventLoop: {
      lag: 0 // Could implement event loop lag measurement
    }
  });
});

module.exports = router;