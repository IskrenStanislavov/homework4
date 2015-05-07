define(function (require) {
	var PIXI 	= require('libs/pixi.dev');
	var Balance = require('balance');
	var Bet 	= require('bet');
	var Hints 	= require('hints');

	var Player = function(initialAmount, id){
		PIXI.DisplayObjectContainer.call(this);
		if (id === undefined){
			this.id = "";
		} else {
			this.id = id;
		}

		this.balance = this.addChild(new Balance(initialAmount));

		this.bet     = this.addChild(new Bet());

		/* TEXTS */
		this.hints = new Hints({"prefix":"Player " + new String(id)});
		this.addChild(this.hints);


		this.card = false;
	};

	Player.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Player.prototype.getBalance = function() {
		return this.balance.amount;
	};

	Player.prototype.getFinalBalanceText = function() {
		var result = "";
		result += this.hints.TEXTS.FINAL_BALANCE;
		result += new String(this.getBalance());
	    return result;
	};

	Player.prototype.placeBet = function() {
		// if successful returns true; else false
		if (this.balance.amount >= this.bet.getCurrentBet()){
			this.balance.reduce(this.bet.getCurrentBet());
			return true;
		}
		return false;
	};

	Player.prototype.receiveAmount = function(amount) {
		this.balance.increase(amount);
	};

	Player.prototype.updateBalance = function(amount) {
		return this.balance.update(amount);
	};

	Player.prototype.revealCard = function() {
		if (this.card){
			this.card.flip();
			console.log(this.card.value);
		}
	};

	return Player;
});