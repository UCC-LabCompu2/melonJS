/*!
 * melonJS Game Engine - v15.0.0
 * http://www.melonjs.org
 * melonjs is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * @copyright (C) 2011 - 2023 Olivier Biot (AltByte Pte Ltd)
 */
import { isBoolean, isNumeric } from '../../utils/string.js';

/**
 * set and interpret a TMX property value
 * @ignore
 */
function setTMXValue(name, type, value) {
    var match;

    if (typeof(value) !== "string") {
        // Value is already normalized (e.g. with JSON maps)
        return value;
    }

    switch (type) {

        case "int" :
        case "float" :
            value = Number(value);
            break;

        case "bool" :
            value = (value === "true");
            break;

        default :
            // try to parse it anyway
            if (!value || isBoolean(value)) {
                // if value not defined or boolean
                value = value ? (value === "true") : true;
            }
            else if (isNumeric(value)) {
                // check if numeric
                value = Number(value);
            }
            else if (value.search(/^json:/i) === 0) {
                // try to parse it
                match = value.split(/^json:/i)[1];
                try {
                    value = JSON.parse(match);
                }
                catch (e) {
                    throw new Error("Unable to parse JSON: " + match);
                }
            }
            else if (value.search(/^eval:/i) === 0) {
                // try to evaluate it
                match = value.split(/^eval:/i)[1];
                try {
                    // eslint-disable-next-line
                    value = Function("'use strict';return (" + match + ")")();
                }
                catch (e) {
                    throw new Error("Unable to evaluate: " + match);
                }
            }
            else if (
                ((match = value.match(/^#([\da-fA-F])([\da-fA-F]{3})$/))) ||
                ((match = value.match(/^#([\da-fA-F]{2})([\da-fA-F]{6})$/)))
            ) {
                value = "#" + match[2] + match[1];
            }

            // normalize values
            if (name.search(/^(ratio|anchorPoint)$/) === 0) {
                // convert number to vector
                if (typeof(value) === "number") {
                    value = {
                        "x" : value,
                        "y" : value
                    };
                }
            }
    }
    // return the interpreted value
    return value;
}

/**
 * @ignore
 */
function parseAttributes(obj, elt) {
    // do attributes
    if (elt.attributes && elt.attributes.length > 0) {
        for (var j = 0; j < elt.attributes.length; j++) {
            var attribute = elt.attributes.item(j);
            if (typeof(attribute.name) !== "undefined") {
                // DOM4 (Attr no longer inherit from Node)
                obj[attribute.name] = attribute.value;
            } else {
                // else use the deprecated ones
                obj[attribute.nodeName] = attribute.nodeValue;
            }
        }
    }
}

/**
 * decompress zlib/gzip data (NOT IMPLEMENTED)
 * @ignore
 * @name decompress
 * @param  {number[]} data- -  Array of bytes
 * @param  {string} format- -  compressed data format ("gzip","zlib")
 */
function decompress() {
    throw new Error("GZIP/ZLIB compressed TMX Tile Map not supported!");
}

/**
 * Decode a CSV encoded array into a binary array
 * @ignore
 * @name decodeCSV
 * @param  {string} input- -  CSV formatted data (only numbers, everything else will be converted to NaN)
 * @returns {number[]} Decoded data
 */
function decodeCSV(input) {
    var entries = input.replace("\n", "").trim().split(",");

    var result = [];
    for (var i = 0; i < entries.length; i++) {
        result.push(+entries[i]);
    }
    return result;
}

/**
 * Decode a base64 encoded string into a byte array
 * @ignore
 * @name decodeBase64AsArray
 * @param {string} input - Base64 encoded data
 * @param {number} [bytes] - number of bytes per array entry
 * @returns {Uint32Array} Decoded data
 */
function decodeBase64AsArray(input, bytes) {
    bytes = bytes || 1;

    var i, j, len;
    var dec = globalThis.atob(input.replace(/[^A-Za-z0-9\+\/\=]/g, ""));
    var ar = new Uint32Array(dec.length / bytes);

    for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) {
            ar[i] += dec.charCodeAt((i * bytes) + j) << (j << 3);
        }
    }
    return ar;
}

/**
 * Decode the given data
 * @ignore
 */
function decode(data, encoding, compression) {
    compression = compression || "none";
    encoding = encoding || "none";

    switch (encoding) {
        case "csv":
            return decodeCSV(data);

        case "base64":
            var decoded = decodeBase64AsArray(data, 4);
            return (
                (compression === "none") ?
                decoded :
                decompress()
            );

        case "none":
            return data;

        case "xml":
            throw new Error("XML encoding is deprecated, use base64 instead");

        default:
            throw new Error("Unknown layer encoding: " + encoding);
    }
}

/**
 * Normalize TMX format to Tiled JSON format
 * @ignore
 */
function normalize(obj, item) {
    var nodeName = item.nodeName;

    switch (nodeName) {
        case "data":
            var data = parse(item);

            data.encoding = data.encoding || "xml";

            // decode chunks for infinite maps
            if (typeof data.chunks !== "undefined") {
                obj.chunks = obj.chunks || [];
                // infinite maps containing chunk data
                data.chunks.forEach((chunk) => {
                    obj.chunks.push({
                        x: +chunk.x,
                        y: +chunk.y,
                        // chunk width is in tiles
                        width: +chunk.width,
                        // chunk height is in tiles
                        height: +chunk.height,
                        data: decode(chunk.text, data.encoding, data.compression)
                    });
                });
                obj.encoding = "none";
            }
            // Bug on if condition: when parsing data, data.text is sometimes defined when chunks are present
            if (typeof data.text !== "undefined" && typeof obj.chunks === "undefined") {
                // Finite maps
                obj.data = decode(data.text, data.encoding, data.compression);
                obj.encoding = "none";
            }
            break;

        case "chunk":
            obj.chunks = obj.chunks || [];
            obj.chunks.push(parse(item));
            break;

        case "imagelayer":
        case "layer":
        case "objectgroup":
        case "group":
            var layer = parse(item);
            layer.type = (nodeName === "layer" ? "tilelayer" : nodeName);
            if (layer.image) {
                layer.image = layer.image.source;
            }

            obj.layers = obj.layers || [];
            obj.layers.push(layer);
            break;

        case "animation":
            obj.animation = parse(item).frames;
            break;

        case "frame":
        case "object":
            var name = nodeName + "s";
            obj[name] = obj[name] || [];
            obj[name].push(parse(item));
            break;

        case "tile":
            var tile = parse(item);
            if (tile.image) {
                tile.imagewidth = tile.image.width;
                tile.imageheight = tile.image.height;
                tile.image = tile.image.source;
            }
            obj.tiles = obj.tiles || {};
            obj.tiles[tile.id] = tile;
            break;

        case "tileset":
            var tileset = parse(item);
            if (tileset.image) {
                tileset.imagewidth = tileset.image.width;
                tileset.imageheight = tileset.image.height;
                tileset.image = tileset.image.source;
            }

            obj.tilesets = obj.tilesets || [];
            obj.tilesets.push(tileset);
            break;

        case "polygon":
        case "polyline":
            obj[nodeName] = [];

            // Get a point array
            var points = parse(item).points.split(" ");

            // And normalize them into an array of vectors
            for (var i = 0, v; i < points.length; i++) {
                v = points[i].split(",");
                obj[nodeName].push({
                    "x" : +v[0],
                    "y" : +v[1]
                });
            }

            break;

        case "properties":
            obj.properties = parse(item);
            break;

        case "property":
            var property = parse(item);
            // for custom properties, text is used
            var value = (typeof property.value !== "undefined") ? property.value : property.text;

            obj[property.name] = setTMXValue(
                property.name,
                // in XML type is undefined for "string" values
                property.type || "string",
                value
            );
            break;

        default:
            obj[nodeName] = parse(item);
            break;
    }
}

/**
 * Parse a XML TMX object and returns the corresponding javascript object
 * @ignore
 */
function parse(xml) {
    // Create the return object
    var obj = {};

    var text = "";

    if (xml.nodeType === 1) {
        // do attributes
        parseAttributes(obj, xml);
    }

    // do children
    if (xml.hasChildNodes()) {
        let children = xml.childNodes;
        for (const node of children) {
            switch (node.nodeType) {
                case 1:
                    normalize(obj, node);
                    break;

                case 3:
                    text += node.nodeValue.trim();
                    break;
            }
        }
    }

    if (text) {
        obj.text = text;
    }

    return obj;
}

/**
 * Apply TMX Properties to the given object
 * @ignore
 */
function applyTMXProperties(obj, data) {
    var properties = data.properties;
    var types = data.propertytypes;
    if (typeof(properties) !== "undefined") {
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                var type = "string";
                var name = property;
                var value = properties[property];
                // proof-check for new and old JSON format
                if (typeof properties[property].name !== "undefined") {
                    name = properties[property].name;
                }
                if (typeof(types) !== "undefined") {
                    type = types[property];
                } else if (typeof properties[property].type !== "undefined") {
                    type = properties[property].type;
                }
                if (typeof properties[property].value !== "undefined") {
                    value = properties[property].value;
                }
                // set the value
                obj[name] = setTMXValue(name, type, value);
            }
        }
    }
}

export { applyTMXProperties, decode, decodeBase64AsArray, decodeCSV, decompress, normalize, parse };
