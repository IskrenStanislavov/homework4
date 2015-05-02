define(function (require) {
	var Bangup = require('bangup');

	var Balance = function(initialAmount){
		Bangup.call(this);
		this.amount = initialAmount;
		this.update( this.amount, this.amount );


	};

	Balance.prototype = Object.create( Bangup.prototype );

	return Balance;
});