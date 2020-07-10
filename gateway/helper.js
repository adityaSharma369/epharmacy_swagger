let helpers = {
    gatewayResponse: function (req, res, next) {

        try {
            res.err = function (RES) {
                if (RES instanceof Error) {
                    console.log(RES);
                    res.respond({
                        error: RES.toString(),
                        http_code: 501
                    });
                } else {
                    if (RES) {
                        RES['http_code'] = (RES['http_code']) ? RES['http_code'] : 500;
                    } else {
                        RES = {
                            'http_code': 500
                        };
                    }
                    return res.respond(RES);
                }
            };

            res.respond = function (RES) {

                RES.http_code = (RES.http_code) ? RES.http_code : 200;

                let response = {
                    msg: RES.msg,
                    error: RES.error,
                    data: RES.data,
                    errors: RES.errors,
                    exception: RES.ex,
                    err_code: RES.err_code
                };

                if (RES.http_code < 300) {
                    response.success = true;
                } else {
                    response.success = false;
                }

                return res.status(RES.http_code)
                    .send(response);
            };

            next();
        } catch (e) {
            console.log(e);
            return res.replyBack({
                http_code: 500,
                error: 'exception thrown'
            });
        }
    }
}

module.exports = helpers;