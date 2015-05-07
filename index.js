var native_qs = require("querystring");
var _ = require('lodash');

module.exports = function(query) {
  if( ! query ) return {};
  if( typeof query == 'string' ) {
    if( ! query.match(/\[\w*\]/) ) return native_qs.parse(query);
    query = native_qs.parse(query);
  }
  return parse( query )
}

function parse( query ){
  var dirty = false;
  for( var key in query ) {
    var value = query[key];
    if( matches = key.match(/^([\w\[\]]+)(\[\w*\])$/) ){
      var parent = matches[1];
      var child = matches[2];
      if( child.match(/^\[\s*\]$/) ) {
        if( value instanceof Array ) query[parent] = value
        else query[parent] = [value]
      } else {
        if( !(query[parent] instanceof Object) ) query[parent] = {};
        child = child.replace(/[\[\] ]/g, "");
        query[parent][child] = value
      }
      delete query[key]
      dirty = true
    }
  }
  return dirty ? parse(query) : query
}

module.exports.stringify = function(obj) {
  if (_.isObject(obj) && !_.isArray(obj)) {
    var result = [];
    _.each(obj, function(val, key){
      if (_.isArray(val)) {
        result.push(stringifyArray(key, val));
      } else if (_.isObject(val)) {
        result.push(stringifyObject(key, val));
      } else {
        result.push(key+'='+val);
      }
    });
    return result.join('&');
  } else {
    throw new Error('Invalid Object Format');
    return ;
  }
}

function stringifyObject (key, obj) {
  var result = [];
  _.each(obj, function(val, key2){
    key2 = key+'['+key2+']';
    if (_.isArray(val)) {
      result.push(stringifyArray(key2, val));
    } else if (_.isObject(val)) {
      result.push(stringifyObject(key2, val));
    } else {
      result.push(key2+'='+val);
    }
  });
  return result.join('&');
}

function stringifyArray (key, obj) {
  var result = [];
  _.each(obj, function(val){
    if (_.isObject(val)) {
      // not allow any object in an array
      throw new Error('Not Allow Any Object In An Array:'+key+'='+JSON.stringify(obj));
    } else {
      result.push(key+'[]=' + val);
    }
  });
  return result.join('&');
}
