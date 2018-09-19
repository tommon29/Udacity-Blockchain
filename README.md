# Tom Boutin - Project 4

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. This project was built using the express framework and has two endpoints which are described below.

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

- Install express using the instructions found [here](http://expressjs.com/en/starter/installing.html)


## Testing

There are two configured endpoints which are simply one GET endpoint and one POST endpoint. To test both of these endpoints, you must run the following command in the directory where you installed express and your node modules:

```
node index.js
```

### GET endpoint

To test this endpoint simply enter the following into the url field of your browser:

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


### POST endpoint

POST Block endpoint using key/value pair within request body.
Path http://localhost:8000/block

Returns the block contents POST request with block contents in JSON format

Example: POST request for a new block

POST URL path: http://localhost:8000/block
Content-Type: application/json
Request body: {"body":"block body contents"}

The above blocks (from the GET endpoint section) were added to the chain with the following commands:

- curl -X "POST" "http://localhost:8000/block" -H 'Content-Type: application/json' -d $'{"body":"adding a new block"}'
- curl -X "POST" "http://localhost:8000/block" -H 'Content-Type: application/json' -d $'{"body":"adding another new block"}'
