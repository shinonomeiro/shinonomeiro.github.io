"use strict";

cc.game.onStart = function () {
	cc.view.setDesignResolutionSize(480, 854, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);

	// Load resources
	cc.LoaderScene.preload(g_resources, function () {
		cc.director.runScene(new GameScene());
	}, this);
};
'use strict';

var path = 'res/';

var res = {
    tiles_sheet: path + 'tiles.png',
    tiles_plist: path + 'tiles.plist',
    frame: path + 'frame.png',
    HP_bar_back: path + 'HP_bar_back.png',
    HP_bar_front: path + 'HP_bar_front.png'
};

var g_resources = [];

for (var key in res) {
    g_resources.push(res[key]);
}
'use strict';

// TOUCHABLE.JS //
// Touch-enabled Node //

var Touchable = cc.Component.extend({

	ctor: function ctor(onTouchBegan, onTouchMoved, onTouchEnded) {
		this.setName('Touchable');

		this.onTouchBegan = onTouchBegan;
		this.onTouchMoved = onTouchMoved;
		this.onTouchEnded = onTouchEnded;
	},

	onEnter: function onEnter() {
		var self = this;
		var owner = this.getOwner();

		var listener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,

			onTouchBegan: function onTouchBegan(touch, e) {
				var p = owner.convertTouchToNodeSpace(touch);
				var bbox = owner.getBoundingBox();

				if (cc.rectContainsPoint(bbox, p)) {
					if (self.onTouchBegan) {
						self.onTouchBegan(touch, e);
					}

					// Swallow
					return true;
				};

				// Passthru
				return false;
			},

			onTouchMoved: function onTouchMoved(touch, e) {
				if (self.onTouchMoved) {
					self.onTouchMoved(touch, e);
				}
			},

			onTouchEnded: function onTouchEnded(touch, e) {
				if (self.onTouchEnded) {
					self.onTouchEnded(touch, e);
				}
			}
		});

		cc.eventManager.addListener(listener, owner);
		self.touchListener = listener;
	},

	onExit: function onExit() {
		if (this.onTouchBegan) {
			delete this.onTouchBegan;
		}

		if (this.onTouchMoved) {
			delete this.onTouchMoved;
		}

		if (this.onTouchEnded) {
			delete this.onTouchEnded;
		}

		if (this.touchListener) {
			cc.eventManager.removeListener(this.touchListener);
			delete this.touchListener;
		}
	}
});
"use strict";

var Template = cc.Node.extend({
	ctor: function ctor() {
		this._super();

		this.init();
	},

	init: function init() {},

	onEnter: function onEnter() {
		this._super();
	},

	onExit: function onExit() {
		this._super();
	}
});
"use strict";

var utils = {
	clamp: function clamp(value, min, max) {
		if (value < min) {
			value = min;
		} else if (value > max) {
			value = max;
		}

		return value;
	}
};
'use strict';

var Block = cc.Node.extend({
	typeId: null,
	sprite: null,

	touchComponent: null,
	touchListener: null,

	isMatchable: false,
	canExplode: false,
	commonAttributes: [],

	priority: 0,
	value: 0,

	ctor: function ctor(typeId) {
		this._super();

		this.typeId = typeId;

		this.init();
	},

	init: function init() {
		this._super();

		this.sprite = new cc.Sprite();
		this.addChild(this.sprite, 1);

		this.cascadeColor = true;
		this.cascadeOpacity = true;

		var self = this;

		this.touchListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,

			onTouchBegan: function onTouchBegan(touch, e) {
				var p = self.convertTouchToNodeSpace(touch);
				var bbox = self.getBoundingBox();

				if (cc.rectContainsPoint(bbox, p)) {
					self.onTouch(touch, e);

					// Swallow
					return true;
				};

				// Passthru
				return false;
			}
		});
	},

	// Nodes do not have bbox per-se, override needed
	getBoundingBox: function getBoundingBox() {
		return this.sprite.getBoundingBox();
	},

	onEnter: function onEnter() {
		this._super();

		var frame = cc.spriteFrameCache.getSpriteFrame('block_' + this.typeId + '.png');
		this.sprite.setSpriteFrame(frame);

		// Needed for pooling because listener is
		// automatically removed from event manager upon onExit
		cc.eventManager.addListener(this.touchListener, this);
	},

	onTouch: function onTouch(touch, e) {
		// Override in subclass
	},

	onScan: function onScan() {
		// Override in subclass
	},

	onMatch: function onMatch(effects) {
		effects.push(cc.scaleTo(0.3, 0.1, 0.1));

		return effects;
	},

	onExit: function onExit() {
		this._super();

		// Reset state
		this.setRotation(0);
		this.setScale(1, 1);
		this.setColor(cc.color(255, 255, 255));
		this.setOpacity(255);
	}
});

// ID ranges

Block.COLOR_RANGE = 0;
Block.ITEM_RANGE = 10000;
Block.ENEMY_RANGE = 11000;

// List for weighted randomization

Block._listDef = function (typeId, weight, create) {
	return { typeId: typeId, weight: weight, create: create };
};

Block.blockList = [
// Colors
Block._listDef(Block.COLOR_RANGE + 0, 100, function () {
	return Block.createColorBlock(Block.COLOR_RANGE + 0);
}), Block._listDef(Block.COLOR_RANGE + 1, 100, function () {
	return Block.createColorBlock(Block.COLOR_RANGE + 1);
}), Block._listDef(Block.COLOR_RANGE + 2, 100, function () {
	return Block.createColorBlock(Block.COLOR_RANGE + 2);
}), Block._listDef(Block.COLOR_RANGE + 3, 100, function () {
	return Block.createColorBlock(Block.COLOR_RANGE + 3);
}), Block._listDef(Block.COLOR_RANGE + 4, 100, function () {
	return Block.createColorBlock(Block.COLOR_RANGE + 4);
}),

// Items
Block._listDef(Block.ITEM_RANGE + 0, 20, function () {
	return Block.createBombBlock();
}), Block._listDef(Block.ITEM_RANGE + 1, 10, function () {
	return Block.createRainbowBlock();
}), Block._listDef(Block.ITEM_RANGE + 2, 3, function () {
	return Block.createHealBlock();
}),

// Enemies
Block._listDef(Block.ENEMY_RANGE + 0, 30, function () {
	return Block.createEnemyBlock();
})];

Block.totalWeight = 0;

Block.computeWeightSum = function () {
	Block.totalWeight = Block.blockList.map(function (block) {
		return block.weight;
	}).reduce(function (a, b) {
		return a + b;
	}, 0);
};

Block.computeWeightSum();

Block.getRandom = function () {
	var rand = Math.random() * Block.totalWeight;
	var res = { idx: 0, sum: 0 };

	for (var i = 0; i < Block.blockList.length; i++) {
		if (res.sum > rand) break;
		res.idx++;
		res.sum += Block.blockList[i].weight;
	}

	return Block.blockList[res.idx - 1].create();
};

// Ranges

Block.isColor = function (value) {
	return value >= Block.COLOR_RANGE && value < Block.ITEM_RANGE;
};

Block.isItem = function (value) {
	return value >= Block.ITEM_RANGE && value < Block.ENEMY_RANGE;
};

Block.isEnemy = function (value) {
	return value >= Block.ENEMY_RANGE && value < 12000; // TEMP
};

// Pools

var colorBlockPool = new ColorBlockPool();

// Factory functions

Block.createColorBlock = function (typeId) {
	return colorBlockPool.getBlock(typeId);
};

Block.createBombBlock = function () {
	return new BombBlock();
};

Block.createRainbowBlock = function () {
	return new RainbowBlock();
};

Block.createHealBlock = function () {
	return new HealBlock();
};

Block.createEnemyBlock = function () {
	return new EnemyBlock();
};
'use strict';

Block.Attributes = {

	LightUp: cc.Node.extend({
		block: null,
		tint: null,
		time: 0.3,
		particles: null,

		ctor: function ctor(block, tint, time, particles) {
			this._super();
			this.setName('LightUp');

			this.block = block;
			this.tint = tint;
			this.time = time;
			this.particles = particles;
		},

		handle: function handle() {
			var base = this.block.sprite.getColor();

			var act1 = cc.tintTo(this.time, this.tint.r, this.tint.g, this.tint.b);
			var act2 = cc.tintTo(this.time, base.r, base.g, base.b);

			this.block.sprite.runAction(cc.repeatForever(cc.sequence(act1, act2)));
		}
	})
};
'use strict';

var BombBlock = Block.extend({
	power: 1,
	timer: 2,

	active: false,

	ctor: function ctor() {
		this._super(Block.ITEM_RANGE + 0);

		this.canExplode = true;

		this.commonAttributes = [new Block.Attributes.LightUp(this, cc.color(255, 0, 0), 0.3, null)];

		this.value = 100;
	},

	onEnter: function onEnter() {
		this._super();
	},

	onTouch: function onTouch(touch, e) {
		if (this.active) {
			return;
		}

		this.active = true;
		this.priority = Date.now();
		this.commonAttributes[0].handle();
	},

	onScan: function onScan() {
		if (!this.active) {
			return;
		}

		cc.eventManager.dispatchCustomEvent('bomb', this);
	},

	onExit: function onExit() {
		this._super();
	}
});
'use strict';

var ColorBlock = Block.extend({
	noSwap: false,

	ctor: function ctor(typeId) {
		this._super(Block.COLOR_RANGE + typeId);

		this.isMatchable = true;

		this.value = 50;
	},

	onEnter: function onEnter() {
		this._super();
	},

	onTouch: function onTouch(touch, e) {
		if (this.noSwap) {
			return;
		}

		cc.eventManager.dispatchCustomEvent('swap', this.swapHandler.bind(this));
	},

	swapHandler: function swapHandler(typeId) {
		var frame = cc.spriteFrameCache.getSpriteFrame('block_' + typeId + '.png');
		this.sprite.setSpriteFrame(frame);
		var oldTypeId = this.typeId;
		this.typeId = typeId;

		return oldTypeId;
	},

	onMatch: function onMatch(effects) {
		this.noSwap = true;

		this._super(effects);
	},

	onExit: function onExit() {
		this._super();

		this.noSwap = false;
		colorBlockPool.returnBlock(this);
	}
});

var arrrrr = [];

// Pool

function ColorBlockPool() {
	this.pool = [];
}

ColorBlockPool.prototype.getBlock = function (typeId) {
	if (this.pool.length > 0) {
		var block = this.pool.shift();
		block.typeId = typeId;
		return block;
	} else {
		return new ColorBlock(typeId);
	}
};

ColorBlockPool.prototype.returnBlock = function (block) {
	this.pool.push(block);
};
'use strict';

var EnemyBlock = Block.extend({
	counter: 15,
	effects: [],
	label: null,
	active: false,

	ctor: function ctor() {
		this._super(Block.ENEMY_RANGE + 0);

		this.commonAttributes = [new Block.Attributes.LightUp(this, cc.color(255, 0, 0), 0.3, null)];

		this.value = 1000;
	},

	onEnter: function onEnter() {
		this._super();

		this.label = new cc.LabelTTF(this.counter, 'Arial', 25);
		this.label.setColor(255, 255, 255);
		this.addChild(this.label, 2);
	},

	onScan: function onScan() {
		if (this.active) {
			return;
		}

		this.active = true;
		this.counter--;
		this.label.string = this.counter;

		if (this.counter > 0) {
			this.effects.length = 0;
			this.effects.push(cc.scaleTo(0.2, 1.2, 1.2).easing(cc.easeElasticOut()));
			this.effects.push(cc.scaleTo(0.2, 1, 1).easing(cc.easeElasticOut()));
			this.runAction(cc.sequence(this.effects));

			if (this.counter === 1) {
				this.commonAttributes[0].handle();
			}
		} else {
			this.priority = Date.now();
		}
	},

	onExit: function onExit() {
		this._super();
	}
});
"use strict";

var GameBGLayer = cc.Layer.extend({
	background: null,

	ctor: function ctor() {
		this._super();

		this.init();
	},

	init: function init() {},

	onEnter: function onEnter() {
		this._super();

		// TODO Set background
	},

	onExit: function onExit() {
		this._super();
	}
});
'use strict';

var GameLayer = cc.Layer.extend({
	spritesheet: null,
	player: null,
	gridManager: null,

	comboCount: -1,
	collectCount: 0,
	score: 0,
	maxCombo: 0,

	feverPoints: 90,
	isFeverMode: false,
	feverDuration: 10,
	feverTimer: 0,

	ctor: function ctor(space) {
		this._super();

		this.init();
	},

	init: function init() {
		this.gridManager = new GridManager();
		this.addChild(this.gridManager);

		this.player = new Player();
		this.addChild(this.player);

		this.feverTimer = this.feverDuration;

		this.scheduleUpdate();
	},

	addCombo: function addCombo(collected) {
		var _this = this;

		this.comboCount++;
		this.collectCount += collected.length;
		this.score += this.comboCount * 100;
		collected.forEach(function (block) {
			return _this.score += block.value;
		});

		if (this.comboCount > this.maxCombo) {
			this.maxCombo = this.comboCount;
		}

		cc.eventManager.dispatchCustomEvent('score', {
			score: this.score,
			feverPoints: this.feverPoints
		});

		if (this.comboCount > 0) {
			cc.eventManager.dispatchCustomEvent('combo', {
				comboCount: this.comboCount,
				collectCount: this.collectCount
			});
		}

		if (!this.isFeverMode) {
			this.feverPoints += this.comboCount + collected.length;

			if (this.feverPoints >= 100) {
				this.isFeverMode = true;

				cc.eventManager.dispatchCustomEvent('fever', {
					isOn: true,
					duration: this.feverDuration
				});
			}
		}
	},

	resetCombo: function resetCombo() {
		this.comboCount = -1;
		this.collectCount = 0;
	},

	onEnter: function onEnter() {
		this._super();
	},

	update: function update(dt) {
		if (this.isFeverMode) {
			this.feverTimer -= dt;

			if (this.feverTimer < 0) {

				this.isFeverMode = false;
				this.feverPoints = 0;
				this.feverTimer = 10;

				cc.eventManager.dispatchCustomEvent('fever', {
					isOn: false,
					duration: this.feverDuration
				});
			}
		}
	},

	onExit: function onExit() {
		this._super();
	}
});
"use strict";

var GameScene = cc.Scene.extend({
	onEnter: function onEnter(themeId) {
		this._super();

		// TODO Load spritesheet from themeId
		cc.spriteFrameCache.addSpriteFrames(res.tiles_plist);
		this.spritesheet = new cc.SpriteBatchNode(res.tiles_sheet);
		this.addChild(this.spritesheet);

		// UI
		this.addChild(new GameBGLayer(), GameScene.LayerTags.GameBGLayer, GameScene.LayerTags.GameBGLayer);
		this.addChild(new GameUILayer(), GameScene.LayerTags.GameUILayer, GameScene.LayerTags.GameUILayer);

		// TODO Init BG and UI with themeId

		// Core -- Load last because UI is dependent on GameLayer's events
		this.addChild(new GameLayer(), GameScene.LayerTags.GameLayer, GameScene.LayerTags.GameLayer);
	},

	onExit: function onExit() {
		this._super();
	}
});

GameScene.LayerTags = {
	GameBGLayer: 1,
	GameLayer: 2,
	GameUILayer: 3
};
'use strict';

var GameUILayer = cc.Layer.extend({
	frame: null,

	comboCount: null,
	collectCount: null,
	fever: null,
	comboListener: null,

	healthBar: null,
	feverBar: null,

	playerBlock: null,
	playerBlockListener: null,

	isFeverMode: false,
	feverDuration: 0,

	ctor: function ctor() {
		this._super();

		this.init();
	},

	init: function init() {
		var winSize = cc.director.getWinSize();

		this.frame = new cc.Sprite(res.frame);
		this.frame.setPosition(winSize.width / 2, winSize.height / 2);
		this.addChild(this.frame);

		this.score = new cc.LabelTTF('Score: 0', 'Arial', 30);
		this.score.setPosition(winSize.width / 2, winSize.height - 25);
		this.addChild(this.score, 1);

		this.comboCount = new cc.LabelTTF('Combo: 0', 'Arial', 30);
		this.comboCount.setPosition(winSize.width / 2, winSize.height - 55);
		this.addChild(this.comboCount, 1);

		this.collectCount = new cc.LabelTTF('Collected: 0', 'Arial', 30);
		this.collectCount.setPosition(winSize.width / 2, winSize.height - 85);
		this.addChild(this.collectCount, 1);

		this.healthBar = new ccui.LoadingBar(res.HP_bar_front);
		this.healthBar.setScale9Enabled(true);
		this.healthBar.setCapInsets(cc.rect(1, 1, 62, 5));
		this.healthBar.setContentSize(400, 30);
		this.healthBar.setPosition(winSize.width / 2, winSize.height - 125);
		this.addChild(this.healthBar, 1);

		this.feverBar = new ccui.LoadingBar(res.HP_bar_back);
		this.feverBar.setScale9Enabled(true);
		this.feverBar.setCapInsets(cc.rect(1, 1, 62, 5));
		this.feverBar.setContentSize(400, 30);
		this.feverBar.setPosition(winSize.width / 2, winSize.height - 165);
		this.addChild(this.feverBar, 1);

		this.fever = new cc.LabelTTF('FEVER!!', 'Arial', 100);
		this.fever.setPosition(winSize.width / 2, winSize.height - 165);
		this.fever.setColor(cc.color(255, 0, 0));
		this.addChild(this.fever, 1);

		this.playerBlock = new cc.Sprite('#block_0.png');
		this.playerBlock.setPosition(winSize.width / 2, winSize.height - 265);
		this.playerBlock.setScale(1.4, 1.4);
		this.addChild(this.playerBlock);

		// EVENT LISTENERS

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'score',
			callback: this.updateScore.bind(this)
		}, this);

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'combo',
			callback: this.updateCombo.bind(this)
		}, this);

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'fever',
			callback: this.onFeverMode.bind(this)
		}, this);

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'playerBlock',
			callback: this.setPlayerBlock.bind(this)
		}, this);

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'playerHP',
			callback: this.updatePlayerHP.bind(this)
		}, this);

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'playerDead',
			callback: this.onGameOver.bind(this)
		}, this);

		// TODO Swallow touches directed at the UI

		// var listener = cc.EventListener.create({
		// 	event: cc.EventListener.TOUCH_ONE_BY_ONE,
		// 	swallowTouches: true,

		// 	onTouchBegan: function(touch, e) {
		// 		return true;
		// 	},
		// 	onTouchMoved: function(touch, e) {

		// 	},
		// 	onTouchEnded: function(touch, e) {

		// 	}
		// });

		// cc.eventManager.addListener(listener, this);
	},

	onEnter: function onEnter() {
		this._super();

		this.feverBar.setPercent(0);
		this.fever.setVisible(false);

		this.scheduleUpdate();
	},

	updateScore: function updateScore(e) {
		var data = e.getUserData();
		this.score.string = 'Score: ' + data.score;

		if (!this.isFeverMode) {
			this.feverBar.setPercent(data.feverPoints);
		}
	},

	updateCombo: function updateCombo(e) {
		var data = e.getUserData();
		this.comboCount.string = 'Combo: ' + data.comboCount;
		this.collectCount.string = 'Collected: ' + data.collectCount;
	},

	onFeverMode: function onFeverMode(e) {
		var data = e.getUserData();

		this.isFeverMode = data.isOn;
		this.feverDuration = data.duration;

		this.fever.setVisible(data.isOn);
	},

	setPlayerBlock: function setPlayerBlock(e) {
		var typeId = e.getUserData();
		var frame = cc.spriteFrameCache.getSpriteFrame('block_' + typeId + '.png');
		this.playerBlock.setSpriteFrame(frame);
	},

	updatePlayerHP: function updatePlayerHP(e) {
		var HP = e.getUserData();
		this.healthBar.setPercent(HP);
	},

	onGameOver: function onGameOver(e) {
		// TODO
	},

	update: function update(dt) {
		if (this.isFeverMode) {
			var current = this.feverBar.getPercent();
			current -= this.feverDuration * dt;
			this.feverBar.setPercent(current);
		}
	},

	onExit: function onExit() {
		this._super();
	}
});
"use strict";

function GridGen() {}

GridGen.prototype.make = function (y, x) {
	var grid = [];

	for (var j = 0; j < y; j++) {
		grid[j] = [];

		for (var i = 0; i < x; i++) {
			var slot = new cc.Node();
			var block = Block.getRandom();
			slot.block = block;
			grid[j][i] = slot;
		}
	}

	return grid;
};

GridGen.prototype.fill = function (grid) {
	var updatedSlots = [];

	for (var y = 0; y < grid.length; y++) {
		for (var x = 0; x < grid[y].length; x++) {
			var slot = grid[y][x];
			if (!slot.block) {
				var block = Block.getRandom();
				slot.block = block;
				updatedSlots.push(slot);
			}
		}
	}

	return updatedSlots;
};
'use strict';

var GridManager = cc.Node.extend({
	gridGen: null,
	grid: null,
	scanBar: null,
	spacing: null,
	shiftTime: 0,

	marginTop: 0,
	marginBottom: 0,

	zOff: {
		blocks: 1,
		scanBar: 2
	},

	opQueue: [],
	isBusy: false,

	ctor: function ctor() {
		this._super();

		this.init();
	},

	init: function init() {
		var _this = this;

		var frame = cc.spriteFrameCache.getSpriteFrame('block_0.png');
		this.spacing = frame.getOriginalSize().width;
		frame = null;

		var winSize = cc.director.getWinSize();
		var gridSize = GridManager.gridSize;
		var marginLR = winSize.width - gridSize.x * this.spacing;
		// Align the grid to the center of the view
		// Memo: Grid anchor is located at the center of the left-bottom-most block
		this.setPosition(marginLR / 2 + this.spacing / 2, 0);

		this.gridGen = new GridGen();

		this.grid = this.gridGen.make(gridSize.y + gridSize.y_hidden, gridSize.x);

		// TEMP
		this.marginTop = this.spacing / 4;
		this.marginBottom = winSize.height / 8.5;

		this.initialRender();

		this.scanBar = new GridScanBar(this.grid, this.processRow.bind(this));
		this.addChild(this.scanBar, this.zOff.scanBar);

		// BLOCK EVENTS

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'bomb',
			callback: function callback(e) {
				var sourceBlock = e.getUserData();
				_this.processBomb(sourceBlock);
			}
		}, this);

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'rainbow',
			callback: function callback(e) {
				var data = e.getUserData();
				_this.processRainbow(data.sourceBlock, data.colorId);
			}
		}, this);

		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'heal',
			callback: function callback(e) {
				var sourceBlock = e.getUserData();
				_this.processHeal(sourceBlock);
			}
		}, this);
	},

	onEnter: function onEnter() {
		this._super();

		this.scheduleUpdate();
	},

	// Render the grid on screen
	initialRender: function initialRender() {
		for (var y = 0; y < GridManager.gridSize.y + GridManager.gridSize.y_hidden; y++) {
			for (var x = 0; x < GridManager.gridSize.x; x++) {

				// Create a small gap between uppermost playable and stock rows
				var pos = y >= GridManager.gridSize.y ? cc.p(x * this.spacing, y * this.spacing + this.marginTop) : cc.p(x * this.spacing, y * this.spacing);

				var slot = this.grid[y][x];
				slot.setPosition(pos.x, this.marginBottom + pos.y);
				slot.gridPos = { y: y, x: x };

				// Align block with slot
				var block = slot.block;
				block.setPosition(pos.x, this.marginBottom + pos.y);
				this.addChild(block, this.zOff.blocks);
			}
		}
	},

	// Start item/match cycle
	processRow: function processRow(y) {
		var _this2 = this;

		var arr = [].concat(this.grid[y]).map(function (slot) {
			return slot.block;
		}).filter(function (block) {
			return block.priority > 0 && Block.isItem(block.typeId);
		});

		if (arr.length > 0) {
			var item = arr.reduce(function (a, b) {
				return a.priority > b.priority ? b : a;
			});
			// A new processRow will be scheduled until no more items
			this.opQueue.push(function () {
				return item.onScan();
			});
		} else {
			// A new processRow will be scheduled until no more matches
			this.opQueue.push(function () {
				return _this2.parent.isFeverMode ? _this2.processFeverMode(y) : _this2.processMatches(y);
			});
		}
	},

	// Process the matches, adding effects etc.
	processMatches: function processMatches(y) {
		var _this3 = this;

		this.isBusy = true;
		this.scanBar.doPause();

		var matches = this.getMatches(y);
		// Discard duplicates (from T-shaped matches)
		matches = new Set(matches);

		if (matches.size > 0) {
			var effects = [];
			var effectDuration = 0;
			var collected = [];

			matches.forEach(function (slot) {
				var block = slot.block;
				slot.block = null;
				collected.push(block);

				block.onMatch(effects);
				var del = cc.callFunc(function () {
					return _this3.removeChild(block);
				});

				var spawn = cc.spawn(effects);
				effectDuration = spawn.getDuration();
				block.runAction(cc.sequence([spawn, del]));

				effects.length = 0;
			});

			this.parent.addCombo(collected);

			var seq = this.createProcessSequence(effectDuration, y + 1, y);
			this.runAction(cc.sequence(seq));
		} else {
			this.postProcessRow(y);
		}
	},

	// Like processMatches, but cooler!
	processFeverMode: function processFeverMode(y) {
		var _this4 = this;

		this.isBusy = true;
		this.scanBar.doPause();

		var _matches = this.getMatches(y);
		// Discard duplicates (from T-shaped matches)
		var matches = new Set(matches);

		var getSlot = function getSlot(y, x) {
			if (y < 0 || y >= GridManager.gridSize.y || x < 0 || x >= GridManager.gridSize.x) {

				// Out of bounds
				return;
			}

			matches.add(_this4.grid[y][x]);
		};

		for (var i = 0; i < _matches.length; i++) {
			var coord = _matches[i].gridPos;

			getSlot(coord.y, coord.x + 1); // L
			getSlot(coord.y - 1, coord.x); // D
			getSlot(coord.y, coord.x - 1); // R
			getSlot(coord.y + 1, coord.x); // U
		}

		if (matches.size > 0) {
			var effects = [];
			var effectDuration = 0;
			var collected = [];

			matches.forEach(function (slot) {
				var block = slot.block;
				slot.block = null;
				collected.push(block);

				block.onMatch(effects);
				var del = cc.callFunc(function () {
					return _this4.removeChild(block);
				});

				var spawn = cc.spawn(effects);
				effectDuration = spawn.getDuration();
				block.runAction(cc.sequence([spawn, del]));

				effects.length = 0;
			});

			this.parent.addCombo(collected);

			var seq = this.createProcessSequence(effectDuration, y + 1, y);
			this.runAction(cc.sequence(seq));
		} else {
			this.postProcessRow(y);
		}
	},

	// Grab all the blocks that are part of a match with the current row
	getMatches: function getMatches(y) {
		var matches = [];

		// Babel & ES6 FTW !
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = this.match(y)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var match = _step.value;

				matches = matches.concat(match);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return matches;
	},

	match: regeneratorRuntime.mark(function match(y) {
		var _this5 = this;

		var match, slot, x, recursive;
		return regeneratorRuntime.wrap(function match$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						// Horizontal
						match = [this.grid[y][0]];
						slot = null;
						x = 1;

					case 3:
						if (!(x < GridManager.gridSize.x)) {
							_context.next = 16;
							break;
						}

						slot = this.grid[y][x];

						if (!(slot.block.isMatchable && slot.block.typeId === match[match.length - 1].block.typeId)) {
							_context.next = 9;
							break;
						}

						match.push(slot);
						_context.next = 13;
						break;

					case 9:
						if (!(match.length >= 3)) {
							_context.next = 12;
							break;
						}

						_context.next = 12;
						return match;

					case 12:

						match = [slot];

					case 13:
						x++;
						_context.next = 3;
						break;

					case 16:
						if (!(match.length >= 3)) {
							_context.next = 19;
							break;
						}

						_context.next = 19;
						return match;

					case 19:
						x = 0;

					case 20:
						if (!(x < GridManager.gridSize.x)) {
							_context.next = 32;
							break;
						}

						slot = this.grid[y][x];

						match = [slot];

						recursive = function recursive(ry) {
							if (ry > GridManager.gridSize.y - 1 || ry < 0) {
								return;
							}

							slot = _this5.grid[ry][x];

							if (slot.block.isMatchable && slot.block.typeId === match[match.length - 1].block.typeId) {
								match.push(slot);
							} else {
								return;
							}

							var dir = ry - y > 0 ? 1 : -1;
							recursive(ry + dir);
						};

						recursive(y + 1);
						recursive(y - 1);

						if (!(match.length >= 3)) {
							_context.next = 29;
							break;
						}

						_context.next = 29;
						return match;

					case 29:
						x++;
						_context.next = 20;
						break;

					case 32:
					case 'end':
						return _context.stop();
				}
			}
		}, match, this);
	}),

	// Process enemies, repeat match cycle if necessary, or end it
	postProcessRow: function postProcessRow(y) {
		var arr = [].concat(this.grid[y]).map(function (slot) {
			return slot.block;
		}).filter(function (block) {
			return Block.isEnemy(block.typeId);
		});

		arr.forEach(function (enemy) {
			return enemy.priority === 0 ? enemy.onScan() : null;
		});

		var attackers = arr.filter(function (enemy) {
			return enemy.priority > 0;
		});

		if (attackers.length > 0) {
			var attacker = attackers.reduce(function (a, b) {
				return a.priority > b.priority ? b : a;
			});
			this.processEnemy(attacker);
		} else {
			arr.forEach(function (enemy) {
				return enemy.active = false;
			});

			this.isBusy = false;
			this.scanBar.doResume();
			this.parent.resetCombo();
		}
	},

	processBomb: function processBomb(sourceBlock) {
		var _this6 = this;

		this.isBusy = true;
		this.scanBar.doPause();

		var sourceSlot = this.getSlotOfBlock(sourceBlock);
		var targets = new Set();
		targets.add(sourceSlot);
		var explosives = [];
		var gridPos = sourceSlot.gridPos;

		var recursive = function recursive(y, x) {
			if (y < 0 || y >= GridManager.gridSize.y || x < 0 || x >= GridManager.gridSize.x) {

				// Out of bounds
				return;
			}

			var currentSlot = _this6.grid[y][x];
			targets.add(currentSlot);

			if (currentSlot.block.canExplode && !explosives.includes(currentSlot.block)) {

				explosives.push(currentSlot.block);

				recursive(y, x + 1);
				recursive(y - 1, x);
				recursive(y, x - 1);
				recursive(y + 1, x);

				recursive(y + 1, x + 1);
				recursive(y - 1, x - 1);
				recursive(y + 1, x - 1);
				recursive(y - 1, x + 1);
			}
		};

		recursive(gridPos.y, gridPos.x + 1); // L
		recursive(gridPos.y - 1, gridPos.x); // D
		recursive(gridPos.y, gridPos.x - 1); // R
		recursive(gridPos.y + 1, gridPos.x); // U

		recursive(gridPos.y - 1, gridPos.x - 1);
		recursive(gridPos.y + 1, gridPos.x + 1);
		recursive(gridPos.y - 1, gridPos.x + 1);
		recursive(gridPos.y + 1, gridPos.x - 1);

		var effects = [];
		var effectDuration = 0;
		var collected = [];

		targets.forEach(function (slot) {
			var block = slot.block;
			slot.block = null;
			collected.push(block);

			var source = sourceSlot.getPosition();
			var here = slot.getPosition();
			var blowX = here.x - source.x != 0 ? _this6.spacing * 64 / (here.x - source.x) : 0;
			var blowY = here.y - source.y != 0 ? _this6.spacing * 64 / (here.y - source.y) : 0;

			effects.push(cc.rotateBy(0.5, Math.random() * 180, 0));
			effects.push(cc.moveBy(0.5, blowX, blowY));
			effects.push(cc.fadeTo(0.5, 0));
			var del = cc.callFunc(function () {
				return _this6.removeChild(block);
			});

			var spawn = cc.spawn(effects).easing(cc.easeSineOut());
			effectDuration = spawn.getDuration() / 1.5;
			block.runAction(cc.sequence([spawn, del]));

			effects.length = 0;
		});

		this.parent.addCombo(collected);

		var seq = this.createProcessSequence(effectDuration, 1, gridPos.y);
		this.runAction(cc.sequence(seq));
	},

	processRainbow: function processRainbow(sourceBlock, colorId) {
		var _this7 = this;

		this.isBusy = true;
		this.scanBar.doPause();

		var sourceSlot = this.getSlotOfBlock(sourceBlock);
		var row = sourceSlot.gridPos.y;
		var targets = [sourceSlot];

		for (var y = 0; y < GridManager.gridSize.y; y++) {
			for (var x = 0; x < GridManager.gridSize.x; x++) {
				var slot = this.grid[y][x];

				if (slot.block.typeId === colorId) {
					targets.push(slot);
				}
			}
		}

		var effects = [];
		var effectDuration = 0;
		var collected = [sourceBlock];

		targets.forEach(function (slot) {
			var block = slot.block;
			slot.block = null;
			collected.push(block);

			effects.push(cc.scaleTo(0.5, 1.2, 1.2));
			effects.push(cc.fadeTo(0.5, 0));
			var del = cc.callFunc(function () {
				return _this7.removeChild(block);
			});

			var spawn = cc.spawn(effects);
			effectDuration = spawn.getDuration();
			block.runAction(cc.sequence([spawn, del]));

			effects.length = 0;
		});

		this.parent.addCombo(collected);

		var seq = this.createProcessSequence(effectDuration, 1, row);
		this.runAction(cc.sequence(seq));
	},

	processHeal: function processHeal(sourceBlock) {
		var _this8 = this;

		this.isBusy = true;
		this.scanBar.doPause();

		var sourceSlot = this.getSlotOfBlock(sourceBlock);
		var row = sourceSlot.gridPos.y;
		sourceSlot.block = null;

		var effects = [];
		var effectDuration = 0;
		effects.push(cc.scaleTo(1, 1.5, 1.5));
		effects.push(cc.fadeTo(1, 0));
		var del = cc.callFunc(function () {
			return _this8.removeChild(sourceBlock);
		});
		var spawn = cc.spawn(effects);
		effectDuration = spawn.getDuration() / 1.5;
		sourceBlock.runAction(cc.sequence([spawn, del]));

		this.parent.addCombo([sourceBlock]);

		var seq = this.createProcessSequence(effectDuration, row + 1, row);
		seq.splice(1, 0, cc.callFunc(function () {
			return _this8.parent.player.onHeal();
		}));
		this.runAction(cc.sequence(seq));
	},

	processEnemy: function processEnemy(sourceBlock) {
		var _this9 = this;

		this.isBusy = true;
		this.scanBar.doPause();

		var sourceSlot = this.getSlotOfBlock(sourceBlock);
		var gridPos = sourceSlot.gridPos;
		var targets = [sourceSlot];

		var getSlot = function getSlot(y, x) {
			if (y < 0 || y >= GridManager.gridSize.y || x < 0 || x >= GridManager.gridSize.x) {

				// Out of bounds
				return;
			}

			targets.push(_this9.grid[y][x]);
		};

		getSlot(gridPos.y, gridPos.x + 1); // L
		getSlot(gridPos.y - 1, gridPos.x); // D
		getSlot(gridPos.y, gridPos.x - 1); // R
		getSlot(gridPos.y + 1, gridPos.x); // U

		getSlot(gridPos.y - 1, gridPos.x - 1);
		getSlot(gridPos.y + 1, gridPos.x + 1);
		getSlot(gridPos.y - 1, gridPos.x + 1);
		getSlot(gridPos.y + 1, gridPos.x - 1);

		var effects = [];
		var effectDuration = 0;

		targets.forEach(function (slot) {
			var block = slot.block;
			slot.block = null;

			effects.push(cc.moveTo(1, sourceSlot.getPosition().x, sourceSlot.getPosition().y));
			effects.push(cc.rotateBy(1, (Math.random() - 0.5) * 90, 0));
			effects.push(cc.tintTo(1, 0, 0, 0));
			effects.push(cc.scaleTo(1, 0, 0));
			var del = cc.callFunc(function () {
				return _this9.removeChild(block);
			});

			var spawn = cc.spawn(effects).easing(cc.easeSineIn());
			effectDuration = spawn.getDuration() / 1.5;
			block.runAction(cc.sequence([spawn, del]));

			effects.length = 0;
		});

		var seq = this.createProcessSequence(effectDuration, gridPos.y + 1, gridPos.y);
		seq.splice(1, 0, cc.callFunc(function () {
			return _this9.parent.player.onEnemyAttack();
		}));

		this.runAction(cc.sequence(seq));
	},

	getSlotOfBlock: function getSlotOfBlock(block) {
		for (var x = 0; x < GridManager.gridSize.x; x++) {
			if (this.grid[this.scanBar.currentRow][x].block === block) {
				return this.grid[this.scanBar.currentRow][x];
			}
		}
	},

	// Creates an array to run the actions as a sequence
	createProcessSequence: function createProcessSequence(effectDuration, shiftFrom, resumeFrom) {
		var _this10 = this;

		var seq = [];
		seq.push(cc.delayTime(effectDuration));
		seq.push(cc.callFunc(function () {
			return _this10.shiftBlocks(shiftFrom);
		}));
		seq.push(cc.delayTime(this.shiftTime));
		seq.push(cc.delayTime(this.scanBar.cooldown));
		seq.push(cc.callFunc(function () {
			_this10.fillGrid();
			_this10.isBusy = false;
			_this10.opQueue.push(function () {
				return _this10.processRow(resumeFrom);
			});
		}));

		return seq;
	},

	shiftBlocks: function shiftBlocks(y) {
		var _this11 = this;

		var maxDuration = 0;

		for (var j = y; j < GridManager.gridSize.y + GridManager.gridSize.y_hidden; j++) {
			for (var i = 0; i < GridManager.gridSize.x; i++) {
				if (!this.grid[j][i].block) {
					continue;
				}

				var recursive = function recursive(ry) {
					if (ry - 1 < 0 || _this11.grid[ry - 1][i].block) {
						return ry;
					}

					return recursive(ry - 1);
				};

				var targetY = recursive(j);

				if (j !== targetY) {
					var oldSlot = this.grid[j][i];
					var newSlot = this.grid[targetY][i];
					var block = oldSlot.block;
					oldSlot.block = null;
					newSlot.block = block;
					var oldPos = oldSlot.getPosition();
					var newPos = newSlot.getPosition();

					var distance = utils.clamp(oldPos.y - newPos.y, 128, 512);
					var duration = distance / 512;
					var moveTo = cc.moveTo(duration, newPos);
					moveTo.easing(cc.easeSineIn());
					block.runAction(moveTo);

					if (duration > maxDuration) {
						maxDuration = duration;
					}
				}
			}
		}

		this.shiftTime = maxDuration;
	},

	fillGrid: function fillGrid() {
		var updatedSlots = this.gridGen.fill(this.grid);

		for (var i = 0; i < updatedSlots.length; i++) {
			var slot = updatedSlots[i];
			var pos = slot.getPosition();
			slot.block.setPosition(pos.x, pos.y);

			this.addChild(slot.block, this.zOff.blocks);
		}
	},

	update: function update(dt) {
		// Process operation queue
		if (!this.isBusy && this.opQueue.length > 0) {
			var op = this.opQueue.shift();
			op();
		}
	},

	onExit: function onExit() {
		this._super();
	}
});

GridManager.gridSize = {
	y: 7,
	y_hidden: 7,
	x: 7
};
'use strict';

var GridScanBar = cc.Node.extend({
	grid: null,
	onScan: null,
	barSprite: null,
	speed: 2,
	motion: null,
	currentRow: 0,
	cooldown: 1,

	ctor: function ctor(grid, onScan) {
		this._super();

		this.grid = grid;
		this.onScan = onScan;

		this.init();
	},

	init: function init() {
		var _this = this;

		this.barSprite = new cc.Sprite('#block_1.png');
		this.barSprite.setScale(7, 1);
		this.barSprite.setOpacity(100);
		this.addChild(this.barSprite);

		var spacing = this.grid[1][0].y - this.grid[0][0].y;
		var center = GridManager.gridSize.x * spacing / 2 - spacing / 2;
		var playableRows = GridManager.gridSize.y;
		// One row higher than the topmost, off-screen
		var startPos = cc.p(center, this.grid[playableRows - 1][0].y + spacing);
		this.setPosition(startPos);

		var actionList = [];
		var easing = cc.easeSineOut();
		var moveTo = null;

		// Scan bar will move from top to down, invoking the callback at every step
		for (var i = playableRows - 1; i >= 0; i--) {
			// Move to next row
			moveTo = cc.moveTo(1 / this.speed, cc.p(center, this.grid[i][0].y));
			moveTo.easing(easing);
			actionList.push(moveTo);
			// Invoke the match function for that row
			actionList.push(cc.callFunc(this.createCallFunc(i)));
		}

		// Have the scan bar move one step further, off-screen
		moveTo = cc.moveTo(1 / this.speed, cc.p(center, this.grid[0][0].y - spacing));
		moveTo.easing(easing);
		actionList.push(moveTo);
		// Put the scan bar back at its start position at the top
		actionList.push(cc.callFunc(function () {
			return _this.setPosition(startPos);
		}));

		this.motion = cc.repeatForever(cc.sequence(actionList));
	},

	onEnter: function onEnter() {
		this._super();
		this.runAction(this.motion);
	},

	// Ugly workaround to circumvent loop variable in a closure problem
	// More details at:
	// http://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
	createCallFunc: function createCallFunc(i) {
		var _this2 = this;

		return function () {
			_this2.currentRow = i;
			_this2.onScan(i);
		};
	},

	doPause: function doPause() {
		this.pause();
	},

	doResume: function doResume() {
		this.resume();
	},

	// TODO Implement speed change

	onExit: function onExit() {
		this._super();
	}
});
'use strict';

var HealBlock = Block.extend({
	active: false,

	ctor: function ctor() {
		this._super(Block.ITEM_RANGE + 2);

		this.commonAttributes = [new Block.Attributes.LightUp(this, cc.color(0, 255, 0), 0.3, null)];

		this.value = 100;
	},

	onEnter: function onEnter() {
		this._super();
	},

	onTouch: function onTouch(touch, e) {
		if (this.active) {
			return;
		}

		this.active = true;
		this.priority = Date.now();
		this.commonAttributes[0].handle();
	},

	onScan: function onScan() {
		if (!this.active) {
			return;
		}

		cc.eventManager.dispatchCustomEvent('heal', this);
	},

	onExit: function onExit() {
		this._super();
	}
});
'use strict';

var Player = cc.Node.extend({
	HP: 100,
	fever: 0,
	blockColor: 2,

	ctor: function ctor() {
		this._super();

		this.init();
	},

	init: function init() {
		cc.eventManager.addListener({
			event: cc.EventListener.CUSTOM,
			eventName: 'swap',
			callback: this.handleSwap.bind(this)
		}, this);

		this.blockHasChanged();
	},

	onEnter: function onEnter() {
		this._super();
	},

	handleSwap: function handleSwap(e) {
		var swap = e.getUserData();
		this.blockColor = swap(this.blockColor);
		this.blockHasChanged();
	},

	blockHasChanged: function blockHasChanged() {
		cc.eventManager.dispatchCustomEvent('playerBlock', this.blockColor);
	},

	onHeal: function onHeal() {
		this.HP += 10;

		if (this.HP > 100) {
			this.HP = 100;
		}

		cc.eventManager.dispatchCustomEvent('playerHP', this.HP);
	},

	onEnemyAttack: function onEnemyAttack() {
		this.HP -= 10;

		cc.eventManager.dispatchCustomEvent('playerHP', this.HP);

		if (this.HP < 0) {
			this.HP = 0;

			cc.eventManager.dispatchCustomEvent('playerDead', null);
		}
	},

	onExit: function onExit() {
		this._super();
	}
});
'use strict';

var RainbowBlock = Block.extend({
	active: false,
	rainbow: null,
	colorId: 0,
	cycle: null,

	ctor: function ctor() {
		this._super(Block.ITEM_RANGE + 1);

		this.commonAttributes = [new Block.Attributes.LightUp(this, cc.color(153, 204, 255), 0.3, null)];

		this.value = 100;
	},

	onEnter: function onEnter() {
		this._super();

		this.rainbow = new cc.Sprite('#block_0.png');
		this.addChild(this.rainbow, 0);

		var colors = [];
		var speed = Math.random() + 0.5;

		for (var i = 0; i < 5; i++) {
			colors.push(cc.callFunc(this.createCallFunc(i)));
			colors.push(cc.delayTime(speed));
		}

		this.cycle = cc.repeatForever(cc.sequence(colors));
		this.runAction(this.cycle);
	},

	createCallFunc: function createCallFunc(i) {
		var _this = this;

		return function () {
			var frame = cc.spriteFrameCache.getSpriteFrame('block_' + i + '.png');
			_this.rainbow.setSpriteFrame(frame);
			_this.colorId = i;
		};
	},

	onTouch: function onTouch(touch, e) {
		if (this.active) {
			return;
		}

		this.active = true;
		this.priority = Date.now();
		this.commonAttributes[0].handle();

		this.stopAction(this.cycle);
	},

	onScan: function onScan() {
		if (!this.active) {
			return;
		}

		cc.eventManager.dispatchCustomEvent('rainbow', {
			sourceBlock: this,
			colorId: this.colorId
		});
	},

	onExit: function onExit() {
		this._super();
	}
});
"use strict";

var MenuScene = cc.Scene.extend({
	onEnter: function onEnter() {
		this._super();
	},

	onExit: function onExit() {
		this._super();
	}
});
"use strict";

var TitleScene = cc.Scene.extend({
	onEnter: function onEnter() {
		this._super();
	},

	onExit: function onExit() {
		this._super();
	}
});