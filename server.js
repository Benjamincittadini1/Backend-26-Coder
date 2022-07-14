import 'dotenv/config'
import express from 'express';
import routerProducto from './src/routes/routes.js';
import { Server as http } from 'http'
import { Server as ioServer } from 'socket.io'
import { saveMsjs, getMsjs } from './src/controllers/mensajes.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';

//defino __dirname para poder usar la carpeta public
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use("/public", express.static('./public/'));

app.use(cookieParser());
app.use(session({
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://MarcosLabra:34851809a@coderback.pfiz1.mongodb.net/Session?retryWrites=true&w=majority' }),
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 1000
    }
}));

const httpserver = http(app)
const io = new ioServer(httpserver)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/', routerProducto);

//webSocket para msj
io.on('connection', async (socket) => {
    console.log('Usuario conectado');
    socket.on('enviarMensaje', (msj) => {
        saveMsjs(msj);
    })

    socket.emit('mensajes', await getMsjs());
})

//render condicional para el login
app.get('/', (req, res) => {
    try {
        if (req.session.user) {
            res.sendFile(__dirname + '/views/index.html');
        } else {
            res.sendFile(__dirname + '/views/login.html');
        }
    } catch (err) {
        console.log(err);
    }
})
//defino el userName en session
app.post('/setUserName', (req, res) => {
    req.session.user = req.body.user;
    process.env.USER = req.body.user;
    res.redirect('/');
})
//tomo el userName por session
app.get('/getUserName', (req, res) => {
    try {
        if (req.session.user) {
            const user = process.env.USER;
            res.send({
                user
            })
        } else {
            res.send({
                userName: 'no existe'
            })
        }
    } catch (err) {
        console.log(err);
    }
})
//recupero el nombr de usuario por env
app.get('/getUserNameEnv', (req, res) => {
    const user = process.env.USER;
    res.send({
        user
    })
})

app.get('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/logout');
            }
        })
    } catch (err) {
        console.log(err);
    }
})

app.get('/logoutMsj', (req, res) => {
    try {
        res.sendFile(__dirname + '/views/logout.html');
    }
    catch (err) {
        console.log(err);
    }
})



const PORT = process.env.PORT || 8080;

const server = httpserver.listen(PORT, () => {
    console.log(`Server is running on port: ${server.address().port}`);
});
server.on('error', error => console.log(`error running server: ${error}`));

