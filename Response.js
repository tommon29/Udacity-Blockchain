class Response {
    constructor(aAddr, aTime, aMess, aValWin) {
        this.address = aAddr,
            this.requestTimeStamp = aTime,
            this.message = aMess,
            this.validationWindow = aValWin
    }

    toString() {
        let str = "\n";
        str += "address = " + this.address + '\n';
        str += "requestTimeStamp = " + this.requestTimeStamp + '\n';
        str += "message = " + this.message + '\n';
        str += "validationWindow = " + this.validationWindow + '\n';

        return str;
    }

}

module.exports.Response = Response;