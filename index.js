const express = require('express')
const app = express()
//const port = process.argv[2];
const port = 3000;
const cors = require('cors');
const shellExec = require('shell-exec');
const shell = require('shelljs');
const nodemailer = require('nodemailer');
const bodyparser = require('body-parser')
const loadbalance = require('loadbalance')
var path = require('path')
var fs = require('fs')
var morgan = require('morgan')
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
const axios = require('axios');
var servers = ["http://localhost:3001/",
    "http://localhost:3002/",
    "http://localhost:3003/"]
var maxErrors = 3;    
var portNew = 3004;
var engine = loadbalance.roundRobin(servers)
var dockerip = 1;
var count = 0;
app.use(express.json())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('combined', {stream: accessLogStream}))
app.use(require('express-status-monitor')());

app.get('/', (req, res) => {
    loadBalancer(res);
})

app.post('/addServer', (req, res) => {    
    shell.exec(`sh bash.sh `)
    
    axios.get("https://172.17.0."+dockerip+"/"+portNew)
        .then(function (response) {            
            console.log("Servidor agregado: ")
            console.log('>'+response.data+'<')
            servers.push("https://172.17.0."+dockerIp+"/"+portNew)
            engine = loadbalance.roundRobin(servers)
            maxErrors = maxErrors + 1
            res.send("Servidor correctamente agregado")
            console.log("Servers: " + servers)
            portNew++;
            dockerIp++;
        })
        .catch(function (error) {            
            var txt = "Servidor: " + srv + " no disponible";
            res.send(txt)
            console.log(txt)
        })
    
})

function loadBalancer(res) {
    if (count < maxErrors) {
        var srv = engine.pick();
        console.log(srv + " ha recibido peticion");
        axios.get(srv)
            .then(function (response) {
                //console.log("count: " + count)
                count = 0;
                res.send(response.data)
            })
            .catch(function (error) {
                var txt = "Servidor: " + srv + " no disponible";
                console.log(txt)
                count = count + 1;
                //console.log("count: " + count)
                mail(txt);
                loadBalancer(res);
            })

    } else {
        res.send('Error')
        console.log("Servidores fuera de servicio")
        count = 0;
    }

}

function mail(data) {
    
    var trasnporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'pruebadistribuidos12',
            pass: 'Distribuidos2021'
        }
    });
    var infoMessage = {
        from: 'pruebadistribuidos12@gmail.com',
        to: 'lorena.rioss@uptc.edu.co',
        subject: 'Falla en el sistema',
        text: data
    };
    trasnporter.sendMail(infoMessage, function (error, info) {
        if (error) {
            console.log("error enviando correo");
            console.log(error);
        } else {
            console.log("Correo enviado");
        }
    });
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})