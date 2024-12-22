require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const { Module } = require('module');
const { doesNotMatch } = require('assert');

mongoose.connect('mongodb+srv://KhushiMhasange:Khushi2004@cluster0.d2sb7l4.mongodb.net/Url?retryWrites=true&w=majority&appName=Cluster0');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const shortURLSchema = new mongoose.Schema({
    original_url:{
      type:String,
      required:true,
      unique: true
    },
    short_url:{
      type:String,
      required:true,
      unique: true
    }
});

const shortURL = mongoose.model('Url1',shortURLSchema);
async function saveShortURL(ogurl, shorturl) {
  try {
    const data = new shortURL({
      original_url: ogurl,
      short_url: shorturl
    });
    const savedData = await data.save();
    console.log("Data saved successfully:", savedData);
  } catch (error) {
    console.error("Error saving data:", error);
  }
}
app.post('/api/shorturl',async (req,res)=>{
  const url = req.body.url;
  if (!url) {
    return res.json({ error: 'invalid url' });
  }
  try {
    new URL(url);
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }
  const ogurl = new URL(url);
  try {
    await new Promise((resolve, reject) => {
      dns.lookup(new URL(url).hostname, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  catch (error) {
    console.error("Error:", error);
    res.json({ error: 'invalid url' }); 
  }
  const shorturl = Math.floor(Math.random()*100000).toString();
  saveShortURL(ogurl,shorturl);
  res.json({
    original_url:ogurl,
    short_url:shorturl
  })
});

app.get('/api/shorturl/:short',async(req,res)=>{
  const short_url = req.params.short;
  try {
    const findUrl = await shortURL.findOne({ short_url });
    if (findUrl === null) {
      throw Error;
    } else {
      return res.redirect(findUrl.original_url);
    }
  }
  catch (error) {
    return res.json({ error: 'invalid short url, POST URL first' })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
