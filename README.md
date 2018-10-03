# Tom Boutin - Project 4

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. This project was built using the express framework and has endpoints which are described below. Use the quickstart section for an already "set up" workspace.

## Quickstart (just run these)

```
npm init
npm install crypto-js --save
npm install level --save
npm install express --save
npm install body-parser --save
npm install bitcoinjs-lib --save
npm install bitcoinjs-message --save

node index.js

curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "<Your wallet address goes here>"
}'
```
Then you will need to sign the message that the previous command returned. ONLY sign the "message" part of the return JSON.
```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "<Your wallet address goes here>",
  "signature": "<The signature from signing the previous message goes here>"
}'
```
Now you can register a star. Use the following command:
```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "<Your wallet address goes here>",
  "star": {
    "dec": "-04° 03'\'' 29",
    "ra": "12h 37m 40s",
    "story": "This is an example star story."
  }
}'
```

## More Details
### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```

- Install express (more instructions found [here](http://expressjs.com/en/starter/installing.html))
```
npm install express --save
```
- Install body-parser
```
npm install body-parser --save
```

- Install bitcoin libraries
```
npm install bitcoinjs-lib --save
npm install bitcoinjs-message --save
```

## Testing

There are configured endpoints which are described below. To test these endpoints, you must run the following command in the directory where you installed express and your node modules:

```
node index.js
```

## GET endpoints

To test these endpoints simply enter the following into the url field of your browser:

### GET block
http://localhost:8000/block/{BLOCK_HEIGHT}
where {BLOCK_HEIGHT} is an integer of the block you would like returned

Returns a JSON formatted output for block contents at BLOCK_HEIGHT in the chain.

Examples
http://localhost:8000/block/1
http://localhost:8000/block/2

Return:
**(these are examples and your blocks will be different depending on the data you are adding to your local blockchain)**
- {"hash":"0ea80a185e1b3736b0494e97eaf39b3128dc426fb470a410c93b0ff9dcb66913","height":1,"body":"adding a new block","time":"1535650034","previousBlockHash":"69edd73c39b7ab1c147f448ae23addda6258cfc3638b0e876568bd6d3289ddd9"}

- {"hash":"44470799ceb7fc858413bc2bfaeb84ef123fdcf022b07cb0e944983147d2a084","height":2,"body":"adding another new block","time":"1535650040","previousBlockHash":"0ea80a185e1b3736b0494e97eaf39b3128dc426fb470a410c93b0ff9dcb66913"}

### GET address
http://localhost:8000/stars/address:{ADDRESS}
where {ADDRESS} is the address of the blocks you would like returned

Returns a JSON formatted output with contents of all blocks with address {ADDRESS} in the chain.
Example (your results will vary)
http://localhost:8000/stars/address:13BbuGVFQdhgRMqhUhLSwrEqULSYqHJdaa
- [{"hash":"b930d5c8f0177e81d22b6a962a4659f4a09ad3a4b2afb46f8abcf3efb4b3fae1","height":0,"body":{"address":"13BbuGVFQdhgRMqhUhLSwrEqULSYqHJdaa","star":{"ra":"12h 37m 40s","dec":"-04? 03' 29","story":"536f6c20616b61206f75722053756e20697320746865206669727374207374617220696e206f757220626c6f636b636861696e","storyDecoded":"Sol aka our Sun is the first star in our blockchain"}},"time":"1538597144","previousBlockHash":""},{"hash":"a079d586677db3eb64b61060ddabe73367b17458de4c4af58a3fa92cfc34d04e","height":1,"body":{"address":"13BbuGVFQdhgRMqhUhLSwrEqULSYqHJdaa","star":{"ra":"12h 37m 40s","dec":"-04? 03' 29","story":"4d4f4f4e2069727374207374617220696e206f757220626c6f636b636861696e","storyDecoded":"MOON irst star in our blockchain"}},"time":"1538597269","previousBlockHash":"b930d5c8f0177e81d22b6a962a4659f4a09ad3a4b2afb46f8abcf3efb4b3fae1"},{"hash":"e8dd37206a954bfa401660bb2576b94b031df62ce032821ceaa54e6e375da64e","height":2,"body":{"address":"13BbuGVFQdhgRMqhUhLSwrEqULSYqHJdaa","star":{"ra":"12h 37m 40s","dec":"-04? 03' 29","story":"4d4f4f4e2069727374207374617220696e206f757220626c6f636b636861696e","storyDecoded":"MOON irst star in our blockchain"}},"time":"1538597570","previousBlockHash":"a079d586677db3eb64b61060ddabe73367b17458de4c4af58a3fa92cfc34d04e"},{"hash":"b3975aa1fa4e37d08a64614404226212eb6fefccc57ad53f168a8a09a5bbd6c5","height":3,"body":{"address":"13BbuGVFQdhgRMqhUhLSwrEqULSYqHJdaa","star":{"ra":"12h 37m 40s","dec":"-04? 03' 29","story":"4d4f4f4e2069727374207374617220696e206f757220626c6f636b636861696e","storyDecoded":"MOON irst star in our blockchain"}},"time":"1538597666","previousBlockHash":"e8dd37206a954bfa401660bb2576b94b031df62ce032821ceaa54e6e375da64e"}]

### GET hash
http://localhost:8000/stars/hash:[HASH]
where [HASH] is the hash of the block you would like returned
Returns a JSON formatted output for block contents of block with hash HASH in the chain.
Example
http://localhost:8000/stars/hash:a079d586677db3eb64b61060ddabe73367b17458de4c4af58a3fa92cfc34d04e
- {"hash":"a079d586677db3eb64b61060ddabe73367b17458de4c4af58a3fa92cfc34d04e","height":1,"body":{"address":"13BbuGVFQdhgRMqhUhLSwrEqULSYqHJdaa","star":{"ra":"12h 37m 40s","dec":"-04? 03' 29","story":"4d4f4f4e2069727374207374617220696e206f757220626c6f636b636861696e","storyDecoded":"MOON irst star in our blockchain"}},"time":"1538597269","previousBlockHash":"b930d5c8f0177e81d22b6a962a4659f4a09ad3a4b2afb46f8abcf3efb4b3fae1"}

### GET printDB

Returns a list of all the keys in the levelDB. Good for debugging.
http://localhost:8000/printDB

### GET cleanOldRequests

Cleans out the leveldb by finding any requestValidations that are older than five minutes old and removes them from the leveldb.

## POST endpoints
### POST block (aka star)
POST Block endpoint using key/value pair within request body.
Path http://localhost:8000/block

Adds a star to the registry if the star is formatted properly, and the user has validated their address already (see message validation below).

Example: POST request for a new block
```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```
Example JSON response
```
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

### POST requestValidation
This is the entry point for a user to start the star registration process.
Path http://localhost:8000/requestValidation

Example
```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}'
```
Example JSON response
```
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "requestTimeStamp": "1532296090",
  "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
  "validationWindow": 300
}
```

### POST message-signature
This is the address validation endpoint so that a user can prove that they own an address before using it to add an entry to the star registry.
Path http://localhost:8000/message-signature/validate

Example
```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}'
```
Example JSON response
```
{
  "registerStar": true,
  "status": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 193,
    "messageSignature": "valid"
  }
}
```