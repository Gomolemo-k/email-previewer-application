"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/call-bound@1.0.3";
exports.ids = ["vendor-chunks/call-bound@1.0.3"];
exports.modules = {

/***/ "(action-browser)/./node_modules/.pnpm/call-bound@1.0.3/node_modules/call-bound/index.js":
/*!******************************************************************************!*\
  !*** ./node_modules/.pnpm/call-bound@1.0.3/node_modules/call-bound/index.js ***!
  \******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar GetIntrinsic = __webpack_require__(/*! get-intrinsic */ \"(action-browser)/./node_modules/.pnpm/get-intrinsic@1.2.7/node_modules/get-intrinsic/index.js\");\n\nvar callBindBasic = __webpack_require__(/*! call-bind-apply-helpers */ \"(action-browser)/./node_modules/.pnpm/call-bind-apply-helpers@1.0.2/node_modules/call-bind-apply-helpers/index.js\");\n\n/** @type {(thisArg: string, searchString: string, position?: number) => number} */\nvar $indexOf = callBindBasic([GetIntrinsic('%String.prototype.indexOf%')]);\n\n/** @type {import('.')} */\nmodule.exports = function callBoundIntrinsic(name, allowMissing) {\n\t// eslint-disable-next-line no-extra-parens\n\tvar intrinsic = /** @type {Parameters<typeof callBindBasic>[0][0]} */ (GetIntrinsic(name, !!allowMissing));\n\tif (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {\n\t\treturn callBindBasic([intrinsic]);\n\t}\n\treturn intrinsic;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFjdGlvbi1icm93c2VyKS8uL25vZGVfbW9kdWxlcy8ucG5wbS9jYWxsLWJvdW5kQDEuMC4zL25vZGVfbW9kdWxlcy9jYWxsLWJvdW5kL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLG1CQUFtQixtQkFBTyxDQUFDLG9IQUFlOztBQUUxQyxvQkFBb0IsbUJBQU8sQ0FBQyxrSkFBeUI7O0FBRXJELFdBQVcsc0VBQXNFO0FBQ2pGOztBQUVBLFdBQVcsYUFBYTtBQUN4QjtBQUNBO0FBQ0EsNEJBQTRCLHdDQUF3QztBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvZ29tb2xlbW9rZ2F0aXRzb2UvcHJvamVjdHMvZW1haWwtcHJldmlld2VyLWFwcGxpY2F0aW9uL25vZGVfbW9kdWxlcy8ucG5wbS9jYWxsLWJvdW5kQDEuMC4zL25vZGVfbW9kdWxlcy9jYWxsLWJvdW5kL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcblxudmFyIGNhbGxCaW5kQmFzaWMgPSByZXF1aXJlKCdjYWxsLWJpbmQtYXBwbHktaGVscGVycycpO1xuXG4vKiogQHR5cGUgeyh0aGlzQXJnOiBzdHJpbmcsIHNlYXJjaFN0cmluZzogc3RyaW5nLCBwb3NpdGlvbj86IG51bWJlcikgPT4gbnVtYmVyfSAqL1xudmFyICRpbmRleE9mID0gY2FsbEJpbmRCYXNpYyhbR2V0SW50cmluc2ljKCclU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mJScpXSk7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuJyl9ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNhbGxCb3VuZEludHJpbnNpYyhuYW1lLCBhbGxvd01pc3NpbmcpIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWV4dHJhLXBhcmVuc1xuXHR2YXIgaW50cmluc2ljID0gLyoqIEB0eXBlIHtQYXJhbWV0ZXJzPHR5cGVvZiBjYWxsQmluZEJhc2ljPlswXVswXX0gKi8gKEdldEludHJpbnNpYyhuYW1lLCAhIWFsbG93TWlzc2luZykpO1xuXHRpZiAodHlwZW9mIGludHJpbnNpYyA9PT0gJ2Z1bmN0aW9uJyAmJiAkaW5kZXhPZihuYW1lLCAnLnByb3RvdHlwZS4nKSA+IC0xKSB7XG5cdFx0cmV0dXJuIGNhbGxCaW5kQmFzaWMoW2ludHJpbnNpY10pO1xuXHR9XG5cdHJldHVybiBpbnRyaW5zaWM7XG59O1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(action-browser)/./node_modules/.pnpm/call-bound@1.0.3/node_modules/call-bound/index.js\n");

/***/ })

};
;