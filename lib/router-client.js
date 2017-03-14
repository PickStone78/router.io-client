"use strict";

const $ = require("jquery");
const EventEmitter = require('events');

class Channel extends EventEmitter {
  constructor(url, name) {
    super();
    this.url = url;
    this.name = name;
  }

  push(message) {
    const channel = this;
    return new Promise(function (resolve, reject) {
      $.ajax({
	url: channel.url + "/push",
	type: "POST",
	contentType: "application/json",
	data: JSON.stringify({channel: channel.name, message: message}),
	dataType: "json",
	timeout: 5000,
        success: function(data) {
          channel.emit('done', data.channel);
          resolve(data.channel);
        },
        error: function(jqXHR, exception) {
          channel.emit('error', exception);
          reject(exception);
        }
      });
    });
  }

  fetch() {
    const channel = this;
    return new Promise(function (resolve, reject) {
      $.ajax({
	url: channel.url + "/fetch",
	type: "POST",
	contentType: "application/json",
	data: JSON.stringify({channel: channel.name}),
	dataType: "json",
	timeout: 5000,
        success: function(data) {
          channel.emit('done', data.message);
          resolve(data.message);
        },
        error: function(jqXHR, exception) {
          channel.emit('error', exception);
          reject(exception);
        }
      });
    });
  }

  bind(callback) {
    const channel = this;
    var polling = function (name) {
      $.ajax({
	url: channel.url + "/fetch",
	type: "POST",
	contentType: "application/json",
	data: JSON.stringify({channel: name}),
	dataType: "json",
	timeout: 5000,
        success: function(data) {
          callback(data.message);
          polling(name);
        },
        error: function(jqXHR, exception) {
          polling(name);
        }
      });
    };
    polling(channel.name);
  }
}

class Router extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
  }

  publish(exchange) {
    const router = this;
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: router.url + "/publish",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({exchange: exchange}),
        dataType: "json",
        timeout: 5000,
        success: function(data) {
          var channel = new Channel(router.url, data.channel);
          router.emit('connection', channel);
          resolve(channel);
        },
        error: function(jqXHR, exception) {
          router.emit('error', exception);
          reject(exception);
        }
      });
    });
  }

  subscribe(exchange, callback) {
    const router = this;
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: router.url + "/subscribe",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({exchange: exchange}),
        dataType: "json",
        timeout: 5000,
        success: function(data) {
          var channel = new Channel(router.url, data.channel);
          if (callback != null) {
            channel.bind(callback);
          }
          router.emit('connection', channel);
          resolve(channel);
        },
        error: function(jqXHR, exception) {
          router.emit('error', exception);
          reject(exception);
        }
      });
    });
  }
}

module.exports = function (url) {
  return new Router(url);
};
