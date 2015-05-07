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

		this.cardsArr = [];
		this.dealerCard = null;
		this.playerCard = null;

		this.cardsLeft = this.allCards.shuffle();
		this.cardsLeft.forEach(function(card, i){
			this.addChild(card, this.cardsLeft.length-1);
			card.position.x=125-i/4;
			card.position.y=200-i/4;
		}.bind(this));

		this.events = {
			cardPicked: new Signal(),
			allCardsDealed: new Signal(),
			allCardsHidden: new Signal(),
			dealersCardShown: new Signal()
		};
	};

	Deck.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Deck.prototype.handlePick = function( pickedCard ){
		this.playerCard = pickedCard;
		this.disableCardPick();
		pickedCard.flip();
		this.setWinningCards();
	};

	Deck.prototype.deal = function () {
		var that = this,
			cardIndex = settings.totalPlayableCards - 1;

		[].range(0, settings.totalPlayableCards-1).forEach(function(i){
			var card = that.cardsLeft.pop();
			if (!card) return;
			that.cardsArr.unshift(card);
			card.events.clicked.add( function( pickedCard ){
				that.handlePick( pickedCard );
				that.events.cardPicked.dispatch();
			});
		});

		function animateCard () {
			if ( cardIndex >= 0 && cardIndex<that.cardsArr.length) {
				var currentCard = that.cardsArr[cardIndex];
				currentCard.showBack();
				currentCard.deal(cardIndex, function(){
					cardIndex--;
					animateCard();
				});
			} else {
				that.events.allCardsDealed.dispatch();
			}
		}

		animateCard();
	};

	Deck.prototype.collect = function () {
		var that = this,
			cardIndex = settings.totalPlayableCards - 1;

		this.hideWinEffects();

		function animateCard () {
			if ( cardIndex >= 0 ) {
				var currentCard = that.cardsArr[cardIndex];
				currentCard.hide(function(){
					cardIndex--;
					animateCard();
				});
			} else {
				that.events.allCardsHidden.dispatch();
			}
		}

		animateCard();
	};

	Deck.prototype.showDealersCard = function(){
		this.dealerCard = this.cardsArr[0];

		this.dealerCard.flip(function(){
			this.events.dealersCardShown.dispatch();
		}.bind(this));
	};

	Deck.prototype.enableCardPick = function(){
		for (var i = 1; i < this.cardsArr.length; i++) {
			this.cardsArr[i].enablePick();
		}
	};

	Deck.prototype.disableCardPick = function(){
		for (var i = 1; i < this.cardsArr.length; i++) {
			this.cardsArr[i].disablePick();
		}
	};

	Deck.prototype.getResultData = function(){
		return { dealer: this.dealerCard.rank, player: this.playerCard.rank }
	};

	Deck.prototype.flipTheOtherCards = function(callback){
		this.cardsArr.forEach(function(card, i){
			card.flip(i===0 ? callback:undefined);
		});
	};

	Deck.prototype.setWinningCards = function(){
		if ( this.dealerCard.rank > this.playerCard.rank ) {
			this.dealerCard.setWinning();
		} else if ( this.dealerCard.rank < this.playerCard.rank ) {
			this.playerCard.setWinning();
		} else {
			this.dealerCard.setWinning();
			this.playerCard.setWinning();
		}
	};

	Deck.prototype.showWinningCardEffects = function(callback){
		callback.done = false;
		this.cardsArr.forEach(function(card, index){
			if ( card.isWinCard ) {
				card.showWinFrame();
				if (!callback.done){
					callback.done = true;
					callback && callback();
				}
			}
		});
	};

	Deck.prototype.hideWinEffects = function(){
		this.cardsArr.forEach(function(card){
			if ( card.isWinCard ) {
				card.hideWinFrame();
			}
		});
	};

	Deck.prototype.restart = function(){
		this.cardsLeft = this.cardsArr.slice(0);
	};

	return Deck;
});