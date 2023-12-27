'use strict';
var util = require('util');
const moment = require('moment-timezone');
const apiService = require('./sfmc-api-service');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');
const { decode } = require('punycode');

let useDEColumnForWaitTime = false;

exports.logExecuteData = [];

function logData(req) {
   // logger.info('logData hit', req);
    /* exports.logExecuteData.push({
         body: req.body,
         headers: req.headers,
         trailers: req.trailers,
         method: req.method,
         url: req.url,
         params: req.params,
         query: req.query,
         route: req.route,
         cookies: req.cookies,
         ip: req.ip,
         path: req.path,
         host: req.hostname,
         fresh: req.fresh,
         stale: req.stale,
         protocol: req.protocol,
         secure: req.secure,
         originalUrl: req.originalUrl
     });
     logger.info("body: " + util.inspect(req.body));
     logger.info("headers: " + req.headers);
     logger.info("trailers: " + req.trailers);
     logger.info("method: " + req.method);
     logger.info("url: " + req.url);
     logger.info("params: " + util.inspect(req.params));
     logger.info("query: " + util.inspect(req.query));
     logger.info("route: " + req.route);
     logger.info("cookies: " + req.cookies);
     logger.info("ip: " + req.ip);
     logger.info("path: " + req.path);
     logger.info("host: " + req.hostname);
     logger.info("fresh: " + req.fresh);
     logger.info("stale: " + req.stale);
     logger.info("protocol: " + req.protocol);
     logger.info("secure: " + req.secure);
     logger.info("originalUrl: " + req.originalUrl);*/
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //logger.info( req.body );
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    //logger.info('Save function API hit', req);
    // Data from the req and put it in an array accessible to the main app.
    //logger.info( req.body );
    logData(req);

    // const dt = moment(new Date());
    // logger.info({dt: dt.toString()});
    // dt.tz('America/New_York');
    // logger.info({dt: dt.toString()});

    // apiService.exitContact('Testing custom activity N v2', 'johna@gmail.com');

    res.status(200).send('Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {

    function checkCondition(da, inArgs){
        console.log("check Condtition value", da)
        switch (da.operator) {
                   case "eq":
                       return inArgs[da.property] === da.operand;
                   case "ne":
                       return inArgs[da.property] !== da.operand;
                   case "lt":
                       return inArgs[da.property] < da.operand;
                   case "le":
                       return inArgs[da.property] <= da.operand;
                   case "gt":
                       return inArgs[da.property] > da.operand;
                   case "ge":
                       return inArgs[da.property] >= da.operand;
                   default:
                       return false;
                   
               }
               
        
    }
    function calculateLogicalValue(uc, inArgs){
          const eachConditionResults= [];
          for(let i=0;i<uc.dynamicAttributes.length;i++){
              let da = uc.dynamicAttributes[i];
              if(da.logicalOp ){
                //   console.log("qqqqqqqqqqq")
                 eachConditionResults.push(calculateLogicalValue(da, inArgs));
               }else{
                 eachConditionResults.push(checkCondition(da, inArgs));
               /* TODO: lt gt operator to be used only for int types */
               }
          }
         
   
           console.log("show executed operator values", eachConditionResults);
               let isAnd = uc.logicalOp === 'and';
               //console.log("execute function uc.dynamicAttribute.dynamicAttributes.logicalOp === 'and'", uc.dynamicAttributes.logicalOp,uc.dynamicAttributes === 'and');
              // console.log("isAnd values",uc, {isAnd: isAnd});
               const dgConditionMatches = eachConditionResults.reduce((acc, curr) => isAnd ? acc && curr : acc || curr);
              // console.log("conditions values and output values",{bools: eachConditionResults, out: dgConditionMatches});
   
               return dgConditionMatches;
       }
       

    function computeWaitTime(decoded) {
        logger.info('Computing wait time... decoded', decoded);
        let date;
        const inArgs = decoded.inArguments[0] || {};
        logger.info('Computing wait time... inArgs', inArgs);
        for (let uc of (inArgs.userConfig || [])) {
            // logger.info("execute function uc.dynamicAttributes", uc.dynamicAttributes);
            // const eachConditionResults = (uc.dynamicAttributes.dynamicAttributes || []).map(da => {
            //     logger.info("condtions which are getting checked",{da})
            //     if(da.logicalOp ){
            //         const decoded = {}
            //         computeWaitTime(da)
            //     }else{

            //     /* TODO: lt gt operator to be used only for int types */
            //     switch (da.operator) {
            //         case "eq":
            //             return inArgs[da.property] === da.operand;
            //         case "ne":
            //             return inArgs[da.property] !== da.operand;
            //         case "lt":
            //             return inArgs[da.property] < da.operand;
            //         case "le":
            //             return inArgs[da.property] <= da.operand;
            //         case "gt":
            //             return inArgs[da.property] > da.operand;
            //         case "ge":
            //             return inArgs[da.property] >= da.operand;
            //         default:
            //             return false;
            //     }
            // }
            // });

            // logger.info("show executed operator values", eachConditionResults);
            // let isAnd = uc.dynamicAttributes.logicalOp === 'and';
            // logger.info("execute function uc.dynamicAttribute.dynamicAttributes.logicalOp === 'and'", uc.dynamicAttributes.logicalOp,uc.dynamicAttributes === 'and');
            // logger.info("isAnd values",{isAnd: isAnd});
            // const dgConditionMatches = eachConditionResults.reduce((acc, curr) => isAnd ? acc && curr : acc || curr);
            // logger.info("conditions values and output values",{bools: eachConditionResults, out: dgConditionMatches});


            const dgConditionMatches= calculateLogicalValue(uc.dynamicAttributes, inArgs);
            /* dynamic attributes matches the specified condition for the Journey data */
            if (dgConditionMatches) {
                let dateAttribute = uc.dateAttribute;
                const dateStr = inArgs[dateAttribute.property]; // eg. 10/4/2023 12:00:00 AM
                logger.info({dateStr, dateAttributeF: dateAttribute})
                date = moment.tz(dateStr, 'M/D/YYYY hh:mm:ss A', dateAttribute.timeZone);
                logger.info('Moment datetime: ', {date, str: date.toString()});

                switch (dateAttribute.timeline) {
                    case 'On':
                        break;

                    case 'Before':
                        date.subtract(dateAttribute.duration, dateAttribute.unit);
                        break;

                    case 'After':
                        date.add(dateAttribute.duration, dateAttribute.unit);
                }
                logger.info('date after logic: ', date.toString());

                /* if extend is chosen */
                if (dateAttribute.extendWait) {
                    logger.info("extend time logic....")
                    const dtStr = moment(date).format('M/D/YYYY') + ' ' + dateAttribute.extendTime;
                    logger.info("extend time logic: Current date with extended time str = ", dtStr);
                    const extendedDate = moment.tz(dtStr, 'M/D/YYYY hh:mm:ss A', dateAttribute.timeZone);
                    logger.info("extend time logic: Current date with extended time moment = ", extendedDate);

                    logger.info("extendedDate.isBefore(date) ? ", extendedDate.isBefore(date));
                    logger.info("extendedDate.isAfter(date) ? ", extendedDate.isAfter(date));
                    if (extendedDate.isAfter(date)) {
                        date = extendedDate;
                    }
                    logger.info('date after extend logic: ', date.toString());
                }

                /* breaking as the first matched condition is taken and rest are ignored */
                break;
            }
        }// loop ends
        logger.info('Wait time computed: ', {date});
        if (date) {
            date.tz('America/New_York');
            logger.info('Final wait time computed after tz change: ', {date});
            logger.info('Final wait time computed formatted in tz: ', {formatted: date.format('M/D/YYYY hh:mm:ss A')});
            return date.format('M/D/YYYY hh:mm:ss A');
        } else {
            return date;
        }
    }

    JWT(req.body, process.env.jwtSecret, (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        function postToPipeDream(waitTime) {
            var request = require('request');
            var url = 'https://eovh1wtxwmjdfw3.m.pipedream.net';
            request({
                url: url,
                method: "POST",
                json: {
                    inArg: decoded.inArguments[0],
                    computedWait: waitTime,
                    decoded: decoded
                },
            }, function (error, response, body) {
                if (!error) {
                    logger.info('Response of PipeDream: ', body);
                }
            });
        }
        logger.info("execute jwt decode data", decoded);
        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            const decodedArgs = decoded.inArguments[0];

            logger.info("execute function decodedArgs", decodedArgs);
            /* determine the wait date time */

            const waitTime = computeWaitTime(decoded);

            let path;
            if (waitTime) {
                path = 'wait_path';
                logger.info('Path selected: ', path);
                const responseObject = {"waitTime": waitTime};
                logger.info('Response object to JB: ', responseObject);
                res.status(200).json(responseObject);

            } else {
                path = 'reminder_path';
                logger.info('Path selected: ', path);
                apiService.exitContact(decodedArgs.activityInfo.journeyName, decoded.keyValue)
                    .then(res => {
                        logger.info('Contact exited successfully');
                        res.status(500).json({});
                    }).catch(e => {
                    logger.info('Error in exiting the contact.');
                });
            }

            if (waitTime && useDEColumnForWaitTime) {
                logger.info('Saving wait time...');
                apiService.saveWaitTime(waitTime, decoded)
                    .then(resp => {
                        // postToPipeDream(waitTime);
                    }).catch(err => {
                    console.error('Error in execute method: ', err);
                    return res.status(500).end();
                });
            } else {
                // postToPipeDream(waitTime);
            }

        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //logger.info( req.body );
    logData(req);
    res.send(200, '{"Success":true}');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //logger.info( req.body );
    logData(req);
    res.send(200, {"success": true});
};

exports.createColumn = async function (req, res) {
    logger.info('Create a DE column req: ', req.body);
    const body = req.body;
    const fieldName = body.fieldName;
    const deName = body.deName;
    logger.info('Create a DE column inputs: ', {fieldName, deName});
    if (!fieldName || !deName) {
        res.status(400).send('Bad request');
    }
    try {
        await apiService.createColumn(fieldName, deName);
        logger.info('Column created');
        res.status(200).send();
    } catch (err) {
        logger.info('Error when creating a Column');
        res.status(500).send();
    }
};
