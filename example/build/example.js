/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./dist/color/color.js":
/*!*****************************!*\
  !*** ./dist/color/color.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nclass Color {\n    constructor(r, g, b, a = 255) {\n        this.r = r;\n        this.g = g;\n        this.b = b;\n        this.a = a;\n    }\n}\nexports[\"default\"] = Color;\n\n\n//# sourceURL=webpack://rastr_core/./dist/color/color.js?");

/***/ }),

/***/ "./dist/color/index.js":
/*!*****************************!*\
  !*** ./dist/color/index.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Color = void 0;\nvar color_1 = __webpack_require__(/*! ./color */ \"./dist/color/color.js\");\nObject.defineProperty(exports, \"Color\", ({ enumerable: true, get: function () { return __importDefault(color_1).default; } }));\n\n\n//# sourceURL=webpack://rastr_core/./dist/color/index.js?");

/***/ }),

/***/ "./dist/index.js":
/*!***********************!*\
  !*** ./dist/index.js ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Layer = exports.Color = void 0;\nvar color_1 = __webpack_require__(/*! ./color */ \"./dist/color/index.js\");\nObject.defineProperty(exports, \"Color\", ({ enumerable: true, get: function () { return color_1.Color; } }));\nvar layer_1 = __webpack_require__(/*! ./layer */ \"./dist/layer/index.js\");\nObject.defineProperty(exports, \"Layer\", ({ enumerable: true, get: function () { return layer_1.Layer; } }));\n\n\n//# sourceURL=webpack://rastr_core/./dist/index.js?");

/***/ }),

/***/ "./dist/layer/index.js":
/*!*****************************!*\
  !*** ./dist/layer/index.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Layer = void 0;\nvar layer_1 = __webpack_require__(/*! ./layer */ \"./dist/layer/layer.js\");\nObject.defineProperty(exports, \"Layer\", ({ enumerable: true, get: function () { return __importDefault(layer_1).default; } }));\n\n\n//# sourceURL=webpack://rastr_core/./dist/layer/index.js?");

/***/ }),

/***/ "./dist/layer/layer.js":
/*!*****************************!*\
  !*** ./dist/layer/layer.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {\n    if (kind === \"m\") throw new TypeError(\"Private method is not writable\");\n    if (kind === \"a\" && !f) throw new TypeError(\"Private accessor was defined without a setter\");\n    if (typeof state === \"function\" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError(\"Cannot write private member to an object whose class did not declare it\");\n    return (kind === \"a\" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;\n};\nvar __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {\n    if (kind === \"a\" && !f) throw new TypeError(\"Private accessor was defined without a getter\");\n    if (typeof state === \"function\" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError(\"Cannot read private member from an object whose class did not declare it\");\n    return kind === \"m\" ? f : kind === \"a\" ? f.call(receiver) : f ? f.value : state.get(receiver);\n};\nvar _Layer_canvas, _Layer_ctx2d;\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst color_1 = __webpack_require__(/*! ../color */ \"./dist/color/index.js\");\nclass Layer {\n    constructor(width = 0, height = 0, opts = {}) {\n        _Layer_canvas.set(this, void 0);\n        _Layer_ctx2d.set(this, void 0);\n        if (width === 0 || height === 0) {\n            throw new Error('Incorrect constructor parameters.');\n        }\n        __classPrivateFieldSet(this, _Layer_canvas, document.createElement('canvas'), \"f\");\n        __classPrivateFieldGet(this, _Layer_canvas, \"f\").width = width;\n        __classPrivateFieldGet(this, _Layer_canvas, \"f\").height = height;\n        const ctx = __classPrivateFieldGet(this, _Layer_canvas, \"f\").getContext('2d');\n        if (ctx === null) {\n            throw new Error('Error create 2D context');\n        }\n        __classPrivateFieldSet(this, _Layer_ctx2d, ctx, \"f\");\n        if (opts.color instanceof color_1.Color) {\n            this.fill(opts.color);\n        }\n        if (opts.image instanceof ImageBitmap) {\n            __classPrivateFieldGet(this, _Layer_ctx2d, \"f\").drawImage(opts.image, 0, 0, width, height);\n        }\n    }\n    get canvas() {\n        return __classPrivateFieldGet(this, _Layer_canvas, \"f\");\n    }\n    get width() {\n        return __classPrivateFieldGet(this, _Layer_canvas, \"f\").width;\n    }\n    get height() {\n        return __classPrivateFieldGet(this, _Layer_canvas, \"f\").height;\n    }\n    fill(color) {\n        this.rectangle(0, 0, this.width, this.height, color);\n    }\n    rectangle(x, y, w, h, color) {\n        __classPrivateFieldGet(this, _Layer_ctx2d, \"f\").fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 256})`;\n        __classPrivateFieldGet(this, _Layer_ctx2d, \"f\").fillRect(x, y, w, h);\n    }\n    setAlpha(value) {\n        const imageData = __classPrivateFieldGet(this, _Layer_ctx2d, \"f\").getImageData(0, 0, __classPrivateFieldGet(this, _Layer_canvas, \"f\").width, __classPrivateFieldGet(this, _Layer_canvas, \"f\").height);\n        for (let i = 3; i < imageData.data.length; i += 4) {\n            imageData.data[i] = value;\n        }\n        __classPrivateFieldGet(this, _Layer_ctx2d, \"f\").putImageData(imageData, 0, 0);\n    }\n    static fromFile(source) {\n        return createImageBitmap(source).then(image => {\n            return new Layer(image.width, image.height, { image });\n        });\n    }\n}\nexports[\"default\"] = Layer;\n_Layer_canvas = new WeakMap(), _Layer_ctx2d = new WeakMap();\n\n\n//# sourceURL=webpack://rastr_core/./dist/layer/layer.js?");

/***/ }),

/***/ "./example/index.js":
/*!**************************!*\
  !*** ./example/index.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _dist__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dist */ \"./dist/index.js\");\n\n\nconst canvas = document.getElementById('canvas')\nconst inputFile = document.getElementById('input-image')\nconst rectBtn = document.getElementById('rect')\n\nconst canvasCtx = canvas.getContext('2d')\n\nconst layers = []\n\nfunction globalRedraw() {\n    let pos = 0;\n\n    for (const layer of layers) {\n        canvasCtx.drawImage(layer.canvas, pos, pos)\n        pos += 100;\n    }\n}\n\ninputFile.addEventListener('change', function () {\n    _dist__WEBPACK_IMPORTED_MODULE_0__.Layer.fromFile(inputFile.files[0]).then(layer => {\n        layers.push(layer);\n        layer.setAlpha(100)\n        globalRedraw();\n    })\n})\n\nrectBtn.addEventListener('click', function () {\n    const lay1 = new _dist__WEBPACK_IMPORTED_MODULE_0__.Layer(500, 500);\n    const lay2 = new _dist__WEBPACK_IMPORTED_MODULE_0__.Layer(500, 500);\n\n    layers.push(lay1)\n    layers.push(lay2)\n\n    lay1.rectangle(0, 0, 250, 250, new _dist__WEBPACK_IMPORTED_MODULE_0__.Color(128, 168, 243, 256))\n    lay2.rectangle(0, 0, 250, 250, new _dist__WEBPACK_IMPORTED_MODULE_0__.Color(130, 20, 20, 256))\n\n    lay2.setAlpha(150)\n\n    globalRedraw();\n})\n\n\n\n\n\n//# sourceURL=webpack://rastr_core/./example/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./example/index.js");
/******/ 	
/******/ })()
;