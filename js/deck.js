define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings'),
		Signal = require('libs/signals.min'),
		Card = require('card');

	var Deck = function(){
		PIXI.DisplayObjectContainer.call(this);

		this.allCards = [].range(0,settings.deck.count-1).map(function (_, i){
            return new Card({
            	"cardId": i,
                "suit": settings.deck.suits[Math.floor(i/13)],
                "rank": i%13 + 2
            });
        });
		this.restart();
	};

	Deck.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Deck.prototype.isEmpty = function () {
		return this.cardsLeft.length < 2;
	};

	Deck.prototype.returnCard = function (card, callback) {
		card.setKeep();
		this.setChildIndex(card, 0);
		this.cardsLeft.splice(0, 0, card);
		card.hide(function(){
			card.reset();
			callback && callback();
		});
	};

	Deck.prototype.restart = function() {
		this.cardsLeft = this.allCards.slice(0).shuffle();
		this.cardsLeft.forEach(function(card, i){
			this.addChild(card, this.cardsLeft.length-1);
			card.position.x=125-i/4;
			card.position.y=200-i/4;
		}.bind(this));

	};

	return Deck;
});