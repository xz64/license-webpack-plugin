var FakeRawSource = require('./FakeRawSource');

function FakeConcatSource() {
  this.text = [].slice
    .call(arguments)
    .map(function(arg) {
      return arg instanceof FakeRawSource ? arg.text : arg;
    })
    .join('');
}

module.exports = FakeConcatSource;
