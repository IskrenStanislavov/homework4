define(function (require) {
	var Hints 	= require('hints');

	var Person = function(initData){
		this.numberOfCards = initData.numberOfCards;
		this.initialMoney = initData.money;
		this.currentMoney = initData.money;
		this.cardsArray = [];
		this.chosenCard = null;

		this.id = initData.id;
	};

	Object.defineProperties(Person.prototype, {
		"card": {
			get: function() {
				return this.chosenCard;
			}
		}
	});

	Person.prototype.getBalance = function() {
		return this.currentMoney;
	};

	Person.prototype.receiveAmount = function(amount) {
		this.currentMoney += amount;
	};

	Person.prototype.takeAmount = function(amount) {
		this.currentMoney -= amount;
	};

	Person.prototype.giveCard = function(card) {
		this.cardsArray.push(card);
	};

	Person.prototype.returnCard = function() {
		return this.cardsArray.splice(this.cardsArray.indexOf(this.chosenCard), 1)[0];
	};

	Person.prototype.revealCard = function() {
		// if (!this.chosenCard && this.cardsArray[0]){
		// 	this.chosenCard = this.cardsArray[0];
		// }
		console.log(this.chosenCard && this.chosenCard.value);
	};

	return Person;
});