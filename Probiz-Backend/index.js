require('dotenv').config();
const express = require('express')
 const cors = require('cors')
const app = express()
const bodyParser = require('body-parser');
const path = require('path')
const db = require('./models/db.connection.on');
// Skip JSON parsing for Cashfree webhook to preserve raw body for signature validation.
app.use((req, res, next) => {
    if (req.originalUrl === '/api/cashfree/webhook') return next();
    return express.json()(req, res, next);
});

// Keep body-parser available for other middleware, but do not use bodyParser.json() globally.
// (The webhook route uses `express.raw()` and must receive the raw payload.)
const http = require('http');
const https = require('https');
var fs = require('fs');

// Read SSL files
const privateKey = fs.readFileSync(path.resolve(__dirname, 'yourdomain.key'), 'utf8');
const certificate = fs.readFileSync(path.resolve(__dirname, 'certificate.crt'), 'utf8');

// Create credentials
const credentials = { key: privateKey, cert: certificate };

let corsOptions = {
    origin: "*"
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'));

db.mongoose.connect(db.url, {
   
}).then(() => {
    console.log("Mongodb Connected");
})
.catch((err) => {
        console.log("Failed to Connect", err)
        process.exit();
})

require('./routes/admin.routes')(app)
require('./routes/user.routes')(app)
require('./routes/calculator.route')(app);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'website')));
app.use(express.static(path.join(__dirname, 'website/out')))

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'website/out','/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'website')));
app.use(express.static(path.join(__dirname, 'website/admin-panel')))

app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname,'website/admin-panel', 'index.html'));
});

const PORT = process.env.PORT || 800;
app.set("port", PORT);

/** Create HTTP server. */
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
});

const httpsServer = https.createServer(credentials, app).listen(443, () => {
    console.log("https server running successfully");
});


