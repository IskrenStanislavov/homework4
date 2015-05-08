define(function (require) {
	var PIXI 	= require('libs/pixi.dev');
	var Balance = require('balance');
	var Bet 	= require('bet');
	var Hints 	= require('hints');
	var Person 	= require('person');
	var settings= require('settings');
	require('libs/underscore.min');

	var Player = function(initialAmount, id){
		Person.call(this, {
			"numberOfCards": settings.playerCardsNumer,
			"money": initialAmount,
			"id": id
		});


		PIXI.DisplayObjectContainer.call(this);
		this.balance = this.addChild(new Balance(initialAmount));
		this.bet     = this.addChild(new Bet());
		this.hints   = this.addChild(new Hints({"prefix":"Player " + new String(id)}));
	};

	_.extend(Player.prototype, Person.prototype );
	_.extend(Player.prototype, PIXI.DisplayObjectContainer.prototype );

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