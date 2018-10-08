const express = require('express')
const app = express()

// bitcoin libs
const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')

var sc = require('./simpleChain.js')
var resp = require('./Response.js')
var star = require('./Star.js')

let DEFAULT_VALIDATION_WINDOW = 300;
let TMP = "temp_"; // prefix for temporary keys in the leveldb
let TMP2 = "temp2_"; // prefix for temporary keys in the leveldb that have had their address validated

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

    if (req.params.blockID > 0) {
      let story = ret.body.star.story;
      let storyDecoded = new Buffer(story, 'hex').toString();
      ret.body.star.storyDecoded = storyDecoded;
    }

    res.send(ret)
  } catch(e) {
    res.send('ERROR e is: ' + e)
  }

})

app.get('/stars/address::addr', async function (req, res) {

  var stream = sc.db.createReadStream();
  var ret = "[";

  stream.on('data', function (data) {
    var lBlock = JSON.parse(data.value);
    var lBody = lBlock.body;
    var lAddress = lBody.address;

    if (lAddress == req.params.addr) {
      ret += data.value + ',';
    }

  }).on('close', function () {
    ret = ret.substring(0, ret.length - 1);
    ret += ']';
    res.send(ret);
  });

})

app.get('/stars/hash::hash', async function (req, res) {

  var stream = sc.db.createReadStream();

  stream.on('data', function (data) {
    var lBlock = JSON.parse(data.value);
    var lHash = lBlock.hash;

    if (lHash == req.params.hash) {
      res.send(JSON.parse(data.value))
    }
  });
})

app.get('/printDB', async function (req, res) {
  try {
    //console.log('\nPrinting all of the data in the levelDB ...\n');
    
    var stream = sc.db.createReadStream();
    var ret = "START <p>";
    stream.on('data', function (data) {
      //console.log('key = ' + data.key + " , value = " + data.value);
      ret += 'key = ' + data.key + " , value = " + data.value + '<p>';
    }).on('close', function () {
      ret += '<p> DONE';
      //console.log('\nDONE Printing all of the data in the levelDB\n');
      res.send(ret);
    });

  } catch (e) {
    res.send('ERROR e is: ' + e + '\n')
  }
})

app.get('/cleanOldRequests', async function (req, res) {
  try {
    var stream = sc.db.createReadStream({gte:TMP});
    let ret = "DONE";
    var keysToCheck = [];
    stream.on('data', function (data) {
      keysToCheck.push(data.key);
    }).on('close', function () {
      
      for (var i in keysToCheck) {
        let lResponse = sc.checkEntry(keysToCheck[i]);
      }

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
 
  let checkStar = star.checkStarData(req.body.star);
  let address = req.body.address;

  // need to check if they have validated their address aka star validation routine.
  let checkValidated = await sc.getLevel(TMP2 + address);
  let test = false;
  if (checkValidated != -1) {
    test = true;
  }

  if (checkStar && test) {
    // make the new star obj in here.
    let newStar = await star.createStar(req.body.star);
    //console.log("address is: " + req.body.address);
    //console.log("newStar is: " + newStar.toString());
    let newBlock = await new sc.Block(req.body.address, newStar);
    //console.log("newBlock is: " + newBlock.toString());

    let tempBlockchain = await new sc.bc();
    let ht = await sc.getHeight();
    tempBlockchain.height = ht;
    console.log("ht is : " + ht)
    
    if (tempBlockchain.height == 0) {
      ht++;
    }
    let ret = await tempBlockchain.addBlock(ht, newBlock);
    console.log('ret is: ' + ret);
    //ht--;
    console.log('about to getLevel(' + ht + ')');
    var getJustAddedBlock = await sc.getLevel(ht);
    //console.log("getJustAddedBlock is: " + getJustAddedBlock);
    res.send(JSON.parse(getJustAddedBlock));
     
    // need to delete TMP2 entry
    sc.deleteEntry(TMP2 + address);
  }
  else {
    res.send("FAILED. Either check or test did not work...");
  }
})

app.post('/requestValidation', async function (req, res) {
  let lAddress = req.body.address;
  let lTimeStamp = new Date().getTime().toString().slice(0, -3);
  let lMessage = lAddress + ':' + lTimeStamp + ':starRegistry'
  let lValWindow = DEFAULT_VALIDATION_WINDOW;

  if (!lAddress) {
    res.send("FAILED. Address is empty");
  }

  // create a response with the default values
  let lResponse = new resp.Response(lAddress, lTimeStamp, lMessage, lValWindow);
  
  // need to check if this address already has a request in the levelDB
  // if so, need to check validationWindow and update and/or cleanup old reqs, and add a new one.
  let lCheck = await sc.getLevel(TMP + lAddress);
  
  // if the check comes back with a non -1 response then there was already a record for this address in the db.
  // need to do some cleanup or modification of the existing record
  if (lCheck != -1) {
    lCheck = JSON.parse(lCheck);

    let lTimeRemaining = lCheck.validationWindow - (lTimeStamp - lCheck.requestTimeStamp);

    // if another request comes in within the validation window then update the value. else just use the default value (300)
    if (lTimeRemaining > 0 && lTimeRemaining < DEFAULT_VALIDATION_WINDOW) {
      lResponse.validationWindow = lTimeRemaining;
    }    
  }
  
  let ret = JSON.stringify(lResponse)

  // add a temporary entry to the leveldb
  sc.addTempLevel(TMP + lAddress, ret);

  res.send(JSON.parse(ret));
})

app.post('/message-signature/validate', async function (req, res) {
  // Verify a Bitcoin message
  const address = req.body.address
  const signature = req.body.signature
  let ret = "FAILED";

  if (!address || !signature) {
    res.send(JSON.parse(ret));
  }

  let lCheck = await sc.getLevel(TMP + address);
  if (lCheck != -1) {
    lCheck = JSON.parse(lCheck);

    console.log("lCheck.address is : " + lCheck.address);
    console.log("lCheck.requestTimeStamp is : " + lCheck.requestTimeStamp);
    console.log("lCheck.message is : " + lCheck.message);
    console.log("lCheck.validationWindow is : " + lCheck.validationWindow);

    let message = lCheck.message;

    // TODO need to check Validation Window
    let test = true;
    let lTimeStamp = new Date().getTime().toString().slice(0, -3);

    let lTimeRemaining = lCheck.validationWindow - (lTimeStamp - lCheck.requestTimeStamp);

    // check if there is still time remaining
    if (lTimeRemaining < 0) {
      test = false;
      res.send(ret);
    }   

    
    if (bitcoinMessage.verify(message, address, signature) && test) {
      console.log("Checks out");

      // not the most elegant method of JSONifying something...
      ret = "{\"registerStar\": true,\"status\": {\"address\": \"" + lCheck.address + "\",\"requestTimeStamp\": \"" + lCheck.requestTimeStamp + "\",\"message\": \"" + lCheck.message + "\",\"validationWindow\": " + lTimeRemaining + ",\"messageSignature\": \"valid\"}}";
      console.log("ret is: " + ret);

      // need to delete TMP entry and insert TMP2 entry
      let lDel = await sc.deleteEntry(TMP + address);
  
      // add a new temporary entry to the leveldb
      sc.addTempLevel(TMP2 + address, JSON.stringify(lCheck));

    }
    else {
      console.log("Didn't check out");
      ret = "FAILED"; // for good measure ;)
    }
  }

  res.send(JSON.parse(ret));
})

app.listen(8000, () => console.log('Example app listening on port 8000!'));
