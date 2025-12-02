import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

const app: Application = express();

/**
 * ============================================
 * CORS Configuration - MUST BE FIRST
 * ============================================
 * Handle preflight OPTIONS requests properly to avoid 502 errors
 */
const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browsers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // Cache preflight for 24 hours
};

// Apply CORS before everything
app.use(cors(corsOptions));

// Explicit OPTIONS handler for all routes (prevents 502 on preflight)
app.options('*', cors(corsOptions));

/**
 * Trust proxy (required for Render, Heroku, etc.)
 */
app.set('trust proxy', 1);

/**
 * Security Middleware
 */
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/**
 * Body Parser & Compression
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

/**
 * Health Check - responds quickly to prevent cold start timeouts
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Request Logging (Development)
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

/**
 * API Routes
 */
app.use('/api/v1', routes);

/**
 * Swagger UI - OpenAPI documentation
 */
// Serve the raw OpenAPI JSON for debugging
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Enable explorer and other UI options so operations are visible
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Warn in logs if no paths were generated (helps debug missing routes)
if (!(swaggerSpec as any).paths || Object.keys((swaggerSpec as any).paths).length === 0) {
  // eslint-disable-next-line no-console
  console.warn('Swagger spec has no paths. Ensure routes are detectable or add JSDoc annotations.');
}

/**
 * Helpful redirects and small handlers
 */
// Redirect common swagger path to the docs
app.get('/swagger', (_req: Request, res: Response) => res.redirect('/api-docs'));
app.get('/swagger/', (_req: Request, res: Response) => res.redirect('/api-docs'));

// Avoid noisy 404s from browser favicon requests
app.get('/favicon.ico', (_req: Request, res: Response) => res.sendStatus(204));

// Provide a small API index at /api/v1
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Epasaley E-Commerce API - v1',
    documentation: '/api/v1/docs',
  });
});

/**
 * Root Route
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Epasaley E-Commerce API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

/**
 * 404 Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

export default app;

