define(function (require) {
	var PIXI = require('libs/pixi.dev');
	var Bangup = require('bangup');

	var Player = function(initialAmount, id){
		PIXI.DisplayObjectContainer.call(this);
		if (id === undefined){
			this.id = "";
		} else {
			this.id = id;
		}

		this.balance = this.addChild(new Balance(1000));
		this.bet     = this.addChild(new Bet());

		this.amount = initialAmount;
		this.update( this.amount, this.amount );
		this.setAmountTextXY(140, 18);
		this.label = this.addChild(new PIXI.Text("Player:" + this.id, { font: 'bold 24px Arial', fill: '#f3d601', align: 'left' }));
	};

	Player.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	return Player;
});