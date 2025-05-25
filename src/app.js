import express from 'express';
import {NotFound, ErrorHandler} from './middleware/index.js';
import authController from './auth/auth.controller.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/auth', authController);

// catch 404
app.use(NotFound);

// error handler
app.use(ErrorHandler);

export default app;
