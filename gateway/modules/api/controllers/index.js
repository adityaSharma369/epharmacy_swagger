const APIController = () => {

    function ping(req, res, next) {
        res.status(200).send("PONG")
    }

    return {ping};
}

module.exports = APIController;
