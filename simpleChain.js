/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
let level = require('level');
let chainDB = './chaindata';
let db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
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
    let blockheight = await this.getBlockHeightAsync();
    this.height = blockheight;
    // if no height, then create genesis block
    if (blockheight == 0) {
      this.addBlock(new Block("First block in the chain - Genesis block"));
    }
  }

  // Add new block
  async addBlock(newBlock) {
    // Block height
    newBlock.height = this.height;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    // previous block hash
    if (this.height > 0) {
      let prevBlock = await this.getBlock(this.height - 1);
      let prevHash = prevBlock.hash;
      newBlock.previousBlockHash = prevHash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    let add = await addDataToLevelDB(JSON.stringify(newBlock));
    let ht = await getBlockchainHeightAsync();
    this.height = ht;
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
  db.put(key, value, function (err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
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
      i++;
    }).on('error', function (err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', function () {
      resolve(i);
    });
  });
}

module.exports.getLevel = getLevelDBData;
module.exports.Block = Block;
module.exports.bc = Blockchain;
module.exports.getHeight = getBlockchainHeightAsync;
