
function SyslogParser()
{

}

var NILVALUE = '-';

/**
 * @return {RegExp}
 */
function createRegex()
{
    function capture() {
        var str = '';
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] === ' ') {
                str += arguments[i];
            } else {
                str += '(' + arguments[i] + ')';
            }
        }
        return str;
    }

    var DIGIT           = '[0-9]';
    var NONZERO_DIGIT   = '[1-9]';
    var PRINTUSASCII    = '[\x21-\x7E]';
    var SP              = ' ';
    var OCTET           = '[\x00-\xff]';
    var UTF_8_STRING    = OCTET + '*?';
    var BOM             = '\xef\xbb\xbf';
    var MSG_UTF8        = BOM + UTF_8_STRING;
    var MSG_ANY         = OCTET + '*';
    var MSG             = '(?:' + MSG_ANY + ')|(?:' + MSG_UTF8 + ')';
    var SD_NAME         = PRINTUSASCII + '{1,32}';
    var PARAM_VALUE     = UTF_8_STRING;
    var PARAM_NAME      = SD_NAME;
    var SD_ID           = SD_NAME;
    var SD_PARAM        = PARAM_NAME + '="' + PARAM_VALUE + '"';
    var SD_ELEMENT      = '\\[' + SD_ID + '(?:' + SP + SD_PARAM + '){0,}' + '\\]';
    var STRUCTURED_DATA = '(?:' + NILVALUE + ')' + '|' + '(?:' + '(?:' + SD_ELEMENT + ')' + '{1,}' + ')';


    var TIME_SECOND     = DIGIT + '{2}';
    var TIME_MINUTE     = DIGIT + '{2}';
    var TIME_HOUR       = DIGIT + '{2}';
    var TIME_NUMOFFSET  = '(?:\\+|-)' + TIME_HOUR + ':' + TIME_MINUTE;
    var TIME_OFFSET     = '(?:' + 'Z' + '|' + TIME_NUMOFFSET + ')';
    var TIME_SECFRAC    = '\\.[0-9]{1,6}';


    var PARTIAL_TIME    = TIME_HOUR + ':' + TIME_MINUTE + ':' + TIME_SECOND + '(?:' + TIME_SECFRAC + '){0,1}';
    var FULL_TIME       = PARTIAL_TIME + TIME_OFFSET;

    var DATE_MDAY       = DIGIT + '{2}';
    var DATE_MONTH      = DIGIT + '{2}';
    var DATE_FULLYEAR   = DIGIT + '{4}';
    var FULL_DATE       = DATE_FULLYEAR + '-' + DATE_MONTH + '-' + DATE_MDAY;
    var TIMESTAMP       = '(?:' + NILVALUE + ')' + '|' + '(?:' + FULL_DATE + 'T' + FULL_TIME +')';

    var MSGID           = '(?:' + NILVALUE + ')' + '|' + '(?:' + PRINTUSASCII + '){1,32}';
    var PROCID          = '(?:' + NILVALUE + ')' + '|' + '(?:' + PRINTUSASCII + '){1,128}';
    var APP_NAME        = '(?:' + NILVALUE + ')' + '|' + '(?:' + PRINTUSASCII + '){1,48}';

    var HOSTNAME        = '(?:' + NILVALUE + ')' + '|' + '(?:' + PRINTUSASCII + '){1,255}';
    var VERSION         = NONZERO_DIGIT + DIGIT + '{0,2}';
    var PRIVAL          = DIGIT + '{1,3}';
    var PRI             = '<' + PRIVAL + '>';

    var HEADER = capture(PRI, VERSION, SP, TIMESTAMP, SP, HOSTNAME, SP, APP_NAME, SP, PROCID, SP, MSGID);

    var SYSLOG_MSG = HEADER + capture(SP, STRUCTURED_DATA) +  '(?:' + SP + capture(MSG) + '){0,1}';

    return new RegExp(SYSLOG_MSG);
}

SyslogParser.prototype.regex = createRegex();

/**
 * Parse one line of syslog log
 *
 * @param {string} line
 * @returns {object}
 */
SyslogParser.prototype.parse = function(line)
{
    var matches = line.match(this.regex);

    if (matches.length === 0) {
        throw new Error('Malformed syslog message');
    }

    var result = matches.slice(1);

    var structured_datas;

    if (result[7] === NILVALUE) {
        structured_datas = null;
    } else {
        structured_datas = result[7].slice(1, -1);
        structured_datas = structured_datas.split('][');
    }

    return {
        header: {
            pri: result[0].slice(1, -1),
            version: result[1],
            timestamp: result[2],
            hostname: result[3] === NILVALUE ? null : result[3],
            app_name: result[4] === NILVALUE ? null : result[4],
            procid: result[5] === NILVALUE ? null : result[5],
            msgid: result[6] === NILVALUE ? null : result[6],
        },
        structured_data: structured_datas,
        msg: result[8] ? result[8] : null,
    };
};

module.exports = SyslogParser;
