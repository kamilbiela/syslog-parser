var SyslogParser = require('../SyslogParser.js');

var fixtures = [
    {
        line: "<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM'su root' failed for lonvick on /dev/pts/8",
        result: {
            header: {
                pri: '34',
                version: '1',
                timestamp: '2003-10-11T22:14:15.003Z',
                hostname: 'mymachine.example.com',
                app_name: 'su',
                procid: null,
                msgid: 'ID47'
            },
            structured_data: null,
            msg: "BOM'su root' failed for lonvick on /dev/pts/8"
        }
    },
    {
        line: "<165>1 2003-08-24T05:14:15.000003-07:00 192.0.2.1 myproc 8710 - - %% It\'s time to make the do-nuts.",
        result: {
            header: {
                pri: '165',
                version: '1',
                timestamp: '2003-08-24T05:14:15.000003-07:00',
                hostname: '192.0.2.1',
                app_name: 'myproc',
                procid: '8710',
                msgid: null
            },
            structured_data: null,
            msg: "%% It\'s time to make the do-nuts."
        }
    },
    {
        line: '<165>1 2003-10-11T22:14:15.003Z mymachine.example.com evntslog - - [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][examplePriority@32473 class="high"]',
        result: {
            header: {
                pri: '165',
                version: '1',
                timestamp: '2003-10-11T22:14:15.003Z',
                hostname: 'mymachine.example.com',
                app_name: 'evntslog',
                procid: null,
                msgid: null
            },
            structured_data: ['exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"', 'examplePriority@32473 class="high"'],
            msg: null
        }
    },
    {
        line: '<165>1 2003-10-11T22:14:15.003Z mymachine.example.com evntslog - ID47 [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"] BOMAn application event log entry...',
        result: {
            header: {
                pri: '165',
                version: '1',
                timestamp: '2003-10-11T22:14:15.003Z',
                hostname: 'mymachine.example.com',
                app_name: 'evntslog',
                procid: null,
                msgid: 'ID47'
            },
            structured_data: ['exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"'],
            msg: 'BOMAn application event log entry...'
        }
    },
    {
        line: '<165>1 2003-10-11T22:14:15.003Z local.tld evntslog - ID47 ' +
            '[exampleSDID@32473 iut="3" eventSource="Application" test="escaped chars\\]\\[" eventID="1011"]' +
            ' test some message ][ [ewq="qwe"]',
        result: {
            header: {
                pri: '165',
                version: '1',
                timestamp: '2003-10-11T22:14:15.003Z',
                hostname: 'local.tld',
                app_name: 'evntslog',
                procid: null,
                msgid: 'ID47'
            },
            structured_data: ['exampleSDID@32473 iut="3" eventSource="Application" test="escaped chars\\]\\[" eventID="1011"'],
            msg: 'test some message ][ [ewq="qwe"]'
        }
    },
];

module.exports = {
    parse: function (test) {
        var syslogParser = new SyslogParser();

        fixtures.forEach(function (fixture) {
            var result = syslogParser.parse(fixture.line);
            test.deepEqual(result, fixture.result);
        });

        test.done();
    }
};


