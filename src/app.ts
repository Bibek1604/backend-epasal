import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

// ===========================================
// CREATE EXPRESS APP
// ===========================================
const app: Application = express();

// ===========================================
// 1. CORS CONFIGURATION - MUST BE FIRST
// ===========================================
// Handle preflight OPTIONS requests to prevent 502 errors on Render
const corsOptions: cors.CorsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept,Origin',
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browsers
  maxAge: 86400, // Cache preflight for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicit OPTIONS handler for ALL routes (prevents 502 on preflight)
app.options('*', cors(corsOptions));

// ===========================================
// 2. TRUST PROXY (Required for Render/Heroku)
// ===========================================
app.set('trust proxy', 1);

// ===========================================
// 3. SECURITY MIDDLEWARE
// ===========================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ===========================================
// 4. BODY PARSERS
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// 5. COMPRESSION
// ===========================================
app.use(compression());

// ===========================================
// 6. HEALTH CHECK (Render uses this)
// ===========================================
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ===========================================
// 7. REQUEST LOGGING (Development only)
// ===========================================
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
  });
}

// ===========================================
// 8. API ROUTES
// ===========================================
app.use('/api/v1', routes);

// ===========================================
// 9. SWAGGER DOCUMENTATION
// ===========================================
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ===========================================
// 10. UTILITY ROUTES
// ===========================================
app.get('/swagger', (_req: Request, res: Response) => res.redirect('/api-docs'));
app.get('/favicon.ico', (_req: Request, res: Response) => res.sendStatus(204));

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Epasaley E-Commerce API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  });
});

// ===========================================
// 11. ERROR HANDLERS (Must be last)
// ===========================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;