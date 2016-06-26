'use strict';

var test = require('tape');
var CleanWebpackPlugin = require('../index');

test('the plugin exists', function(t) {
  t.ok(CleanWebpackPlugin);
  t.end();
});

test('the plugin has an apply function on its prototype', function(t) {
  t.ok(typeof CleanWebpackPlugin.prototype.apply === 'function');
  t.end();
});
