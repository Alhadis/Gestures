#!/usr/bin/env node
/**
 * Stupidly-simple server for testing module over a local network.
 *
 * Emphasis on the word "stupidly". Don't use this in production.
 * Feel free to use it as a template for lightweight local development,
 * because installing ExpressJS for basic static demos is pure overkill.
 */
"use strict";

const HTTP   = require("http");
const Path   = require("path");
const fs     = require("fs");


HTTP.createServer((request, response) => {
	let code = 200;
	let type = "text/plain; charset=UTF-8";
	let data = "Nothing loaded or requested.";

	let path = remap(sanitise(request.url));
	let name = Path.parse(path).base;
	if(/\.([-\w]+)$/.test(name)){
		const types = new Map([
			["css",  ["text/css",               "UTF-8"]],
			["htm",  ["text/html",              "UTF-8"]],
			["html", ["text/html",              "UTF-8"]],
			["json", ["application/json",       "UTF-8"]],
			["js",   ["application/javascript", "UTF-8"]],
			["mjs",  ["application/javascript", "UTF-8"]],
			["txt",  ["text/plain",             "UTF-8"]],
			["gif",  ["image/gif",              "binary"]],
			["jpg",  ["image/jpeg",             "binary"]],
			["jpeg", ["image/jpeg",             "binary"]],
			["png",  ["image/png",              "binary"]],
			["apng", ["image/png",              "binary"]],
			["svg",  ["image/svg+xml",          "UTF-8"]],
			["webp", ["image/webp",             "binary"]],
		]);

		const extension = RegExp.lastParen.toLowerCase();
		const metadata = types.get(extension);
		
		if(metadata){
			const [mimeType, charset] = metadata;
			if("binary" !== charset)
				type = `${mimeType}; charset=${charset}`;
			data = read(filePath, charset);
		}
		// Unknown format being loaded; just assume it's text-based.
		else{
			type = "text/plain; charset=ISO-8859-1";
			data = read(filePath, "latin1");
		}

		// Missing file or restricted access
		if(null === data){
			code = 404;
			data = `Could not locate requested file: ${request.url}`;
			type = "text/plain; charset=UTF-8";
		}
	}

	response.writeHead(code, {"Content-Type": type});
	response.write(data);
	response.end();
}).listen(1337);



/**
 * Crudely slurp an entire file into memory.
 *
 * If the file doesn't exist or can't be accessed,
 * the function returns a value of `null` instead.
 *
 * @internal
 * @param {String} filePath
 * @param {String} [encoding="utf8"]
 * @return {String|null}
 */
function read(filePath, encoding = "utf8"){
	try{
		filePath = sanitise(filePath);
		return fs.readFileSync(filePath, encoding).toString();
	}
	catch(error){
		console.error(`Error reading file`, error);
		return null;
	}
}


/**
 * Perform ad hoc/site-specific path remapping.
 *
 * @example remap("public/index.html", [
 *    ["public/app.js", "src/app/loader.js"],
 *    ["public/%.html", "views/%.tmpl"],
 * ]) == "views/index.tmpl";
 *
 * @param  {String} input
 * @param  {Array}  [rules=[]]
 * @return {String}
 * @internal
 */
function remap(input, rules = []){
	let output = input;
	for(let [pattern, replacement] of rules){
		pattern = pattern.replace(/([/\\^$*+?{}\[\]().|])/g, "\\$1");
		output = output.replace(new RegExp(pattern, "g"), replacement);
	}
	return output;
}


/**
 * Normalise and sanitise a project-relative filepath.
 *
 * Requests for "/" are replaced by "/index.htm" instead.
 * All files are accessed relative to the second parameter,
 * which defaults to the directory containing the script.
 *
 * @param {String} input  - A path like ".././file.js" or "/robots.txt".
 * @param {String} [base] - Directory from which to resolve relative paths.
 * @param {String} [index="index.htm"] - File to use if input matches base.
 * @return {String}
 */
function sanitise(input, base = __dirname, index = "index.htm"){
	base = base.replace(/\/$/, "");

	// Normalise path separators and pointless "." segments
	input = String(input || "").split(/[\\\//]+/).filter(s => s && "." !== s).join("/");

	// Expand "/" into a request for "index.htm".
	if(!input || "/" === input)
		input = "/" + index;

	// Resolve absolute path relative to base directory
	input = path.resolve(path.join(base, input));

	// Make sure ".." segments don't resolve to paths outside base
	if(0 !== input.indexOf(base + "/"))
		input = base + "/" + index;

	return input;
}
