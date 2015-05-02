define(function (require) {
	var PIXI = require('libs/pixi.dev');
	var Bangup = require('bangup');

	var Balance = function(initialAmount){
		Bangup.call(this);
		this.amount = initialAmount;
		this.update( this.amount, this.amount );
		this.setAmountTextXY(140, 18);
		this.label = this.addChild(new PIXI.Text("BALANCE:", { font: 'bold 24px Arial', fill: '#f3d601', align: 'left' }));

		this.position.set(0, 10);

	};

	Balance.prototype = Object.create( Bangup.prototype );
	Balance.prototype.update = function(newValue){
		Bangup.prototype.update.call(this, this.amount, newValue);
		this.amount = newValue;
	};

	Balance.prototype.reduce = function(value){
		Bangup.prototype.update.call(this, this.amount, this.amount-value);
		this.amount -= value;
	};

	Balance.prototype.increase = function(value){
		Bangup.prototype.update.call(this, this.amount, this.amount+value);
		this.amount += value;
	};

	return Balance;
});