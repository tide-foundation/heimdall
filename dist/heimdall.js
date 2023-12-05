"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TidePromise = exports.Heimdall = exports.FieldData = void 0;
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// 
// Tide Protocol - Infrastructure for a TRUE Zero-Trust paradigm
// Copyright (C) 2022 Tide Foundation Ltd
// 
// This program is free software and is subject to the terms of 
// the Tide Community Open Code License as published by the 
// Tide Foundation Limited. You may modify it and redistribute 
// it in accordance with and subject to the terms of that License.
// This program is distributed WITHOUT WARRANTY of any kind, 
// including without any implied warranty of MERCHANTABILITY or 
// FITNESS FOR A PARTICULAR PURPOSE.
// See the Tide Community Open Code License for more details.
// You should have received a copy of the Tide Community Open 
// Code License along with this program.
// If not, see https://tide.org/licenses_tcoc2-0-0-en
//
var Heimdall = exports.Heimdall = /*#__PURE__*/function () {
  /**
   * 
   * @example Config:
  * {
  * vendorPublic: string //Make sure to create some public key for this
  * vendorUrlSignature: string //The value of this web page's URL (such as https://www.yoursite.com/login) signed (EdDSA) with this vendor's VVK.
  * homeORKUrl: string //Just the origin. For example => https://someOrk.com
  * enclaveRequest: object // Contains the neccessary information on what how the enclave should behave and the information it returns
  * }
  * @param {object} config
   */
  function Heimdall(config) {
    _classCallCheck(this, Heimdall);
    if (!Object.hasOwn(config, 'vendorPublic')) {
      throw Error("No vendor public key has been included in config");
    }
    if (!Object.hasOwn(config, 'homeORKUrl')) {
      throw Error("No home ork URL has been included in config");
    }
    if (!Object.hasOwn(config, 'enclaveRequest')) {
      throw Error("No enclave request has been included in config");
    }
    if (typeof config.enclaveRequest.getUserInfoFirst !== "boolean") throw Error("Make sure to set enclaveRequest.getUserInfoFirst to true or false");
    this.vendorPublic = config.vendorPublic;
    this.homeORKUrl = config.homeORKUrl;
    this.enclaveRequest = config.enclaveRequest;
    this.vendorReturnAuthUrl = config.vendorReturnAuthUrl;
    // check enclave request for invalid values
    if (this.enclaveRequest.refreshToken == false && this.enclaveRequest.customModel == undefined && this.enclaveRequest.getUserInfoFirst == false) {
      throw Error("It seems you are trying to log a user into Tide and expect nothing in return. Make sure you at least use the sign in process for something.");
    }
    this.currentOrkURL = this.homeORKUrl;
    this.enclaveWindow = undefined;
    this.enclaveFunction = "standard";
    this.isApp = new URL(window.location.toString()).origin == null ? true : false;
    if (this.isApp) {
      if (!Object.hasOwn(config, 'appOriginText')) {
        throw Error("No appOriginText has been included in config. Since you are running an app with Heimdall, appOriginText is required");
      }
      if (!Object.hasOwn(config, 'appOriginTextSignature')) {
        throw Error("No appOriginTextSignature has been included in config. Since you are running an app with Heimdall, appOriginTextSignature is required");
      }
      this.appOriginText = config.appOriginText;
      this.appOriginTextSignature = config.appOriginTextSignature;
    } else {
      if (!Object.hasOwn(config, 'vendorUrlSignature')) {
        throw Error("No vendor url sig has been included in config");
      }
      this.vendorUrlSignature = config.vendorUrlSignature;
    }
  }
  _createClass(Heimdall, [{
    key: "AddTideButton",
    value: function AddTideButton(tideButtonAction, actionParameter) {
      var button = document.createElement('button');

      //button styling
      button.textContent = "";
      button.innerHTML = '<img src ="https://tide.org/assets/images/logo-tide-white.png"/>';
      button.type = "image";
      button.style.width = "200";
      button.style.height = "100";
      button.style.background = "orange";
      button.style.color = "white";
      button.style.fontSize = "13px";
      button.style.padding = "6px 40px";
      button.style.borderColor = "white";
      button.style.borderRadius = "6px";
      button.addEventListener('click', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              tideButtonAction(actionParameter);
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      })));
      document.body.appendChild(button); // add button to page
      return button;
    }

    /**
     * TIDE BUTTON ACTION
     * callback must be defined (it must return customModel if you are expecting a 2 stage process)
     * @param {function} callback 
     */
  }, {
    key: "PerformTideAuth",
    value: (function () {
      var _PerformTideAuth = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(callback) {
        var userInfo, jwt, customModel;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              this.enclaveFunction = "standard";
              if (!(typeof this.vendorReturnAuthUrl !== "string")) {
                _context2.next = 3;
                break;
              }
              throw Error("Vendor's Return Auth URL has not been defined in config.enclaveRequest");
            case 3:
              _context2.next = 5;
              return this.OpenEnclave();
            case 5:
              userInfo = _context2.sent;
              jwt = undefined;
              if (!(userInfo.responseType == "completed")) {
                _context2.next = 11;
                break;
              }
              jwt = userInfo.TideJWT;
              _context2.next = 16;
              break;
            case 11:
              if (!(userInfo.responseType == "userData")) {
                _context2.next = 16;
                break;
              }
              customModel = callback(userInfo); // this can be used for the vendor page to perform operations and develop a model to sign
              _context2.next = 15;
              return this.CompleteSignIn(customModel).TideJWT;
            case 15:
              jwt = _context2.sent;
            case 16:
              if (!(typeof jwt !== "string")) {
                _context2.next = 18;
                break;
              }
              throw Error("PerformTideAuth function requires a RefreshToken (TideJWT) to be requested in the config");
            case 18:
              window.location.replace(this.vendorReturnAuthUrl + jwt); // redirect user to this vendor's authentication endpoint with auth token
            case 19:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function PerformTideAuth(_x) {
        return _PerformTideAuth.apply(this, arguments);
      }
      return PerformTideAuth;
    }()
    /**
     * TIDE BUTTON ACTION
     * @param {TidePromise} promise 
     */
    )
  }, {
    key: "GetUserInfo",
    value: (function () {
      var _GetUserInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(promise) {
        var userData;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              this.enclaveFunction = "standard";
              if (!(this.enclaveRequest.getUserInfoFirst == false)) {
                _context3.next = 3;
                break;
              }
              throw Error("getUserInfofirst must be set to true to use heimdall.GetUserInfo()");
            case 3:
              this.redirectToOrk();
              _context3.next = 6;
              return this.waitForSignal("userData");
            case 6:
              userData = _context3.sent;
              promise.fulfill(userData);
              // continue sign in so vendor doesn't have to do it (i can't think of why vendor would abort this process, if something screws up, it's on the vendor, they already paid for the user)
              _context3.next = 10;
              return this.CompleteSignIn();
            case 10:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function GetUserInfo(_x2) {
        return _GetUserInfo.apply(this, arguments);
      }
      return GetUserInfo;
    }()
    /**
     * TIDE BUTTON ACTION
     * @param {TidePromise} promise
     */
    )
  }, {
    key: "GetCompleted",
    value: (function () {
      var _GetCompleted = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(promise) {
        var customModel, userInfo, completedData;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              this.enclaveFunction = "standard";
              this.redirectToOrk();
              customModel = null;
              if (!this.enclaveRequest.getUserInfoFirst) {
                _context4.next = 11;
                break;
              }
              _context4.next = 6;
              return this.waitForSignal("userData");
            case 6:
              userInfo = _context4.sent;
              if (!(promise.callback != null)) {
                _context4.next = 11;
                break;
              }
              _context4.next = 10;
              return promise.callback(userInfo);
            case 10:
              customModel = _context4.sent;
            case 11:
              _context4.next = 13;
              return this.CompleteSignIn(customModel);
            case 13:
              completedData = _context4.sent;
              promise.fulfill(completedData);
            case 15:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function GetCompleted(_x3) {
        return _GetCompleted.apply(this, arguments);
      }
      return GetCompleted;
    }()
    /**
     * TIDE BUTTON ACTION
     * @param {[string, FieldData, TidePromise]} params 
     */
    )
  }, {
    key: "EncryptUserData",
    value: (function () {
      var _EncryptUserData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(_ref2) {
        var _ref3, tideJWT, fieldData, promise, dataToSend, iFrameResp, enclaveResp;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _ref3 = _slicedToArray(_ref2, 3), tideJWT = _ref3[0], fieldData = _ref3[1], promise = _ref3[2];
              _context5.prev = 1;
              this.enclaveFunction = "encrypt";
              // try opening an iframe in the current document first
              // if that fails - for any reason (e.g. jwt expired, sessionkey not found, iframe blocked) - open the tide enclave
              this.openHiddenIFrame();

              // send field data through window.postMessage so all of the vendor's super sensitive data isn't in the f***ing URL
              dataToSend = {
                TideJWT: tideJWT,
                FieldData: fieldData.getData()
              };
              this.enclaveWindow.postMessage(dataToSend, this.currentOrkURL);
              _context5.next = 8;
              return this.waitForSignal('encryptedData');
            case 8:
              iFrameResp = _context5.sent;
              if (!(iFrameResp.errorEncountered == false)) {
                _context5.next = 12;
                break;
              }
              promise.fulfill(iFrameResp.encryptedFields); // in case iframe worked - fulfill promise with data
              return _context5.abrupt("return");
            case 12:
              this.redirectToOrk(); // in case iframe didn't work - let's pull up our sweet enclave
              this.enclaveWindow.postMessage(dataToSend, this.currentOrkURL); // gotta send it again for the new window / enclave
              _context5.next = 16;
              return this.waitForSignal("encryptedData");
            case 16:
              enclaveResp = _context5.sent;
              promise.fulfill(enclaveResp.encryptedFields);
              _context5.next = 23;
              break;
            case 20:
              _context5.prev = 20;
              _context5.t0 = _context5["catch"](1);
              promise.reject(error);
            case 23:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[1, 20]]);
      }));
      function EncryptUserData(_x4) {
        return _EncryptUserData.apply(this, arguments);
      }
      return EncryptUserData;
    }()
    /**
     * TIDE BUTTON ACTION
     * @param {[string, FieldData, TidePromise]} params 
     */
    )
  }, {
    key: "TESTencryptUserDataTEST",
    value: (function () {
      var _TESTencryptUserDataTEST = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(_ref4) {
        var _this = this;
        var _ref5, tideJWT, fieldData, promise, key, enc, datas, pre_encrypted, encrypted;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              _ref5 = _slicedToArray(_ref4, 3), tideJWT = _ref5[0], fieldData = _ref5[1], promise = _ref5[2];
              _context7.prev = 1;
              if (jwtValid(tideJWT)) {
                _context7.next = 4;
                break;
              }
              throw Error("Invalid TideJWT");
            case 4:
              key = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]); // encrypt each field with this key
              // encrypted data will be in the same order as provided
              enc = new TextEncoder();
              datas = fieldData.getAll().map(function (a) {
                return enc.encode(JSON.stringify(a));
              });
              pre_encrypted = datas.map( /*#__PURE__*/function () {
                var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(data) {
                  return _regeneratorRuntime().wrap(function _callee6$(_context6) {
                    while (1) switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.next = 2;
                        return _this.TESTencryptDataTEST(data, key);
                      case 2:
                        return _context6.abrupt("return", _context6.sent);
                      case 3:
                      case "end":
                        return _context6.stop();
                    }
                  }, _callee6);
                }));
                return function (_x6) {
                  return _ref6.apply(this, arguments);
                };
              }());
              _context7.next = 10;
              return Promise.all(pre_encrypted);
            case 10:
              encrypted = _context7.sent;
              promise.fulfill(encrypted);
              _context7.next = 17;
              break;
            case 14:
              _context7.prev = 14;
              _context7.t0 = _context7["catch"](1);
              promise.reject(_context7.t0);
            case 17:
            case "end":
              return _context7.stop();
          }
        }, _callee7, null, [[1, 14]]);
      }));
      function TESTencryptUserDataTEST(_x5) {
        return _TESTencryptUserDataTEST.apply(this, arguments);
      }
      return TESTencryptUserDataTEST;
    }()
    /**
     * @param {[string, Uint8Array[], TidePromise]} params 
     */
    )
  }, {
    key: "TESTdecryptUserDataTEST",
    value: (function () {
      var _TESTdecryptUserDataTEST = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(_ref7) {
        var _this2 = this;
        var _ref8, tideJWT, encryptedData, promise, key, pre_decrypted, decrypted, decoder, data;
        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              _ref8 = _slicedToArray(_ref7, 3), tideJWT = _ref8[0], encryptedData = _ref8[1], promise = _ref8[2];
              _context9.prev = 1;
              if (jwtValid(tideJWT)) {
                _context9.next = 4;
                break;
              }
              throw Error("Invalid TideJWT");
            case 4:
              key = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
              pre_decrypted = encryptedData.map( /*#__PURE__*/function () {
                var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(enc) {
                  return _regeneratorRuntime().wrap(function _callee8$(_context8) {
                    while (1) switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return _this2.TESTdecryptDataTEST(enc, key);
                      case 2:
                        return _context8.abrupt("return", _context8.sent);
                      case 3:
                      case "end":
                        return _context8.stop();
                    }
                  }, _callee8);
                }));
                return function (_x8) {
                  return _ref9.apply(this, arguments);
                };
              }());
              _context9.next = 8;
              return Promise.all(pre_decrypted);
            case 8:
              decrypted = _context9.sent;
              decoder = new TextDecoder('utf-8');
              data = decrypted.map(function (dec) {
                return JSON.parse(decoder.decode(dec));
              });
              promise.fulfill(data);
              _context9.next = 17;
              break;
            case 14:
              _context9.prev = 14;
              _context9.t0 = _context9["catch"](1);
              promise.reject(_context9.t0);
            case 17:
            case "end":
              return _context9.stop();
          }
        }, _callee9, null, [[1, 14]]);
      }));
      function TESTdecryptUserDataTEST(_x7) {
        return _TESTdecryptUserDataTEST.apply(this, arguments);
      }
      return TESTdecryptUserDataTEST;
    }()
    /**
     * @param {Uint8Array} secretBytes 
     * @param {Uint8Array} key 
     * @returns 
     */
    )
  }, {
    key: "TESTencryptDataTEST",
    value: (function () {
      var _TESTencryptDataTEST = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(secretBytes, key) {
        var AESKey, iv, encryptedBuffer, len, buff;
        return _regeneratorRuntime().wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return window.crypto.subtle.importKey("raw", key, "AES-GCM", true, ["encrypt"]);
            case 2:
              AESKey = _context10.sent;
              iv = window.crypto.getRandomValues(new Uint8Array(12));
              _context10.next = 6;
              return window.crypto.subtle.encrypt({
                name: "AES-GCM",
                iv: iv
              }, AESKey, secretBytes);
            case 6:
              encryptedBuffer = _context10.sent;
              len = iv.length + new Uint8Array(encryptedBuffer).length;
              buff = new Uint8Array(len);
              buff.set(iv);
              buff.set(new Uint8Array(encryptedBuffer), iv.length);
              return _context10.abrupt("return", buff);
            case 12:
            case "end":
              return _context10.stop();
          }
        }, _callee10);
      }));
      function TESTencryptDataTEST(_x9, _x10) {
        return _TESTencryptDataTEST.apply(this, arguments);
      }
      return TESTencryptDataTEST;
    }()
    /**
     * @param {Uint8Array} encryptedBytes 
     * @param {Uint8Array} key 
     * @returns 
     */
    )
  }, {
    key: "TESTdecryptDataTEST",
    value: (function () {
      var _TESTdecryptDataTEST = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(encryptedBytes, key) {
        var AESKey, iv, data, decryptedContent;
        return _regeneratorRuntime().wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return window.crypto.subtle.importKey("raw", key, "AES-GCM", true, ["decrypt"]);
            case 2:
              AESKey = _context11.sent;
              iv = encryptedBytes.slice(0, 12);
              data = encryptedBytes.slice(12);
              _context11.next = 7;
              return window.crypto.subtle.decrypt({
                name: "AES-GCM",
                iv: iv
              }, AESKey, data);
            case 7:
              decryptedContent = _context11.sent;
              return _context11.abrupt("return", decryptedContent);
            case 9:
            case "end":
              return _context11.stop();
          }
        }, _callee11);
      }));
      function TESTdecryptDataTEST(_x11, _x12) {
        return _TESTdecryptDataTEST.apply(this, arguments);
      }
      return TESTdecryptDataTEST;
    }())
  }, {
    key: "RetrieveUserInfo",
    value: function () {
      var _RetrieveUserInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12() {
        return _regeneratorRuntime().wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              if (!(this.enclaveRequest.getUserInfoFirst == true)) {
                _context12.next = 6;
                break;
              }
              _context12.next = 3;
              return this.waitForSignal("userData");
            case 3:
              return _context12.abrupt("return", _context12.sent);
            case 6:
              if (!(this.enclaveRequest.getUserInfoFirst == false)) {
                _context12.next = 12;
                break;
              }
              _context12.next = 9;
              return this.waitForSignal("completed");
            case 9:
              return _context12.abrupt("return", _context12.sent);
            case 12:
              throw Error("Did you define getUserInfoFirst in enclave request?");
            case 13:
            case "end":
              return _context12.stop();
          }
        }, _callee12, this);
      }));
      function RetrieveUserInfo() {
        return _RetrieveUserInfo.apply(this, arguments);
      }
      return RetrieveUserInfo;
    }()
  }, {
    key: "OpenEnclave",
    value: function () {
      var _OpenEnclave = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13() {
        return _regeneratorRuntime().wrap(function _callee13$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              this.redirectToOrk();
              _context13.next = 3;
              return this.RetrieveUserInfo();
            case 3:
              return _context13.abrupt("return", _context13.sent);
            case 4:
            case "end":
              return _context13.stop();
          }
        }, _callee13, this);
      }));
      function OpenEnclave() {
        return _OpenEnclave.apply(this, arguments);
      }
      return OpenEnclave;
    }() // Signs the requested model / returns TideJWT + sig
  }, {
    key: "CompleteSignIn",
    value: function () {
      var _CompleteSignIn = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14() {
        var customModel,
          pre_resp,
          resp,
          _args14 = arguments;
        return _regeneratorRuntime().wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              customModel = _args14.length > 0 && _args14[0] !== undefined ? _args14[0] : null;
              if (_typeof(customModel) === "object" || customModel == null) {
                _context14.next = 3;
                break;
              }
              throw Error("Custom model must be a object or null");
            case 3:
              this.enclaveRequest.customModel = customModel;
              pre_resp = this.waitForSignal("completed");
              this.enclaveWindow.postMessage(customModel, this.currentOrkURL);
              _context14.next = 8;
              return pre_resp;
            case 8:
              resp = _context14.sent;
              return _context14.abrupt("return", resp);
            case 10:
            case "end":
              return _context14.stop();
          }
        }, _callee14, this);
      }));
      function CompleteSignIn() {
        return _CompleteSignIn.apply(this, arguments);
      }
      return CompleteSignIn;
    }() // In case of vendor side error, we can close enclave
  }, {
    key: "CloseEnclave",
    value: function CloseEnclave() {
      this.enclaveWindow.postMessage("VENDOR ERROR: Close Tide Enlcave", this.currentOrkURL);
    }
  }, {
    key: "openHiddenIFrame",
    value: function openHiddenIFrame() {
      var iframe = document.createElement('iframe');
      iframe.style.display = "none";
      iframe.src = this.createOrkURL();
      this.enclaveWindow = iframe.contentWindow;
      /// set up error handling here in case iframe encounters error and needs enclave
      document.body.appendChild(iframe);
    }
  }, {
    key: "redirectToOrk",
    value: function () {
      var _redirectToOrk = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15() {
        return _regeneratorRuntime().wrap(function _callee15$(_context15) {
          while (1) switch (_context15.prev = _context15.next) {
            case 0:
              this.enclaveWindow = window.open(this.createOrkURL(), new Date().getTime(), 'width=800,height=800');
            case 1:
            case "end":
              return _context15.stop();
          }
        }, _callee15, this);
      }));
      function redirectToOrk() {
        return _redirectToOrk.apply(this, arguments);
      }
      return redirectToOrk;
    }()
  }, {
    key: "createOrkURL",
    value: function createOrkURL() {
      return this.currentOrkURL + "?vendorPublic=".concat(encodeURIComponent(this.vendorPublic)) + "&vendorLocation=".concat(encodeURIComponent(window.location)) + this.isApp ? "&vendorOriginText=".concat(encodeURIComponent(this.appOriginText), "&vendorOriginTextSig=").concat(encodeURIComponent(this.appOriginTextSignature)) : "&vendorUrlSig=".concat(encodeURIComponent(this.vendorUrlSignature)) + "&vendorUrlSig=".concat(encodeURIComponent(this.vendorUrlSignature)) + "&enclaveRequest=".concat(encodeURIComponent(JSON.stringify(this.enclaveRequest))) + "&enclaveFunction=".concat(this.enclaveFunction) + "&vendorOrks=0";
    }
  }, {
    key: "waitForSignal",
    value: function waitForSignal(responseTypeToAwait) {
      var _this3 = this;
      return new Promise(function (resolve) {
        var handler = function handler(event) {
          var response = _this3.processEvent(event);
          if (response.responseType === responseTypeToAwait) {
            window.removeEventListener("message", handler);
            resolve(response);
          }
        };
        window.addEventListener("message", handler, false);
      });
    }

    /**
    * 
    * @param {MessageEvent} event 
    * @param {string} mode
    */
  }, {
    key: "processEvent",
    value: function processEvent(event) {
      if (event.origin !== this.currentOrkURL) {
        // Something's not right... The message has come from an unknown domain... 
        return {
          status: "NOT OK",
          data: "WRONG WINDOW SENT MESSAGE"
        };
      }
      var enclaveResponse = event.data; // this will contain the jwt signed by the orks from a successful sign in 

      if (enclaveResponse.ok != true) throw Error("Tide Enclave had an error: " + enclaveResponse.message);
      switch (enclaveResponse.dataType) {
        case "userData":
          return {
            responseType: "userData",
            PublicKey: enclaveResponse.publicKey,
            UID: enclaveResponse.uid,
            NewAccount: enclaveResponse.newAccount
          };
        case "completed":
          if (this.enclaveRequest.refreshToken) {
            if (!jwtValid(enclaveResponse.TideJWT)) throw Error("TideJWT not valid");
          }
          return {
            responseType: "completed",
            ModelSig: enclaveResponse.modelSig,
            TideJWT: enclaveResponse.TideJWT
          };
        case "newORKUrl":
          this.currentOrkURL = enclaveResponse.url;
          return {
            responseType: "newORKUrl"
          };
        case "encryptedData":
          return {
            responseType: "encryptedData",
            errorEncountered: enclaveResponse.errorEncountered,
            encryptedFields: enclaveResponse.encryptedFields
          };
        case "enclaveChallenge":
          return {
            responseType: "enclaveChallenge",
            challenge: enclaveResponse.challenge
          };
        default:
          throw Error("Unknown data type returned from enclave");
      }
    }
  }]);
  return Heimdall;
}();
var TidePromise = exports.TidePromise = /*#__PURE__*/function () {
  function TidePromise() {
    var _this4 = this;
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    _classCallCheck(this, TidePromise);
    this.promise = new Promise(function (resolve, reject) {
      // Store the resolve function to be called later
      _this4.resolve = resolve;
      _this4.reject = reject;
    });
    this.callback = callback;
  }
  _createClass(TidePromise, [{
    key: "fulfill",
    value: function fulfill(value) {
      // Fulfill the promise with the provided value
      this.resolve(value);
    }
  }, {
    key: "reject",
    value: function reject(error) {
      this.reject(error);
    }
  }]);
  return TidePromise;
}();
var FieldData = exports.FieldData = /*#__PURE__*/function () {
  /**
   * These identifiers must ALWAYS - EVERY TIME HEIMDALL IS CALLED FROM THIS VENDOR - be supplied in the SAME ORDER. APPEND list for new identifiers
   * @param {string[]} identifiers 
   */
  function FieldData(identifiers) {
    _classCallCheck(this, FieldData);
    if (identifiers.length > 255) throw Error("Heimdall: Too many identifiers provided for FieldData");
    if (identifiers.length == 0) throw Error("Identifiers list required to convert tags to ids");
    this.identifiers = identifiers;
    this.datas = [];
  }

  /**
   * @param {string} data 
   * @param {string[]} ids 
   */
  _createClass(FieldData, [{
    key: "add",
    value: function add(data, ids) {
      var datum = {
        Data: data,
        Tag: this.getTag(ids)
      };
      this.datas.push(datum);
    }

    /**
     * @param {string} data 
     * @param {number} tag 
     */
  }, {
    key: "addWithTag",
    value: function addWithTag(data, tag) {
      var datum = {
        Data: data,
        Tag: tag
      };
      this.datas.push(datum);
    }

    /**
     * @param {object[]} fieldDatas 
     */
  }, {
    key: "addManyWithTag",
    value: function addManyWithTag(fieldDatas) {
      if (this.datas.length > 0) throw Error("This FieldData object already has objects in its contents");
      this.datas = fieldDatas.map(function (fd) {
        if (!fd.Data || !fd.Tag) throw Error("Invalid field data supplied");
        return fd;
      });
    }
  }, {
    key: "getAll",
    value: function getAll() {
      return _toConsumableArray(this.datas);
    }
  }, {
    key: "getAllWithIds",
    value: function getAllWithIds() {
      var _this5 = this;
      return this.datas.map(function (da) {
        var datum = {
          Data: da.Data,
          Ids: _this5.getIds(da.Tag)
        };
        return datum;
      });
    }

    /**
     * @param {string[]} ids 
     */
  }, {
    key: "getTag",
    value: function getTag(ids) {
      var _this6 = this;
      var tag = 0; // its basically a mask
      ids.forEach(function (id) {
        // get index of id in id list
        var index = _this6.identifiers.indexOf(id);
        if (index == -1) throw Error("Id not found in identifiers");
        var mask = 1 << index;
        tag |= mask;
      });
      return tag;
    }
    /**
     * @param {number} tag 
     */
  }, {
    key: "getIds",
    value: function getIds(tag) {
      var bitLen = this.identifiers.length;
      var ids = [];
      for (var i = 0; i < bitLen; i++) {
        var mask = 1 << i;
        if ((tag & mask) != 0) {
          var id = this.identifiers[i];
          ids.push(id);
        }
      }
      return ids;
    }
  }]);
  return FieldData;
}();
function jwtValid(jwt) {
  var decoded = jwt.split(".").map(function (a) {
    return a.replace(/-/g, '+').replace(/_/g, '/') + "==".slice(0, (3 - a.length % 4) % 3);
  });
  var header = atob(decoded[0]); // header 
  var payload = atob(decoded[1]); // payload

  if (decoded.length != 3) return false;
  try {
    var test_data = JSON.parse(header);
    if (test_data.typ != "JWT" || test_data.alg != "EdDSA") return false;
    test_data = JSON.parse(payload);
    if (test_data.uid == null || test_data.exp == null) return false;
  } catch (_unused2) {
    return false;
  }
  return true;
}