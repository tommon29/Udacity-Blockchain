class Star {
    constructor(aRa, aDec, aMag, aConst, aStory, aStoryDec) {
        this.ra = aRa,
            this.dec = aDec,
            this.magnitude = aMag, // optional
            this.constellation = aConst, // optional
            this.story = aStory,
            this.storyDecoded = aStoryDec
    }
    
    toString() {
        var str = "\n";
        if (this.ra) { str += "ra = " + this.ra + '\n';}
        if (this.dec) { str += "dec = " + this.dec + '\n';}
        if (this.magnitude) { str += "magnitude = " + this.magnitude + '\n';}
        if (this.constellation) { str += "constellation = " + this.constellation + '\n';}
        if (this.story) { str += "story = " + this.story + '\n';}
        if (this.storyEncoded) { str += "storyEncoded = " + this.storyEncoded + '\n';}

        return str;
    }

    /*
    const myString = "This is my string to be encoded/decoded";
    const encoded = new Buffer(myString).toString('hex'); // encoded === 54686973206973206d7920737472696e6720746f20626520656e636f6465642f6465636f646564
    const decoded = new Buffer(encoded, 'hex').toString(); // decoded === "This is my string to be encoded/decoded"
    */

}

async function createStar(aStarData) {
    
    // required star parameters
    let ra = aStarData.ra;
    let dec = aStarData.dec;
    let story = aStarData.story;
    let storyEncoded = new Buffer(story).toString('hex');

    // optional star parameters
    let mag = aStarData.magnitude;
    let constellation = aStarData.constellation;

    let lStar = new Star(ra, dec, mag, constellation, storyEncoded, story);

    if (!lStar.magnitude) {
        delete lStar.magnitude;
    }

    if (!lStar.constellation) {
        delete lStar.constellation;
    }
    
    //console.log("star is: " + lStar.toString());

    return lStar;
}

async function checkStarData(aStarData) {

    // required star parameters
    let ra = aStarData.ra;
    let dec = aStarData.dec;
    let story = aStarData.story;
    let storyDecoded = new Buffer(story).toString('hex'); // decode the story

    // optional star parameters
    let mag = aStarData.magnitude;
    let constellation = aStarData.constellation;

    if (!ra) {
        return false;
    }

    if (!dec) {
        return false;
    }

    if (!story) {
        return false;
    }

    // need to check the size of the story
    let len = Buffer.byteLength(story, 'utf8');
    if (len > 500) {
        console.log("Story is too long. Max length for story is 500 bytes. Yours was " + len + " bytes");
        return false;
    }

    return true;
}

module.exports.Star = Star;
module.exports.createStar = createStar;
module.exports.checkStarData = checkStarData;