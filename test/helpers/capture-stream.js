module.exports = function captureStream(stream){
  var oldWrite = stream.write;
  var buf = '';
  stream.write = function(chunk, encoding, callback){
    buf += chunk.toString();
    oldWrite.apply(stream, arguments);
  };

  return {
    release: function release(){
     stream.write = oldWrite;
    },
    captured: function(){
      return buf;
    }
  };
};
