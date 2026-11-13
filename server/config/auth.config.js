if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env.local and fill it in.');
}

module.exports = {
    secret: process.env.JWT_SECRET
};
