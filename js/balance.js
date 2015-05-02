define(function (require) {
	var PIXI = require('libs/pixi.dev');
	var Bangup = require('bangup');

	var Balance = function(initialAmount){
		Bangup.call(this);
		this.amount = initialAmount;
		this.update( this.amount, this.amount );
		this.label = this.addChild(new PIXI.Text("BALANCE:", { font: 'bold 24px Arial', fill: '#f3d601', align: 'left' }));
		this.label.position.set(-140,-18);

	};

	Balance.prototype = Object.create( Bangup.prototype );

	return Balance;
});