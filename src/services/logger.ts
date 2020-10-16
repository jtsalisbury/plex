import winston from 'winston';

let logger =  winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ]
});

if (process.env.DEBUG_MODE) {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}


export default logger;