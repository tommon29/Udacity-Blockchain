/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
let level = require('level');
let chainDB = './chaindata';
let db = level(chainDB);

let star = require('./Star.js')

let TMP = "temp_"; // prefix for temporary keys in the leveldb
let TMP2 = "temp2_"; // prefix for temporary keys in the leveldb that have had their address validated

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(aAddr, aData) {
    this.hash = "",
      this.height = 0,
      this.body = {address: aAddr, star: aData},
      this.time = 0,
      this.previousBlockHash = ""
  }

  toString() {
    var str = "\n";
    if (this.hash) { str += "hash = " + this.hash + '\n';}
    if (this.height) { str += "height = " + this.height + '\n';}
    if (this.body) { str += "body = " + this.body + '\n';}
    if (this.body.address) { str += "body.address = " + this.body.address + '\n';}
    if (this.body.star) { str += "body.star = " + this.body.star + '\n';}
    if (this.time) { str += "time = " + this.time + '\n';}
    if (this.previousBlockHash) { str += "previousBlockHash = " + this.previousBlockHash + '\n';}

    return str;
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    //this.chain = [];
    this.height = -1;
    this.initialize();
  }

  // asynchronosly initialize 
  async initialize() {
    let blockheight = await this.getBlock(0);
    this.height = blockheight;
    // if no height, then create genesis block
    if (blockheight == -1) {

      let newStar = await star.createGenesisStar();
      //console.log("address is: " + req.body.address);
      console.log("newStar is: " + newStar.toString());
      let newBlock = await new Block("1234567890123456789012345678901234", newStar);
      console.log("newBlock is: " + newBlock.toString());

      // as per a reviewers comments I am adding the genesis block without the star properties.
      delete newBlock.body.star;
      console.log("newBlock is (after trying to delete body): " + newBlock.toString());

      let ret = await this.addBlock(0, newBlock);
      console.log("ret in initialize() is: " + ret);
    }
  }

  // Add new block
  async addBlock(height, newBlock) {
    console.log("Trying to addBlock at height: " + height);
    return new Promise(async (resolve, reject) => {
      // Block height
      newBlock.height = height;
      // UTC timestamp
      newBlock.time = new Date().getTime().toString().slice(0, -3);
      // previous block hash
      console.log("In addBlock, this.height is: " + this.height);
      if (this.height >= 0) {
        let ht = 0;
        if (this.height == 0) {
          ht = this.height;
        }
        else {
          ht = this.height -1;
        }
        console.log("ht is: " + ht)
        //let prevBlock = await this.getBlock(this.height - 1);
        let prevBlock = await this.getBlock(ht);
        let prevHash = prevBlock.hash;
        newBlock.previousBlockHash = prevHash;
      }
      // Block hash with SHA256 using newBlock and converting to a string
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      // Adding block object to chain
      let add = await addLevelDBData(height, JSON.stringify(newBlock));
      //let ht = await getBlockchainHeightAsync();
      console.log("add is: " + add);
      this.height++;
      resolve(add);
    });
  }

  // Get block height
  async getBlockHeight() {
    let ret = await getBlockchainHeightAsync();
    return ret;
  }

  async getBlockHeightAsync() {
    let ret = await getBlockchainHeightAsync();
    return ret;
  }

  setBlockchainHeight(value) {
    this.height = value;
    return value;
  }

  // get block
  async getBlock(blockHeight) {
    let str = "";
    str = await getLevelDBData(blockHeight);
    let res = JSON.parse(str);
    //console.log("RAW res is: " + res);
    /*console.log("getBlock(" + blockHeight + ") is : \n"
               + "hash : " + res.hash + "\n"
               + "height : " + res.height + "\n"
               + "body : " + res.body + "\n"
               + "time : " + res.time + "\n"
               + "previousBlockHash : " + res.previousBlockHash);*/
    return res;
  }

  // validate block
  async validateBlock(blockHeight) {
    // get block object
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    //console.log("blockHash in validateBlock(" + blockHeight + ") is: " + blockHash);

    // for testing bad blocks START
    /*if(blockHeight%2 == 0)
    {
      block.data = "incorrect data";
    }*/
    // testing bad blocks END

    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      console.log("true");
      return true;
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  async validateChain() {
    let errorLog = [];
    let size = await this.getBlockHeight() - 1;
    console.log("size is " + size);
    for (var i = 0; i < size; i++) {
      // validate block
      let validCheck = await this.validateBlock(i);
      if (!validCheck) errorLog.push(i);
      // compare blocks hash link
      let block = await this.getBlock(i);
      let nextBlock = await this.getBlock(i + 1);
      let blockHash = block.hash;
      let previousHash = nextBlock.previousBlockHash;
      if (blockHash !== previousHash) {
        errorLog.push(i);
      }
      else {
        console.log("block # " + i + " looks good!");
      }
    }

    // validate the last block in the chain
    let res = await this.validateBlock(size);
    if (!res) {
      errorLog.push(size);
    } else {
      console.log("block # " + size + " looks good!");
    }

    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: ' + errorLog);
    } else {
      console.log('No errors detected');
    }
  }

}

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
  return new Promise(resolve => {
    db.put(key, value, function (err) {
      if (err) return console.log('Block ' + key + ' submission failed', err);
      resolve(value);
    })
  });
}

// Get data from levelDB with key
function getLevelDBData(key) {
  return new Promise(resolve => {
    db.get(key, function (err, value) {
      //if (err) return console.log('Not found!', err);
      if (err) {
        console.log('Not found!', err);
        resolve(-1);
      }
      resolve(value);
    })
  });
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
  return new Promise(resolve => {
    let i = 0;
    db.createReadStream().on('data', function (data) {
      i++;
    }).on('error', function (err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', function () {
      console.log('Block #' + i);
      addLevelDBData(i, value);
      resolve(i);
    });
  });
}

// Get data from levelDB with key
function getBlockchainHeightAsync() {
  return new Promise(resolve => {
    let i = 0;
    db.createReadStream().on('data', function (data) {
      var str = data.key;
      var temp1 = str.includes(TMP);
      var temp2 = str.includes(TMP2);
      if (!temp1 && !temp2) {
        i++; // only want to count keys that are "non-temp" keys
      }
    }).on('error', function (err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', function () {
      resolve(i);
    });
  });
}

// check to see if a temporary entry is still valid. remove if not
async function checkEntry(key) {
  let lEntry = await getLevelDBData(key);
  let lTimeStamp = new Date().getTime().toString().slice(0, -3);
  lEntry = JSON.parse(lEntry);

  let lTimeRemaining = lEntry.validationWindow - (lTimeStamp - lEntry.requestTimeStamp);
  console.log("key: " + key + ", timeRemaining : " + lTimeRemaining);

  if (lTimeRemaining < 0) {
    console.log("Need to delete this key: " + key);
    db.del(key, function (err) {
      if (err) {
        // handle I/O or other error
        console.log("There was an error removing key: " + key + " from the leveldb.");
        console.log("The error was: " + err);
      }
    });
  }
}

async function deleteEntry(key) {
  db.del(key, function (err) {
    if (err) {
      // handle I/O or other error
      console.log("There was an error removing key: " + key + " from the leveldb.");
      console.log("The error was: " + err);
    }
  });
}

module.exports.getLevel = getLevelDBData;
module.exports.Block = Block;
module.exports.bc = Blockchain;
module.exports.getHeight = getBlockchainHeightAsync;
module.exports.db = db;
module.exports.addTempLevel = addLevelDBData;
module.exports.checkEntry = checkEntry;
module.exports.deleteEntry = deleteEntry;
