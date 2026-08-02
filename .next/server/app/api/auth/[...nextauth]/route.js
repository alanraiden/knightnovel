"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5CALAN%5CDownloads%5Cknight-novel%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CALAN%5CDownloads%5Cknight-novel&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5CALAN%5CDownloads%5Cknight-novel%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CALAN%5CDownloads%5Cknight-novel&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_ALAN_Downloads_knight_novel_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\ALAN\\\\Downloads\\\\knight-novel\\\\src\\\\app\\\\api\\\\auth\\\\[...nextauth]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_ALAN_Downloads_knight_novel_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNBTEFOJTVDRG93bmxvYWRzJTVDa25pZ2h0LW5vdmVsJTVDc3JjJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNBTEFOJTVDRG93bmxvYWRzJTVDa25pZ2h0LW5vdmVsJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNzQztBQUNuSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2tuaWdodC1ub3ZlbC8/MDU3YSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxBTEFOXFxcXERvd25sb2Fkc1xcXFxrbmlnaHQtbm92ZWxcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxbLi4ubmV4dGF1dGhdXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF1cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXEFMQU5cXFxcRG93bmxvYWRzXFxcXGtuaWdodC1ub3ZlbFxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXFsuLi5uZXh0YXV0aF1cXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5CALAN%5CDownloads%5Cknight-novel%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CALAN%5CDownloads%5Cknight-novel&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBaUM7QUFDUTtBQUV6QyxNQUFNRSxVQUFVRixnREFBUUEsQ0FBQ0Msa0RBQVdBO0FBQ08iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9rbmlnaHQtbm92ZWwvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHM/MDA5OCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV4dEF1dGggZnJvbSBcIm5leHQtYXV0aFwiO1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tIFwiQC9saWIvYXV0aFwiO1xuXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpO1xuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9O1xuIl0sIm5hbWVzIjpbIk5leHRBdXRoIiwiYXV0aE9wdGlvbnMiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _auth_mongodb_adapter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @auth/mongodb-adapter */ \"(rsc)/./node_modules/@auth/mongodb-adapter/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./src/lib/db.ts\");\n\n\n\n\n\n// The adapter persists OAuth (Google) sign-ins as real MongoDB documents\n// with a real ObjectId — without it, Google users would never get a users\n// collection record, which breaks both admin role-checking and any\n// per-user query (bookmarks, reading progress, etc). It's only wired up\n// when MONGODB_URI is actually set, so local dev without a database still\n// works (Google login just won't persist a user in that case).\nconst adapter = process.env.MONGODB_URI ? (0,_auth_mongodb_adapter__WEBPACK_IMPORTED_MODULE_2__.MongoDBAdapter)((0,_lib_db__WEBPACK_IMPORTED_MODULE_4__.getMongoClientPromise)()) : undefined;\nconst authOptions = {\n    adapter,\n    session: {\n        strategy: \"jwt\"\n    },\n    pages: {\n        signIn: \"/login\"\n    },\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID || \"\",\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET || \"\"\n        }),\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"Email\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) return null;\n                const { users } = await (0,_lib_db__WEBPACK_IMPORTED_MODULE_4__.collections)();\n                const user = await users.findOne({\n                    email: credentials.email\n                });\n                if (!user?.passwordHash) return null;\n                const valid = await bcryptjs__WEBPACK_IMPORTED_MODULE_3___default().compare(credentials.password, user.passwordHash);\n                if (!valid) return null;\n                return {\n                    id: user._id.toString(),\n                    email: user.email,\n                    name: user.displayName,\n                    image: user.avatarUrl,\n                    role: user.role\n                };\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role ?? \"user\";\n                token.id = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.role = token.role ?? \"user\";\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUN3RDtBQUNVO0FBQ1g7QUFDekI7QUFDZ0M7QUFFOUQseUVBQXlFO0FBQ3pFLDBFQUEwRTtBQUMxRSxtRUFBbUU7QUFDbkUsd0VBQXdFO0FBQ3hFLDBFQUEwRTtBQUMxRSwrREFBK0Q7QUFDL0QsTUFBTU0sVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxXQUFXLEdBQUdQLHFFQUFjQSxDQUFDRyw4REFBcUJBLE1BQU1LO0FBRTdFLE1BQU1DLGNBQStCO0lBQzFDTDtJQUNBTSxTQUFTO1FBQUVDLFVBQVU7SUFBTTtJQUMzQkMsT0FBTztRQUFFQyxRQUFRO0lBQVM7SUFDMUJDLFdBQVc7UUFDVGhCLHNFQUFjQSxDQUFDO1lBQ2JpQixVQUFVVixRQUFRQyxHQUFHLENBQUNVLGdCQUFnQixJQUFJO1lBQzFDQyxjQUFjWixRQUFRQyxHQUFHLENBQUNZLG9CQUFvQixJQUFJO1FBQ3BEO1FBQ0FuQiwyRUFBbUJBLENBQUM7WUFDbEJvQixNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVUsT0FBTztnQkFDMUQsTUFBTSxFQUFFRSxLQUFLLEVBQUUsR0FBRyxNQUFNeEIsb0RBQVdBO2dCQUNuQyxNQUFNeUIsT0FBTyxNQUFNRCxNQUFNRSxPQUFPLENBQUM7b0JBQUVQLE9BQU9ELFlBQVlDLEtBQUs7Z0JBQUM7Z0JBQzVELElBQUksQ0FBQ00sTUFBTUUsY0FBYyxPQUFPO2dCQUVoQyxNQUFNQyxRQUFRLE1BQU03Qix1REFBYyxDQUFDbUIsWUFBWUksUUFBUSxFQUFFRyxLQUFLRSxZQUFZO2dCQUMxRSxJQUFJLENBQUNDLE9BQU8sT0FBTztnQkFFbkIsT0FBTztvQkFDTEUsSUFBSUwsS0FBS00sR0FBRyxDQUFFQyxRQUFRO29CQUN0QmIsT0FBT00sS0FBS04sS0FBSztvQkFDakJGLE1BQU1RLEtBQUtRLFdBQVc7b0JBQ3RCQyxPQUFPVCxLQUFLVSxTQUFTO29CQUNyQkMsTUFBTVgsS0FBS1csSUFBSTtnQkFDakI7WUFDRjtRQUNGO0tBQ0Q7SUFDREMsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFZCxJQUFJLEVBQUU7WUFDdkIsSUFBSUEsTUFBTTtnQkFDUmMsTUFBTUgsSUFBSSxHQUFHLEtBQWNBLElBQUksSUFBSTtnQkFDbkNHLE1BQU1ULEVBQUUsR0FBRyxLQUFjQSxFQUFFO1lBQzdCO1lBQ0EsT0FBT1M7UUFDVDtRQUNBLE1BQU0vQixTQUFRLEVBQUVBLE9BQU8sRUFBRStCLEtBQUssRUFBRTtZQUM5QixJQUFJL0IsUUFBUWlCLElBQUksRUFBRTtnQkFDZmpCLFFBQVFpQixJQUFJLENBQVNXLElBQUksR0FBR0csTUFBTUgsSUFBSSxJQUFJO2dCQUMxQzVCLFFBQVFpQixJQUFJLENBQVNLLEVBQUUsR0FBR1MsTUFBTVQsRUFBRTtZQUNyQztZQUNBLE9BQU90QjtRQUNUO0lBQ0Y7QUFDRixFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8va25pZ2h0LW5vdmVsLy4vc3JjL2xpYi9hdXRoLnRzPzY2OTIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOZXh0QXV0aE9wdGlvbnMgfSBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlXCI7XG5pbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFsc1wiO1xuaW1wb3J0IHsgTW9uZ29EQkFkYXB0ZXIgfSBmcm9tIFwiQGF1dGgvbW9uZ29kYi1hZGFwdGVyXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuaW1wb3J0IHsgY29sbGVjdGlvbnMsIGdldE1vbmdvQ2xpZW50UHJvbWlzZSB9IGZyb20gXCJAL2xpYi9kYlwiO1xuXG4vLyBUaGUgYWRhcHRlciBwZXJzaXN0cyBPQXV0aCAoR29vZ2xlKSBzaWduLWlucyBhcyByZWFsIE1vbmdvREIgZG9jdW1lbnRzXG4vLyB3aXRoIGEgcmVhbCBPYmplY3RJZCDigJQgd2l0aG91dCBpdCwgR29vZ2xlIHVzZXJzIHdvdWxkIG5ldmVyIGdldCBhIHVzZXJzXG4vLyBjb2xsZWN0aW9uIHJlY29yZCwgd2hpY2ggYnJlYWtzIGJvdGggYWRtaW4gcm9sZS1jaGVja2luZyBhbmQgYW55XG4vLyBwZXItdXNlciBxdWVyeSAoYm9va21hcmtzLCByZWFkaW5nIHByb2dyZXNzLCBldGMpLiBJdCdzIG9ubHkgd2lyZWQgdXBcbi8vIHdoZW4gTU9OR09EQl9VUkkgaXMgYWN0dWFsbHkgc2V0LCBzbyBsb2NhbCBkZXYgd2l0aG91dCBhIGRhdGFiYXNlIHN0aWxsXG4vLyB3b3JrcyAoR29vZ2xlIGxvZ2luIGp1c3Qgd29uJ3QgcGVyc2lzdCBhIHVzZXIgaW4gdGhhdCBjYXNlKS5cbmNvbnN0IGFkYXB0ZXIgPSBwcm9jZXNzLmVudi5NT05HT0RCX1VSSSA/IE1vbmdvREJBZGFwdGVyKGdldE1vbmdvQ2xpZW50UHJvbWlzZSgpKSA6IHVuZGVmaW5lZDtcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XG4gIGFkYXB0ZXIsXG4gIHNlc3Npb246IHsgc3RyYXRlZ3k6IFwiand0XCIgfSxcbiAgcGFnZXM6IHsgc2lnbkluOiBcIi9sb2dpblwiIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIEdvb2dsZVByb3ZpZGVyKHtcbiAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEIHx8IFwiXCIsXG4gICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUIHx8IFwiXCIsXG4gICAgfSksXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiBcIkVtYWlsXCIsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiIH0sXG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCB7IHVzZXJzIH0gPSBhd2FpdCBjb2xsZWN0aW9ucygpO1xuICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgdXNlcnMuZmluZE9uZSh7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCB9KTtcbiAgICAgICAgaWYgKCF1c2VyPy5wYXNzd29yZEhhc2gpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoY3JlZGVudGlhbHMucGFzc3dvcmQsIHVzZXIucGFzc3dvcmRIYXNoKTtcbiAgICAgICAgaWYgKCF2YWxpZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5faWQhLnRvU3RyaW5nKCksXG4gICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgbmFtZTogdXNlci5kaXNwbGF5TmFtZSxcbiAgICAgICAgICBpbWFnZTogdXNlci5hdmF0YXJVcmwsXG4gICAgICAgICAgcm9sZTogdXNlci5yb2xlLFxuICAgICAgICB9IGFzIGFueTtcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLnJvbGUgPSAodXNlciBhcyBhbnkpLnJvbGUgPz8gXCJ1c2VyXCI7XG4gICAgICAgIHRva2VuLmlkID0gKHVzZXIgYXMgYW55KS5pZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9LFxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XG4gICAgICBpZiAoc2Vzc2lvbi51c2VyKSB7XG4gICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5yb2xlID0gdG9rZW4ucm9sZSA/PyBcInVzZXJcIjtcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLmlkID0gdG9rZW4uaWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxufTtcbiJdLCJuYW1lcyI6WyJHb29nbGVQcm92aWRlciIsIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJNb25nb0RCQWRhcHRlciIsImJjcnlwdCIsImNvbGxlY3Rpb25zIiwiZ2V0TW9uZ29DbGllbnRQcm9taXNlIiwiYWRhcHRlciIsInByb2Nlc3MiLCJlbnYiLCJNT05HT0RCX1VSSSIsInVuZGVmaW5lZCIsImF1dGhPcHRpb25zIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwicGFnZXMiLCJzaWduSW4iLCJwcm92aWRlcnMiLCJjbGllbnRJZCIsIkdPT0dMRV9DTElFTlRfSUQiLCJjbGllbnRTZWNyZXQiLCJHT09HTEVfQ0xJRU5UX1NFQ1JFVCIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJ1c2VycyIsInVzZXIiLCJmaW5kT25lIiwicGFzc3dvcmRIYXNoIiwidmFsaWQiLCJjb21wYXJlIiwiaWQiLCJfaWQiLCJ0b1N0cmluZyIsImRpc3BsYXlOYW1lIiwiaW1hZ2UiLCJhdmF0YXJVcmwiLCJyb2xlIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/db.ts":
/*!***********************!*\
  !*** ./src/lib/db.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   collections: () => (/* binding */ collections),\n/* harmony export */   getDb: () => (/* binding */ getDb),\n/* harmony export */   getMongoClientPromise: () => (/* binding */ getMongoClientPromise)\n/* harmony export */ });\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongodb */ \"mongodb\");\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongodb__WEBPACK_IMPORTED_MODULE_0__);\n\nconst uri = process.env.MONGODB_URI;\nconst dbName = process.env.MONGODB_DB || \"knightnovel\";\nif (!uri) {\n    // Intentionally not thrown at import time in dev so the app can still\n    // render pages backed by seed data before MONGODB_URI is configured.\n    console.warn(\"[db] MONGODB_URI is not set. API routes that touch MongoDB will fail until it is configured in .env.local.\");\n}\nlet client;\nlet clientPromise;\nfunction getClientPromise() {\n    if (!uri) {\n        throw new Error(\"MONGODB_URI is not configured\");\n    }\n    if (true) {\n        // Reuse the client across HMR reloads in dev.\n        if (!global._mongoClientPromise) {\n            client = new mongodb__WEBPACK_IMPORTED_MODULE_0__.MongoClient(uri);\n            global._mongoClientPromise = client.connect();\n        }\n        return global._mongoClientPromise;\n    }\n    if (!clientPromise) {\n        client = new mongodb__WEBPACK_IMPORTED_MODULE_0__.MongoClient(uri);\n        clientPromise = client.connect();\n    }\n    return clientPromise;\n}\nasync function getDb() {\n    const c = await getClientPromise();\n    return c.db(dbName);\n}\n// Exposed for the NextAuth MongoDB adapter, which wants a bare\n// Promise<MongoClient> (not wrapped in getDb()). Reuses the same singleton\n// connection as everything else in this file.\nfunction getMongoClientPromise() {\n    return getClientPromise();\n}\n// Convenience collection getters — keeps collection names in one place.\nasync function collections() {\n    const db = await getDb();\n    return {\n        users: db.collection(\"users\"),\n        novels: db.collection(\"novels\"),\n        chapters: db.collection(\"chapters\"),\n        readingProgress: db.collection(\"readingProgress\"),\n        bookmarks: db.collection(\"bookmarks\"),\n        favorites: db.collection(\"favorites\"),\n        folders: db.collection(\"folders\"),\n        ratingsReviews: db.collection(\"ratingsReviews\"),\n        comments: db.collection(\"comments\"),\n        commentVotes: db.collection(\"commentVotes\"),\n        reports: db.collection(\"reports\"),\n        notifications: db.collection(\"notifications\"),\n        announcements: db.collection(\"announcements\")\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2RiLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQTBDO0FBRTFDLE1BQU1DLE1BQU1DLFFBQVFDLEdBQUcsQ0FBQ0MsV0FBVztBQUNuQyxNQUFNQyxTQUFTSCxRQUFRQyxHQUFHLENBQUNHLFVBQVUsSUFBSTtBQUV6QyxJQUFJLENBQUNMLEtBQUs7SUFDUixzRUFBc0U7SUFDdEUscUVBQXFFO0lBQ3JFTSxRQUFRQyxJQUFJLENBQ1Y7QUFFSjtBQUVBLElBQUlDO0FBQ0osSUFBSUM7QUFPSixTQUFTQztJQUNQLElBQUksQ0FBQ1YsS0FBSztRQUNSLE1BQU0sSUFBSVcsTUFBTTtJQUNsQjtJQUVBLElBQUlWLElBQXNDLEVBQUU7UUFDMUMsOENBQThDO1FBQzlDLElBQUksQ0FBQ1csT0FBT0MsbUJBQW1CLEVBQUU7WUFDL0JMLFNBQVMsSUFBSVQsZ0RBQVdBLENBQUNDO1lBQ3pCWSxPQUFPQyxtQkFBbUIsR0FBR0wsT0FBT00sT0FBTztRQUM3QztRQUNBLE9BQU9GLE9BQU9DLG1CQUFtQjtJQUNuQztJQUVBLElBQUksQ0FBQ0osZUFBZTtRQUNsQkQsU0FBUyxJQUFJVCxnREFBV0EsQ0FBQ0M7UUFDekJTLGdCQUFnQkQsT0FBT00sT0FBTztJQUNoQztJQUNBLE9BQU9MO0FBQ1Q7QUFFTyxlQUFlTTtJQUNwQixNQUFNQyxJQUFJLE1BQU1OO0lBQ2hCLE9BQU9NLEVBQUVDLEVBQUUsQ0FBQ2I7QUFDZDtBQUVBLCtEQUErRDtBQUMvRCwyRUFBMkU7QUFDM0UsOENBQThDO0FBQ3ZDLFNBQVNjO0lBQ2QsT0FBT1I7QUFDVDtBQUVBLHdFQUF3RTtBQUNqRSxlQUFlUztJQUNwQixNQUFNRixLQUFLLE1BQU1GO0lBQ2pCLE9BQU87UUFDTEssT0FBT0gsR0FBR0ksVUFBVSxDQUFDO1FBQ3JCQyxRQUFRTCxHQUFHSSxVQUFVLENBQUM7UUFDdEJFLFVBQVVOLEdBQUdJLFVBQVUsQ0FBQztRQUN4QkcsaUJBQWlCUCxHQUFHSSxVQUFVLENBQUM7UUFDL0JJLFdBQVdSLEdBQUdJLFVBQVUsQ0FBQztRQUN6QkssV0FBV1QsR0FBR0ksVUFBVSxDQUFDO1FBQ3pCTSxTQUFTVixHQUFHSSxVQUFVLENBQUM7UUFDdkJPLGdCQUFnQlgsR0FBR0ksVUFBVSxDQUFDO1FBQzlCUSxVQUFVWixHQUFHSSxVQUFVLENBQUM7UUFDeEJTLGNBQWNiLEdBQUdJLFVBQVUsQ0FBQztRQUM1QlUsU0FBU2QsR0FBR0ksVUFBVSxDQUFDO1FBQ3ZCVyxlQUFlZixHQUFHSSxVQUFVLENBQUM7UUFDN0JZLGVBQWVoQixHQUFHSSxVQUFVLENBQUM7SUFDL0I7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2tuaWdodC1ub3ZlbC8uL3NyYy9saWIvZGIudHM/OWU0ZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb25nb0NsaWVudCwgRGIgfSBmcm9tIFwibW9uZ29kYlwiO1xuXG5jb25zdCB1cmkgPSBwcm9jZXNzLmVudi5NT05HT0RCX1VSSTtcbmNvbnN0IGRiTmFtZSA9IHByb2Nlc3MuZW52Lk1PTkdPREJfREIgfHwgXCJrbmlnaHRub3ZlbFwiO1xuXG5pZiAoIXVyaSkge1xuICAvLyBJbnRlbnRpb25hbGx5IG5vdCB0aHJvd24gYXQgaW1wb3J0IHRpbWUgaW4gZGV2IHNvIHRoZSBhcHAgY2FuIHN0aWxsXG4gIC8vIHJlbmRlciBwYWdlcyBiYWNrZWQgYnkgc2VlZCBkYXRhIGJlZm9yZSBNT05HT0RCX1VSSSBpcyBjb25maWd1cmVkLlxuICBjb25zb2xlLndhcm4oXG4gICAgXCJbZGJdIE1PTkdPREJfVVJJIGlzIG5vdCBzZXQuIEFQSSByb3V0ZXMgdGhhdCB0b3VjaCBNb25nb0RCIHdpbGwgZmFpbCB1bnRpbCBpdCBpcyBjb25maWd1cmVkIGluIC5lbnYubG9jYWwuXCJcbiAgKTtcbn1cblxubGV0IGNsaWVudDogTW9uZ29DbGllbnQgfCB1bmRlZmluZWQ7XG5sZXQgY2xpZW50UHJvbWlzZTogUHJvbWlzZTxNb25nb0NsaWVudD4gfCB1bmRlZmluZWQ7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXZhclxuICB2YXIgX21vbmdvQ2xpZW50UHJvbWlzZTogUHJvbWlzZTxNb25nb0NsaWVudD4gfCB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGdldENsaWVudFByb21pc2UoKTogUHJvbWlzZTxNb25nb0NsaWVudD4ge1xuICBpZiAoIXVyaSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk1PTkdPREJfVVJJIGlzIG5vdCBjb25maWd1cmVkXCIpO1xuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcImRldmVsb3BtZW50XCIpIHtcbiAgICAvLyBSZXVzZSB0aGUgY2xpZW50IGFjcm9zcyBITVIgcmVsb2FkcyBpbiBkZXYuXG4gICAgaWYgKCFnbG9iYWwuX21vbmdvQ2xpZW50UHJvbWlzZSkge1xuICAgICAgY2xpZW50ID0gbmV3IE1vbmdvQ2xpZW50KHVyaSk7XG4gICAgICBnbG9iYWwuX21vbmdvQ2xpZW50UHJvbWlzZSA9IGNsaWVudC5jb25uZWN0KCk7XG4gICAgfVxuICAgIHJldHVybiBnbG9iYWwuX21vbmdvQ2xpZW50UHJvbWlzZTtcbiAgfVxuXG4gIGlmICghY2xpZW50UHJvbWlzZSkge1xuICAgIGNsaWVudCA9IG5ldyBNb25nb0NsaWVudCh1cmkpO1xuICAgIGNsaWVudFByb21pc2UgPSBjbGllbnQuY29ubmVjdCgpO1xuICB9XG4gIHJldHVybiBjbGllbnRQcm9taXNlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGIoKTogUHJvbWlzZTxEYj4ge1xuICBjb25zdCBjID0gYXdhaXQgZ2V0Q2xpZW50UHJvbWlzZSgpO1xuICByZXR1cm4gYy5kYihkYk5hbWUpO1xufVxuXG4vLyBFeHBvc2VkIGZvciB0aGUgTmV4dEF1dGggTW9uZ29EQiBhZGFwdGVyLCB3aGljaCB3YW50cyBhIGJhcmVcbi8vIFByb21pc2U8TW9uZ29DbGllbnQ+IChub3Qgd3JhcHBlZCBpbiBnZXREYigpKS4gUmV1c2VzIHRoZSBzYW1lIHNpbmdsZXRvblxuLy8gY29ubmVjdGlvbiBhcyBldmVyeXRoaW5nIGVsc2UgaW4gdGhpcyBmaWxlLlxuZXhwb3J0IGZ1bmN0aW9uIGdldE1vbmdvQ2xpZW50UHJvbWlzZSgpOiBQcm9taXNlPE1vbmdvQ2xpZW50PiB7XG4gIHJldHVybiBnZXRDbGllbnRQcm9taXNlKCk7XG59XG5cbi8vIENvbnZlbmllbmNlIGNvbGxlY3Rpb24gZ2V0dGVycyDigJQga2VlcHMgY29sbGVjdGlvbiBuYW1lcyBpbiBvbmUgcGxhY2UuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29sbGVjdGlvbnMoKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgcmV0dXJuIHtcbiAgICB1c2VyczogZGIuY29sbGVjdGlvbihcInVzZXJzXCIpLFxuICAgIG5vdmVsczogZGIuY29sbGVjdGlvbihcIm5vdmVsc1wiKSxcbiAgICBjaGFwdGVyczogZGIuY29sbGVjdGlvbihcImNoYXB0ZXJzXCIpLFxuICAgIHJlYWRpbmdQcm9ncmVzczogZGIuY29sbGVjdGlvbihcInJlYWRpbmdQcm9ncmVzc1wiKSxcbiAgICBib29rbWFya3M6IGRiLmNvbGxlY3Rpb24oXCJib29rbWFya3NcIiksXG4gICAgZmF2b3JpdGVzOiBkYi5jb2xsZWN0aW9uKFwiZmF2b3JpdGVzXCIpLFxuICAgIGZvbGRlcnM6IGRiLmNvbGxlY3Rpb24oXCJmb2xkZXJzXCIpLFxuICAgIHJhdGluZ3NSZXZpZXdzOiBkYi5jb2xsZWN0aW9uKFwicmF0aW5nc1Jldmlld3NcIiksXG4gICAgY29tbWVudHM6IGRiLmNvbGxlY3Rpb24oXCJjb21tZW50c1wiKSxcbiAgICBjb21tZW50Vm90ZXM6IGRiLmNvbGxlY3Rpb24oXCJjb21tZW50Vm90ZXNcIiksXG4gICAgcmVwb3J0czogZGIuY29sbGVjdGlvbihcInJlcG9ydHNcIiksIC8vIGNvdmVycyByZXBvcnRlZCBjb21tZW50cywgcmV2aWV3cywgdXNlcnMsIEFORCByZXBvcnRlZCBzdGlja2Vyc1xuICAgIG5vdGlmaWNhdGlvbnM6IGRiLmNvbGxlY3Rpb24oXCJub3RpZmljYXRpb25zXCIpLFxuICAgIGFubm91bmNlbWVudHM6IGRiLmNvbGxlY3Rpb24oXCJhbm5vdW5jZW1lbnRzXCIpLFxuICB9O1xufVxuIl0sIm5hbWVzIjpbIk1vbmdvQ2xpZW50IiwidXJpIiwicHJvY2VzcyIsImVudiIsIk1PTkdPREJfVVJJIiwiZGJOYW1lIiwiTU9OR09EQl9EQiIsImNvbnNvbGUiLCJ3YXJuIiwiY2xpZW50IiwiY2xpZW50UHJvbWlzZSIsImdldENsaWVudFByb21pc2UiLCJFcnJvciIsImdsb2JhbCIsIl9tb25nb0NsaWVudFByb21pc2UiLCJjb25uZWN0IiwiZ2V0RGIiLCJjIiwiZGIiLCJnZXRNb25nb0NsaWVudFByb21pc2UiLCJjb2xsZWN0aW9ucyIsInVzZXJzIiwiY29sbGVjdGlvbiIsIm5vdmVscyIsImNoYXB0ZXJzIiwicmVhZGluZ1Byb2dyZXNzIiwiYm9va21hcmtzIiwiZmF2b3JpdGVzIiwiZm9sZGVycyIsInJhdGluZ3NSZXZpZXdzIiwiY29tbWVudHMiLCJjb21tZW50Vm90ZXMiLCJyZXBvcnRzIiwibm90aWZpY2F0aW9ucyIsImFubm91bmNlbWVudHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/db.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/uuid","vendor-chunks/@auth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5CALAN%5CDownloads%5Cknight-novel%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CALAN%5CDownloads%5Cknight-novel&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();