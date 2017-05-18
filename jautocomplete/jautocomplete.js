const Jautocomplete = (() => {

    function TrieNode() {
        this.isLeaf = false;
        this.transforms = [];
        this.children = {};
    }

    const root = new TrieNode();

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
        let node = root;
        word = word.replace('　', ' ').toLowerCase();

        for (let i = 0; i < word.length; i++) {
            let key = getKeyFromChar(word[i]);

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
        words.forEach(e => {
            let word = e.word;
            let transforms = e.transforms;
            let leaf = _add(word);

            if (transforms) {
                // This word has transforms: append them to the list
                leaf.transforms = leaf.transforms.concat(transforms);
                // Add each of them to the trie as well
                transforms.forEach(w => {
                    let c = _add(w);
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
        let current = root;
        let matches = [];
        prefix = prefix.replace('　', ' ').toLowerCase();

        for (let i = 0; i < prefix.length; i++) {
            let j = getKeyFromChar(prefix[i]);

            if (!current.children[j]) {
                return matches;
            }

            current = current.children[j];
        }

        (function lookAhead(str, node) {
            if (node.isLeaf) {
                node.transforms.forEach(w => matches.push(w));
            }

            for (let k in node.children) {
                lookAhead(str + getCharFromKey(k), node.children[k]);
            }

        })(prefix, current);

        return matches;
    }

    /*
    * Returns public API
    */
    return {
        add,
        find
    };

})();
