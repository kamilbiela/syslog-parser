var SyslogParser = require('./../SyslogParser.js');
var Benchmark = require('benchmark');

var msg = '<165>1 2003-10-11T22:14:15.003Z mymachine.example.com evntslog - - [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][examplePriority@32473 class="high"]';
var syslogParser = new SyslogParser();
var suite = new Benchmark.Suite;

suite.add('syslogParser#parse', function() {
    syslogParser.parse(msg);
}).on('cycle', function(event) {
    console.log(String(event.target));
}).on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
}).run();