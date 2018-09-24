const express = require('express')
const app = express()

var sc = require('./simpleChain.js')
var resp = require('./Response.js')

// taken from StackOverflow answer (https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters)
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.get('/', function (req, res, next) {
  console.log('the response will be sent by the next function ...')
  //res.send('Hello from before B!')
  next()
}, function (req, res) {
  res.send('Hello from B!')
})

app.get('/block/:blockID', async function (req, res) {

  //res.send('Got a GET request at block, and blockID is ' + req.params.blockID)
  try{
    console.log('trying to access the chain ...');
    var ret = await sc.getLevel(req.params.blockID);
    if (ret == -1) 
    {
      res.send('ERROR: no block with ID: ' + req.params.blockID)
      return;
    }
    //console.log('ret is : ' + ret);
    ret = JSON.parse(ret);
    //console.log('ret.body is : ' + ret.body);
    res.send(ret)
  } catch(e) {
    res.send('ERROR e is: ' + e)
  }

})

app.get('/printDB', async function (req, res) {
  try {
    console.log('\nPrinting all of the data in the levelDB ...\n');
    
    var stream = sc.db.createReadStream();
    var ret = "START <p>";
    stream.on('data', function (data) {
      console.log('key = ' + data.key + " , value = " + data.value);
      ret += 'key = ' + data.key + " , value = " + data.value + '<p>';
    }).on('close', function () {
      ret += '<p> DONE';
      console.log('\nDONE Printing all of the data in the levelDB\n');
      res.send(ret);
    });

  } catch (e) {
    res.send('ERROR e is: ' + e + '\n')
  }
})

app.post('/', function (req, res) {
  res.send('Got a POST request')
})

app.post('/block', async function (req, res) {
  //console.log('req.body.body is : ' + req.body.body + '\n');
  let newBlock = await new sc.Block(req.body.body);
  let tempBlockchain = await new sc.bc();
  tempBlockchain.height = await sc.getHeight();
  //console.log('so far height is: ' + tempBlockchain.height);
  let ret = await tempBlockchain.addBlock(newBlock);
  //console.log('ret is: ' + ret);
  var getJustAddedBlock = await sc.getLevel(tempBlockchain.height);
  //res.send('body content of POST request is: ' + req.body.body + '\n');
  res.send(getJustAddedBlock);
  //res.send('Got a POST request in block \n')
})

app.post('/requestValidation', async function (req, res) {
  let lAddress = req.body.address;
  let lTimeStamp = new Date().getTime().toString().slice(0, -3);
  let lMessage = lAddress + ':' + lTimeStamp + ':starRegistry'
  let lValWindow = 300;
  
  // need to check if this address already has a request in the levelDB
  // if so, need to check validationWindow and update and/or cleanup old reqs, and add a new one.

  let lResponse = new resp.Response(lAddress, lTimeStamp, lMessage, lValWindow);
  let ret = JSON.stringify(lResponse)

  res.send(ret);
})

app.listen(8000, () => console.log('Example app listening on port 8000!'));
