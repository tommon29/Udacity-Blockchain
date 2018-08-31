const express = require('express')
const app = express()

var sc = require('./simpleChain.js')

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

//app.get('/steve', (req, res) => res.send('Hello World2!'));

app.listen(8000, () => console.log('Example app listening on port 8000!'));
