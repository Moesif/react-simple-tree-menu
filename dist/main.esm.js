import React from 'react';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var tinyDebounce = function debounce (fn, delay) {
  var timeoutID = null;
  return function () {
    clearTimeout(timeoutID);
    var args = arguments;
    var that = this;
    timeoutID = setTimeout(function () {
      fn.apply(that, args);
    }, delay);
  }
};

/**
 * Has own property.
 *
 * @type {Function}
 */

var has = Object.prototype.hasOwnProperty;

/**
 * To string.
 *
 * @type {Function}
 */

var toString = Object.prototype.toString;

/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty(val) {
  // Null and Undefined...
  if (val == null) return true

  // Booleans...
  if ('boolean' == typeof val) return false

  // Numbers...
  if ('number' == typeof val) return val === 0

  // Strings...
  if ('string' == typeof val) return val.length === 0

  // Functions...
  if ('function' == typeof val) return val.length === 0

  // Arrays...
  if (Array.isArray(val)) return val.length === 0

  // Errors...
  if (val instanceof Error) return val.message === ''

  // Objects...
  if (val.toString == toString) {
    switch (val.toString()) {

      // Maps, Sets, Files and Errors...
      case '[object File]':
      case '[object Map]':
      case '[object Set]': {
        return val.size === 0
      }

      // Plain objects...
      case '[object Object]': {
        for (var key in val) {
          if (has.call(val, key)) return false
        }

        return true
      }
    }
  }

  // Anything else...
  return false
}

/**
 * Export `isEmpty`.
 *
 * @type {Function}
 */

var lib = isEmpty;

//
// Main
//

function memoize (fn, options) {
  var cache = options && options.cache
    ? options.cache
    : cacheDefault;

  var serializer = options && options.serializer
    ? options.serializer
    : serializerDefault;

  var strategy = options && options.strategy
    ? options.strategy
    : strategyDefault;

  return strategy(fn, {
    cache: cache,
    serializer: serializer
  })
}

//
// Strategy
//

function isPrimitive (value) {
  return value == null || typeof value === 'number' || typeof value === 'boolean' // || typeof value === "string" 'unsafe' primitive for our needs
}

function monadic (fn, cache, serializer, arg) {
  var cacheKey = isPrimitive(arg) ? arg : serializer(arg);

  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === 'undefined') {
    computedValue = fn.call(this, arg);
    cache.set(cacheKey, computedValue);
  }

  return computedValue
}

function variadic (fn, cache, serializer) {
  var args = Array.prototype.slice.call(arguments, 3);
  var cacheKey = serializer(args);

  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === 'undefined') {
    computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
  }

  return computedValue
}

function assemble (fn, context, strategy, cache, serialize) {
  return strategy.bind(
    context,
    fn,
    cache,
    serialize
  )
}

function strategyDefault (fn, options) {
  var strategy = fn.length === 1 ? monadic : variadic;

  return assemble(
    fn,
    this,
    strategy,
    options.cache.create(),
    options.serializer
  )
}

function strategyVariadic (fn, options) {
  var strategy = variadic;

  return assemble(
    fn,
    this,
    strategy,
    options.cache.create(),
    options.serializer
  )
}

function strategyMonadic (fn, options) {
  var strategy = monadic;

  return assemble(
    fn,
    this,
    strategy,
    options.cache.create(),
    options.serializer
  )
}

//
// Serializer
//

function serializerDefault () {
  return JSON.stringify(arguments)
}

//
// Cache
//

function ObjectWithoutPrototypeCache () {
  this.cache = Object.create(null);
}

ObjectWithoutPrototypeCache.prototype.has = function (key) {
  return (key in this.cache)
};

ObjectWithoutPrototypeCache.prototype.get = function (key) {
  return this.cache[key]
};

ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
  this.cache[key] = value;
};

var cacheDefault = {
  create: function create () {
    return new ObjectWithoutPrototypeCache()
  }
};

//
// API
//

var src = memoize;
var strategies = {
  variadic: strategyVariadic,
  monadic: strategyMonadic
};
src.strategies = strategies;

var iterator = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value;
    }
  };
};

var yallist = Yallist;

Yallist.Node = Node;
Yallist.create = Yallist;

function Yallist (list) {
  var self = this;
  if (!(self instanceof Yallist)) {
    self = new Yallist();
  }

  self.tail = null;
  self.head = null;
  self.length = 0;

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item);
    });
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i]);
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next;
  var prev = node.prev;

  if (next) {
    next.prev = prev;
  }

  if (prev) {
    prev.next = next;
  }

  if (node === this.head) {
    this.head = next;
  }
  if (node === this.tail) {
    this.tail = prev;
  }

  node.list.length--;
  node.next = null;
  node.prev = null;
  node.list = null;

  return next
};

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var head = this.head;
  node.list = this;
  node.next = head;
  if (head) {
    head.prev = node;
  }

  this.head = node;
  if (!this.tail) {
    this.tail = node;
  }
  this.length++;
};

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var tail = this.tail;
  node.list = this;
  node.prev = tail;
  if (tail) {
    tail.next = node;
  }

  this.tail = node;
  if (!this.head) {
    this.head = node;
  }
  this.length++;
};

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i]);
  }
  return this.length
};

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i]);
  }
  return this.length
};

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value;
  this.tail = this.tail.prev;
  if (this.tail) {
    this.tail.next = null;
  } else {
    this.head = null;
  }
  this.length--;
  return res
};

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value;
  this.head = this.head.next;
  if (this.head) {
    this.head.prev = null;
  } else {
    this.tail = null;
  }
  this.length--;
  return res
};

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.next;
  }
};

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.prev;
  }
};

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next;
  }
  if (i === n && walker !== null) {
    return walker.value
  }
};

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev;
  }
  if (i === n && walker !== null) {
    return walker.value
  }
};

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist();
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.next;
  }
  return res
};

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist();
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.prev;
  }
  return res
};

Yallist.prototype.reduce = function (fn, initial) {
  var acc;
  var walker = this.head;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.head) {
    walker = this.head.next;
    acc = this.head.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i);
    walker = walker.next;
  }

  return acc
};

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc;
  var walker = this.tail;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.tail) {
    walker = this.tail.prev;
    acc = this.tail.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i);
    walker = walker.prev;
  }

  return acc
};

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.next;
  }
  return arr
};

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.prev;
  }
  return arr
};

Yallist.prototype.slice = function (from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist();
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next;
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value);
  }
  return ret
};

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist();
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev;
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value);
  }
  return ret
};

Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1;
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next;
  }

  var ret = [];
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value);
    walker = this.removeNode(walker);
  }
  if (walker === null) {
    walker = this.tail;
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev;
  }

  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i]);
  }
  return ret;
};

Yallist.prototype.reverse = function () {
  var head = this.head;
  var tail = this.tail;
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev;
    walker.prev = walker.next;
    walker.next = p;
  }
  this.head = tail;
  this.tail = head;
  return this
};

function insert (self, node, value) {
  var inserted = node === self.head ?
    new Node(value, null, node, self) :
    new Node(value, node, node.next, self);

  if (inserted.next === null) {
    self.tail = inserted;
  }
  if (inserted.prev === null) {
    self.head = inserted;
  }

  self.length++;

  return inserted
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self);
  if (!self.head) {
    self.head = self.tail;
  }
  self.length++;
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self);
  if (!self.tail) {
    self.tail = self.head;
  }
  self.length++;
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list;
  this.value = value;

  if (prev) {
    prev.next = this;
    this.prev = prev;
  } else {
    this.prev = null;
  }

  if (next) {
    next.prev = this;
    this.next = next;
  } else {
    this.next = null;
  }
}

try {
  // add if support for Symbol.iterator is present
  iterator(Yallist);
} catch (er) {}

// A linked list to keep track of recently-used-ness


const MAX = Symbol('max');
const LENGTH = Symbol('length');
const LENGTH_CALCULATOR = Symbol('lengthCalculator');
const ALLOW_STALE = Symbol('allowStale');
const MAX_AGE = Symbol('maxAge');
const DISPOSE = Symbol('dispose');
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
const LRU_LIST = Symbol('lruList');
const CACHE = Symbol('cache');
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

const naiveLength = () => 1;

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options };

    if (!options)
      options = {};

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    const max = this[MAX] = options.max || Infinity;

    const lc = options.length || naiveLength;
    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc;
    this[ALLOW_STALE] = options.stale || false;
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE] = options.maxAge || 0;
    this[DISPOSE] = options.dispose;
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
    this.reset();
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX] = mL || Infinity;
    trim(this);
  }
  get max () {
    return this[MAX]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE] = !!allowStale;
  }
  get allowStale () {
    return this[ALLOW_STALE]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE] = mA;
    trim(this);
  }
  get maxAge () {
    return this[MAX_AGE]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength;

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC;
      this[LENGTH] = 0;
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
        this[LENGTH] += hit.length;
      });
    }
    trim(this);
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  get length () { return this[LENGTH] }
  get itemCount () { return this[LRU_LIST].length }

  rforEach (fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST].tail; walker !== null;) {
      const prev = walker.prev;
      forEachStep(this, fn, walker, thisp);
      walker = prev;
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST].head; walker !== null;) {
      const next = walker.next;
      forEachStep(this, fn, walker, thisp);
      walker = next;
    }
  }

  keys () {
    return this[LRU_LIST].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE] &&
        this[LRU_LIST] &&
        this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
    }

    this[CACHE] = new Map(); // hash of items by key
    this[LRU_LIST] = new yallist(); // list of items in order of use recency
    this[LENGTH] = 0; // length of items in the list
  }

  dump () {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE];

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0;
    const len = this[LENGTH_CALCULATOR](value, key);

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key));
        return false
      }

      const node = this[CACHE].get(key);
      const item = node.value;

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value);
      }

      item.now = now;
      item.maxAge = maxAge;
      item.value = value;
      this[LENGTH] += len - item.length;
      item.length = len;
      this.get(key);
      trim(this);
      return true
    }

    const hit = new Entry(key, value, len, now, maxAge);

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value);

      return false
    }

    this[LENGTH] += hit.length;
    this[LRU_LIST].unshift(hit);
    this[CACHE].set(key, this[LRU_LIST].head);
    trim(this);
    return true
  }

  has (key) {
    if (!this[CACHE].has(key)) return false
    const hit = this[CACHE].get(key).value;
    return !isStale(this, hit)
  }

  get (key) {
    return get(this, key, true)
  }

  peek (key) {
    return get(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST].tail;
    if (!node)
      return null

    del(this, node);
    return node.value
  }

  del (key) {
    del(this, this[CACHE].get(key));
  }

  load (arr) {
    // reset the cache
    this.reset();

    const now = Date.now();
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l];
      const expiresAt = hit.e || 0;
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v);
      else {
        const maxAge = expiresAt - now;
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge);
        }
      }
    }
  }

  prune () {
    this[CACHE].forEach((value, key) => get(this, key, false));
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key);
  if (node) {
    const hit = node.value;
    if (isStale(self, hit)) {
      del(self, node);
      if (!self[ALLOW_STALE])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now();
        self[LRU_LIST].unshiftNode(node);
      }
    }
    return hit.value
  }
};

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
    return false

  const diff = Date.now() - hit.now;
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE] && (diff > self[MAX_AGE])
};

const trim = self => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail;
      self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev;
      del(self, walker);
      walker = prev;
    }
  }
};

const del = (self, node) => {
  if (node) {
    const hit = node.value;
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value);

    self[LENGTH] -= hit.length;
    self[CACHE].delete(hit.key);
    self[LRU_LIST].removeNode(node);
  }
};

class Entry {
  constructor (key, value, length, now, maxAge) {
    this.key = key;
    this.value = value;
    this.length = length;
    this.now = now;
    this.maxAge = maxAge || 0;
  }
}

const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value;
  if (isStale(self, hit)) {
    del(self, node);
    if (!self[ALLOW_STALE])
      hit = undefined;
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self);
};

var lruCache = LRUCache;

var validateData = function validateData(data) {
  return !!data && !lib(data);
};

var getValidatedData = function getValidatedData(data) {
  return validateData(data) ? data : [];
};

var walk = function walk(_a) {
  var data = _a.data,
      props = __rest(_a, ["data"]);

  var validatedData = getValidatedData(data);

  var propsWithDefaultValues = __assign({
    parent: '',
    level: 0
  }, props);

  var handleArray = function handleArray(dataAsArray) {
    return dataAsArray.reduce(function (all, node, index) {
      var branchProps = __assign({
        node: node,
        index: index,
        nodeName: node.key
      }, propsWithDefaultValues);

      var branch = generateBranch(branchProps);
      return __spreadArrays(all, branch);
    }, []);
  };

  var handleObject = function handleObject(dataAsObject) {
    return Object.entries(dataAsObject).sort(function (a, b) {
      return a[1].index - b[1].index;
    }) // sorted by index
    .reduce(function (all, _a) {
      var nodeName = _a[0],
          node = _a[1];

      var branchProps = __assign({
        node: node,
        nodeName: nodeName
      }, propsWithDefaultValues);

      var branch = generateBranch(branchProps);
      return __spreadArrays(all, branch);
    }, []);
  };

  return Array.isArray(validatedData) ? handleArray(validatedData) : handleObject(validatedData);
};

var defaultMatchSearch = function defaultMatchSearch(_a) {
  var label = _a.label,
      searchTerm = _a.searchTerm;

  var processString = function processString(text) {
    return text.trim().toLowerCase();
  };

  return processString(label).includes(processString(searchTerm));
};

var defaultLocale = function defaultLocale(_a) {
  var label = _a.label;
  return label;
};

var generateBranch = function generateBranch(_a) {
  var node = _a.node,
      nodeName = _a.nodeName,
      _b = _a.matchSearch,
      matchSearch = _b === void 0 ? defaultMatchSearch : _b,
      _c = _a.locale,
      locale = _c === void 0 ? defaultLocale : _c,
      props = __rest(_a, ["node", "nodeName", "matchSearch", "locale"]);

  var parent = props.parent,
      level = props.level,
      openNodes = props.openNodes,
      searchTerm = props.searchTerm;

  var nodes = node.nodes,
      _d = node.label,
      rawLabel = _d === void 0 ? 'unknown' : _d,
      nodeProps = __rest(node, ["nodes", "label"]);

  var key = [parent, nodeName].filter(function (x) {
    return x;
  }).join('/');
  var hasNodes = validateData(nodes);
  var isOpen = hasNodes && (openNodes.includes(key) || !!searchTerm);
  var label = locale(__assign({
    label: rawLabel
  }, nodeProps));
  var isVisible = !searchTerm || matchSearch(__assign({
    label: label,
    searchTerm: searchTerm
  }, nodeProps));

  var currentItem = __assign(__assign(__assign({}, props), nodeProps), {
    label: label,
    hasNodes: hasNodes,
    isOpen: isOpen,
    key: key
  });

  var data = getValidatedData(nodes);
  var nextLevelItems = isOpen ? walk(__assign(__assign({
    data: data,
    locale: locale,
    matchSearch: matchSearch
  }, props), {
    parent: key,
    level: level + 1
  })) : [];
  return isVisible ? __spreadArrays([currentItem], nextLevelItems) : nextLevelItems;
};

var lruCacheOptions = {
  max: 500,
  maxAge: 1000 * 60 * 60
};
var specialCache = {
  create: function create() {
    return new lruCache(lruCacheOptions);
  }
};

function specialSerializer() {
  var _a = arguments[0],
      data = _a.data,
      props = __rest(_a, ["data"]);

  if (!data) {
    return JSON.stringify(props);
  }

  if (data.timestamp) {
    return data.timestamp + JSON.stringify(props);
  } else {
    return JSON.stringify(data) + JSON.stringify(props);
  }
}
var fastWalk = src(walk, {
  // @ts-ignore
  cache: specialCache,
  serializer: specialSerializer
});
var slowWalk = walk;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var classnames = createCommonjsModule(function (module) {
/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}
}());
});

var DEFAULT_PADDING = 0.75;
var ICON_SIZE = 2;
var LEVEL_SPACE = 1.75;

var ToggleIcon = function ToggleIcon(_a) {
  var on = _a.on,
      openedIcon = _a.openedIcon,
      closedIcon = _a.closedIcon;
  return React.createElement("div", {
    role: "img",
    "aria-label": "Toggle",
    className: "rstm-toggle-icon-symbol"
  }, on ? openedIcon : closedIcon);
};

var ItemComponent = function ItemComponent(_a) {
  var _b = _a.hasNodes,
      hasNodes = _b === void 0 ? false : _b,
      _c = _a.isOpen,
      isOpen = _c === void 0 ? false : _c,
      _d = _a.level,
      level = _d === void 0 ? 0 : _d,
      onClick = _a.onClick,
      toggleNode = _a.toggleNode,
      active = _a.active,
      focused = _a.focused,
      _e = _a.openedIcon,
      openedIcon = _e === void 0 ? '-' : _e,
      _f = _a.closedIcon,
      closedIcon = _f === void 0 ? '+' : _f,
      _g = _a.label,
      label = _g === void 0 ? 'unknown' : _g,
      _h = _a.style,
      style = _h === void 0 ? {} : _h;
  return React.createElement("li", {
    className: classnames('rstm-tree-item', "rstm-tree-item-level" + level, {
      'rstm-tree-item--active': active
    }, {
      'rstm-tree-item--focused': focused
    }),
    style: __assign({
      paddingLeft: DEFAULT_PADDING + ICON_SIZE * (hasNodes ? 0 : 1) + level * LEVEL_SPACE + "rem"
    }, style),
    role: "button",
    "aria-pressed": active,
    onClick: onClick
  }, hasNodes && React.createElement("div", {
    className: "rstm-toggle-icon",
    onClick: function onClick(e) {
      hasNodes && toggleNode && toggleNode();
      e.stopPropagation();
    }
  }, React.createElement(ToggleIcon, {
    on: isOpen,
    openedIcon: openedIcon,
    closedIcon: closedIcon
  })), label);
};
var defaultChildren = function defaultChildren(_a) {
  var search = _a.search,
      items = _a.items;

  var onSearch = function onSearch(e) {
    var value = e.target.value;
    search && search(value);
  };

  return React.createElement(React.Fragment, null, search && React.createElement("input", {
    className: "rstm-search",
    "aria-label": "Type and search",
    type: "search",
    placeholder: "Type and search",
    onChange: onSearch
  }), React.createElement("ul", {
    className: "rstm-tree-item-group"
  }, items.map(function (_a) {
    var key = _a.key,
        props = __rest(_a, ["key"]);

    return React.createElement(ItemComponent, __assign({
      key: key
    }, props));
  })));
};

var KeyDown = function KeyDown(_a) {
  var children = _a.children,
      up = _a.up,
      down = _a.down,
      left = _a.left,
      right = _a.right,
      enter = _a.enter;
  return React.createElement("div", {
    tabIndex: 0,
    onKeyDown: function onKeyDown(e) {
      switch (e.key) {
        case 'ArrowUp':
          {
            up();
            break;
          }

        case 'ArrowDown':
          {
            down();
            break;
          }

        case 'ArrowLeft':
          {
            left();
            break;
          }

        case 'ArrowRight':
          {
            right();
            break;
          }

        case 'Enter':
          {
            enter();
            break;
          }
      }
    }
  }, children);
};

var defaultOnClick = function defaultOnClick(props) {
  return console.log(props);
}; // eslint-disable-line no-console


var TreeMenu =
/** @class */
function (_super) {
  __extends(TreeMenu, _super);

  function TreeMenu() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.state = {
      openNodes: _this.props.initialOpenNodes || [],
      searchTerm: '',
      activeKey: _this.props.initialActiveKey || '',
      focusKey: _this.props.initialFocusKey || ''
    };

    _this.resetOpenNodes = function (newOpenNodes, activeKey, focusKey) {
      var initialOpenNodes = _this.props.initialOpenNodes;
      var openNodes = Array.isArray(newOpenNodes) && newOpenNodes || initialOpenNodes || [];

      _this.setState({
        openNodes: openNodes,
        searchTerm: '',
        activeKey: activeKey || '',
        focusKey: focusKey || activeKey || ''
      });
    };

    _this.setSearch = function (searchTerm) {
      return _this.setState({
        searchTerm: searchTerm
      });
    };

    _this.setSearchDebounced = tinyDebounce(_this.setSearch, 125);

    _this.search = function (value) {
      var search = _this.setSearchDebounced || _this.setSearch;
      search(value);
    };

    _this.toggleNode = function (node) {
      if (!_this.props.openNodes) {
        var openNodes = _this.state.openNodes;
        var newOpenNodes = openNodes.includes(node) ? openNodes.filter(function (openNode) {
          return openNode !== node;
        }) : __spreadArrays(openNodes, [node]);

        _this.setState({
          openNodes: newOpenNodes
        });
      }
    };

    _this.generateItems = function () {
      var _a = _this.props,
          data = _a.data,
          onClickItem = _a.onClickItem,
          locale = _a.locale,
          matchSearch = _a.matchSearch;
      var searchTerm = _this.state.searchTerm;
      var openNodes = _this.props.openNodes || _this.state.openNodes;
      var activeKey = _this.props.activeKey || _this.state.activeKey;
      var focusKey = _this.props.focusKey || _this.state.focusKey;
      var defaultSearch = _this.props.cacheSearch ? fastWalk : slowWalk;
      var items = data ? defaultSearch({
        data: data,
        openNodes: openNodes,
        searchTerm: searchTerm,
        locale: locale,
        matchSearch: matchSearch
      }) : [];
      return items.map(function (item) {
        var focused = item.key === focusKey;
        var active = item.key === activeKey;

        var onClick = function onClick() {
          var newActiveKey = _this.props.activeKey || item.key;

          _this.setState({
            activeKey: newActiveKey,
            focusKey: newActiveKey
          });

          onClickItem && onClickItem(item);
        };

        var toggleNode = item.hasNodes ? function () {
          return _this.toggleNode(item.key);
        } : undefined;
        return __assign(__assign({}, item), {
          focused: focused,
          active: active,
          onClick: onClick,
          toggleNode: toggleNode
        });
      });
    };

    _this.getKeyDownProps = function (items) {
      var onClickItem = _this.props.onClickItem;
      var _a = _this.state,
          focusKey = _a.focusKey,
          activeKey = _a.activeKey,
          searchTerm = _a.searchTerm;
      var focusIndex = items.findIndex(function (item) {
        return item.key === (focusKey || activeKey);
      });

      var getFocusKey = function getFocusKey(item) {
        var keyArray = item.key.split('/');
        return keyArray.length > 1 ? keyArray.slice(0, keyArray.length - 1).join('/') : item.key;
      };

      return {
        up: function up() {
          _this.setState(function (_a) {
            var focusKey = _a.focusKey;
            return {
              focusKey: focusIndex > 0 ? items[focusIndex - 1].key : focusKey
            };
          });
        },
        down: function down() {
          _this.setState(function (_a) {
            var focusKey = _a.focusKey;
            return {
              focusKey: focusIndex < items.length - 1 ? items[focusIndex + 1].key : focusKey
            };
          });
        },
        left: function left() {
          var item = items[focusIndex];

          if (item) {
            _this.setState(function (_a) {
              var openNodes = _a.openNodes,
                  rest = __rest(_a, ["openNodes"]);

              var newOpenNodes = openNodes.filter(function (node) {
                return node !== item.key;
              });
              return item.isOpen ? __assign(__assign({}, rest), {
                openNodes: newOpenNodes,
                focusKey: item.key
              }) : __assign(__assign({}, rest), {
                focusKey: getFocusKey(item)
              });
            });
          }
        },
        right: function right() {
          var _a = items[focusIndex],
              hasNodes = _a.hasNodes,
              key = _a.key;
          if (hasNodes) _this.setState(function (_a) {
            var openNodes = _a.openNodes;
            return {
              openNodes: __spreadArrays(openNodes, [key])
            };
          });
        },
        enter: function enter() {
          _this.setState(function (_a) {
            var focusKey = _a.focusKey;
            return {
              activeKey: focusKey
            };
          });

          onClickItem && onClickItem(items[focusIndex]);
        }
      };
    };

    return _this;
  }

  TreeMenu.prototype.componentDidMount = function () {
    var debounceTime = this.props.debounceTime;
    this.setSearchDebounced = tinyDebounce(this.setSearch, debounceTime);
  };

  TreeMenu.prototype.componentDidUpdate = function (prevProps) {
    var _a = this.props,
        data = _a.data,
        initialOpenNodes = _a.initialOpenNodes,
        resetOpenNodesOnDataUpdate = _a.resetOpenNodesOnDataUpdate;

    if (prevProps.data !== data && resetOpenNodesOnDataUpdate && initialOpenNodes) {
      this.setState({
        openNodes: initialOpenNodes
      });
    }
  };

  TreeMenu.prototype.render = function () {
    var _a = this.props,
        children = _a.children,
        hasSearch = _a.hasSearch,
        disableKeyboard = _a.disableKeyboard;
    var searchTerm = this.state.searchTerm;
    var search = this.search;
    var items = this.generateItems();
    var resetOpenNodes = this.resetOpenNodes;
    var render = children || defaultChildren;
    var renderProps = hasSearch ? {
      search: search,
      resetOpenNodes: resetOpenNodes,
      items: items,
      searchTerm: searchTerm
    } : {
      items: items,
      resetOpenNodes: resetOpenNodes
    };
    return disableKeyboard ? render(renderProps) : React.createElement(KeyDown, __assign({}, this.getKeyDownProps(items)), render(renderProps));
  };

  TreeMenu.defaultProps = {
    data: {},
    onClickItem: defaultOnClick,
    debounceTime: 125,
    children: defaultChildren,
    hasSearch: true,
    cacheSearch: true,
    resetOpenNodesOnDataUpdate: false,
    disableKeyboard: false
  };
  return TreeMenu;
}(React.Component);

export default TreeMenu;
export { ItemComponent, KeyDown, defaultChildren };
