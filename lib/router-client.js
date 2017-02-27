"use strict";

const $ = require("jquery");
const EventEmitter = require('events');

class Channel extends EventEmitter {
  constructor(url, promise) {
    super();
    this.url = url;
    this.promise = promise;
  }

  push(message) {
    const channel = this;
    return channel.promise.then(function (value) {
      $.ajax({
	url: channel.url + "/push",
	type: "POST",
	contentType: "application/json",
	data: JSON.stringify({channel: value.channel, message: message}),
	dataType: "json",
	timeout: 5000,
        success: function(data) {
          channel.emit('push', data);
        },
        error: function(jqXHR, exception) {
          throw(exception);
        }
      });
    });
  }

  fetch() {
    const channel = this;
    return channel.promise.then(function (value) {
      $.ajax({
	url: channel.url + "/fetch",
	type: "POST",
	contentType: "application/json",
	data: JSON.stringify({channel: value.channel}),
	dataType: "json",
	timeout: 5000,
        success: function(data) {
          channel.emit('fetch', data.message);
        },
        error: function(jqXHR, exception) {
          throw(exception);
        }
      });
    });
  }

  bind(callback) {
    const channel = this;
    var polling = function (channelName) {
      $.ajax({
	url: channel.url + "/fetch",
	type: "POST",
	contentType: "application/json",
	data: JSON.stringify({channel: channelName}),
	dataType: "json",
	timeout: 5000,
        success: function(data) {
          callback(data.message);
          polling(channelName);
        },
        error: function(jqXHR, exception) {
          polling(channelName);
        }
      });
    };
    return channel.promise.then(function (value) {
      polling(value.channel);
    });
  }
}

class Router extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
  }

  publish(exchange) {
    const router = this;
    var promise = new Promise(function (resolve, reject) {
      $.ajax({
        url: router.url + "/publish",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({exchange: exchange}),
        dataType: "json",
        timeout: 5000,
        success: function(data) {
          router.emit('publish', data.channel);
          resolve(data);
        },
        error: function(jqXHR, exception) {
          reject(exception);
        }
      });
    });
    var channel = new Channel(router.url, promise);
    return channel;
  }

  subscribe(exchange, callback) {
    const router = this;
    var promise = new Promise(function (resolve, reject) {
      $.ajax({
        url: router.url + "/subscribe",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({exchange: exchange}),
        dataType: "json",
        timeout: 5000,
        success: function(data) {
          router.emit('subscribe', data.channel);
          resolve(data);
        },
        error: function(jqXHR, exception) {
          reject(exception);
        }
      });
    });
    var channel = new Channel(router.url, promise);
    if (callback != null) {
      channel.bind(callback);
    }
    return channel;
  }
}

module.exports = function (url) {
  return new Router(url);
};
