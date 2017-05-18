'use strict';

var Jautocomplete = function () {

    function TrieNode() {
        this.isLeaf = false;
        this.transforms = [];
        this.children = {};
    }

    var root = new TrieNode();

    /*
    * References:
    * http://jrgraphix.net/r/Unicode/3040-309F (Hiragana)
    * http://jrgraphix.net/r/Unicode/30A0-30FF (Katakana)
    */
    function getKeyFromChar(c) {
        return c.charCodeAt(0);
    }

    function getCharFromKey(k) {
        return String.fromCharCode(k);
    }

    function _add(word) {
        var node = root;
        word = word.replace('　', ' ').toLowerCase();

        for (var i = 0; i < word.length; i++) {
            var key = getKeyFromChar(word[i]);

            if (!node.children[key]) {
                node.children[key] = new TrieNode();
            }

            node = node.children[key];
        }

        node.isLeaf = true;

        // Return leaf node
        return node;
    }

    /*
    * [Public]
    * Adds a new entry to the trie
    */
    function add(words) {
        words.forEach(function (e) {
            var word = e.word;
            var transforms = e.transforms;
            var leaf = _add(word);

            if (transforms) {
                // This word has transforms: append them to the list
                leaf.transforms = leaf.transforms.concat(transforms);
                // Add each of them to the trie as well
                transforms.forEach(function (w) {
                    var c = _add(w);
                    // Add itself as a transform
                    c.transforms = c.transforms.concat(w);
                });
            } else {
                // This word doesn't have transforms: add itself as a transform
                leaf.transforms = leaf.transforms.concat(word);
            }
        });
    }

    /*
    * [Public]
    * Lookahead for potential matches starting with prefix
    * Returns an array of suggestions, empty if none
    */
    function find(prefix) {
        var current = root;
        var matches = [];
        prefix = prefix.replace('　', ' ').toLowerCase();

        for (var i = 0; i < prefix.length; i++) {
            var j = getKeyFromChar(prefix[i]);

            if (!current.children[j]) {
                return matches;
            }

            current = current.children[j];
        }

        (function lookAhead(str, node) {
            if (node.isLeaf) {
                node.transforms.forEach(function (w) {
                    return matches.push(w);
                });
            }

            for (var k in node.children) {
                lookAhead(str + getCharFromKey(k), node.children[k]);
            }
        })(prefix, current);

        return matches;
    }

    /*
    * Returns public API
    */
    return {
        add: add,
        find: find
    };
}();