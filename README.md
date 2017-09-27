# shinonomeiro.github.io
Projects portfolio

https://github.com/shinonomeiro/Source - Jul- 2017 (ongoing)<br/>
Some source code from my current private project with a friend. As much as I'm allowed to tell, it fetches nearby train stations in proximity to your current position, and gives you the next train departure times in two clicks. This is all the info I can give, sorry! 
Front-end implementation done in parallel using both React and Vue as libraries for experimentation purposes. The back-end is also developed by myself using Node / Express/ MongoDB but the code is not featured on this repo. Might add some of it at a later time if I have some time.

https://shinonomeiro.github.io/jautocomplete/ - May 2017<br/>
Running demo of <a href="https://github.com/shinonomeiro/Jautocomplete">Jautocomplete</a> with 5000 Japanese train station names from あ to た (total of 10,000 if counting transforms as well) + 2500 random a-z English words dataset. Implemented using a simple trie that has to be initialized and loaded with keywords before usage.

https://shinonomeiro.github.io/actionpuzzle/ - Nov/Dec 2016<br/>
Running demo of <a href="https://github.com/shinonomeiro/CCPuzzle">CCPuzzle</a>. Fast-paced action puzzle game made with Cocos-2D-JS. Tap any tile in the grid to swap it with your current tile (shown below the yellow 'fever' bar) and perform match-three combos. Any time the scanbar hovers a 'counter' (or 'enemy') tile, its displayed number drops by one. Once it reaches zero, your will take damage to your HP. The only way to get rid of those is to have a nearby bomb explode. Have fun!
Implementation-wise, the code could certainly benefit from some modernization (i.e. ES6) backed with a more robust module bundler such as webpack. Todo.

https://shinonomeiro.github.io/reactwebchat/ - Nov 2016<br/>
Simple <a href="https://github.com/shinonomeiro/ReactWebChat">chat interface</a> powered by React.js and dummy data. No server-side involved. This is an old project and does not reflect current design patterns and best practices. Components should be given their own file (i.e. Single File Components) and require()'d as needed by other components. Props handling and passing to children could benefit from some refactoring also, ideally implemented with Redux. Todo.
