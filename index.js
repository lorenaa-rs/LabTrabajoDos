
const express = require('express')
const app = express()

const port = process.argv[2];
//const port = 3001;
const bodyparser = require('body-parser')
const multer = require('multer')
const cors = require('cors');
var sizeOf = require('image-size');

var Jimp = require("jimp");
const { default: axios } = require('axios');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })

app.use(express.json())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'));

app.get('/', (req, res) => {
    console.log("Connection");
    res.send('http://localhost:' + port + '/')
})

app.post('/loadImg', upload.single('files'), (req, res, next) => {
    console.log("Connection")
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    console.log(file.filename)
    axios.get('https://geek-jokes.sameerkumar.website/api?format=json').then(function(response){
        editImg('public/' + file.filename, response.data.joke);
        res.send(file.filename)
    })
   
})

app.post('/getImage', (req, res) => {
    console.log(req.body);
    var divFile = "<div>"
        + "<img src='http://localhost:" + port + '/' + req.body.fileName + "'" + "/>"
        + "</div>"
    //res.sendFile(__dirname + '/public/' + req.body.fileName)
    res.end(divFile);
})

function editImg(filePath, text) {
    var wi = ""
    var he = ""
    sizeOf(filePath, function (err, dimensions) {
        if (!err) {
            wi = dimensions.width;
            he = dimensions.height;
        }
    });
    Jimp.read(filePath)
        .then(function (image) {
            loadedImage = image;
            return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        })
        .then(function (font) {
            loadedImage.print(font, (wi / 3), (he - 30), text)
                .write(filePath);
        })
        .catch(function (err) {
            console.error(err);
        });
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})