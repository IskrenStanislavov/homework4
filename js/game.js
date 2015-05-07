define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings'),
		Signal = require('libs/signals.min'),
		Button = require('button'),
		Bangup = require('bangup'),
		Bet = require('bet'),
		Deck = require('deck'),
		Message = require('message'),
		Wins = require('wins');

	var Balance = require('balance');
	var Player  = require('player');

	var Game = function(){
		PIXI.DisplayObjectContainer.call(this);

		this.STATES = {
			BET_CHOOSING     : 'bet',
			START 		     : 'start',
			DEAL 		     : 'deal',
			PICK_A_CARD      : 'pick',
			RESULT 		     : 'result',
			SWITCH_PLAYERS   : "switch",
			CARDS_COLLECTION : "collect",
			FINISH 		     : 'finish'
		};

		this.currentState = "";

		this.players = [0,1].map(function(index){
			return this.addChild(new Player(1000, index+1));
		}.bind(this));

		this.currentPlayer = 0;
		this.switchPlayers(this.currentPlayer);

		this.deck = this.addChild(new Deck());

		this.initDEBUG();
		this.createVisualElements();
		this.events = {
			cardPicked: new Signal(),
			allCardsDealed: new Signal(),
			allCardsHidden: new Signal(),
			dealersCardShown: new Signal()
		};

		this.dealerCard = null;
		this.playerCard = null;
		this.cardsArr = [];

	};

	Game.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Object.defineProperties(Game.prototype, {
		"player": {
			get: function() {
				return this.players[this.currentPlayer];
			}
		},
		"bet": {
			get: function() {
				return this.player.bet;
			}
		},
		"balance": {
			get: function() {
				return this.player.balance;
			}
		},
		"hints": {
			get: function() {
				return this.player.hints;
			}
		}
	});
	
	Game.prototype.switchPlayers = function (playerIndex, callback) {
		if (playerIndex === undefined){
			playerIndex = (this.currentPlayer + 1) % this.players.length;
		}
		console.log("..activating player"+new String(playerIndex+1));
		this.currentPlayer = playerIndex;

		this.players.forEach(function(player, index){
			if (index === playerIndex){
				player.visible = true;
			} else {
				player.visible = false;
			}
		});
		callback && callback();
	};

	Game.prototype.createVisualElements = function () {
		var that = this;

		this.chosenMultiplier = "";


		var background = new PIXI.Sprite.fromImage('img/bg.jpg');
		this.addChildAt(background, 0);

		var dealersCardText = new PIXI.Text("Dealer's card", { font: 'bold 24px Arial', fill: '#c2c2c2', align: 'left' });
		dealersCardText.x = 275;
		dealersCardText.y = 450;
		this.addChild(dealersCardText);

		var betPerGame = new PIXI.Text("Bet per game:", { font: 'bold 18px Arial', fill: '#c2c2c2', align: 'left' });
		betPerGame.x = 200;
		betPerGame.y = settings.gameHeight - 80;
		this.addChild(betPerGame);

		/* BUTTONS */
		this.doubleButton = new Button( "double" );
		this.doubleButton.events.clicked.add(function(){
			that.chosenMultiplier = "double";
			that.newState(that.STATES.PICK_A_CARD);
		});
		this.doubleButton.setXY( 750, 480 );
		this.addChild(this.doubleButton);

		this.doubleHalfButton = new Button( "doubleHalf" );
		this.doubleHalfButton.events.clicked.add(function(){
			that.chosenMultiplier = "doubleHalf";
			that.newState(that.STATES.PICK_A_CARD);
		});
		this.doubleHalfButton.setXY( 550, 480 );
		this.addChild(this.doubleHalfButton);

		this.startButton = new Button( "start" );
		this.startButton.setXY( 920, settings.gameHeight - 65 );
		this.startButton.events.clicked.add(function(){
			that.newState(that.STATES.START);
		});
		this.startButton.activate();
		this.addChild(this.startButton);

		this.collectButton = new Button( "collect" );
		this.collectButton.setXY( 1100, settings.gameHeight - 65 );
		this.collectButton.events.clicked.add(function(){
			that.setChosenCardForKeeping();
			that.collectButton.deactivate();
		});
		this.addChild(this.collectButton);

		/* WINS */
		this.wins = new Wins();
		this.addChild(this.wins);


	
		/* MESSAGE */
		this.message = new Message();
		this.addChild(this.message);
	};

	Game.prototype.initDEBUG = function () {
		DEBUG = {};
		DEBUG.game = this;
		DEBUG.gaffs = {};

		// call any of these methods BEFOR CLICKING ON "double" or "double half" buttons
		DEBUG.gaffs.iWin = function(){
			DEBUG.game.cardsArr[0].setRankAndSuit( 0 );

			for (var i = 1; i < 5; i++) {
				DEBUG.game.cardsArr[i].setRankAndSuit( 12 );
			}
		};

		DEBUG.gaffs.dealerWins = function(){
			DEBUG.game.cardsArr[0].setRankAndSuit( 12 );

			for (var i = 1; i < 5; i++) {
				DEBUG.game.cardsArr[i].setRankAndSuit( 0 );
			}
		};

		DEBUG.gaffs.tie = function(){
			for (var i = 0; i < 5; i++) {
				DEBUG.game.cardsArr[i].setRankAndSuit( 0 );
			}
		};
	};

	Game.prototype.newState = function( state ){
		var game = this;
		console.log("##" + this.currentState + "-->" + state)
		this.currentState = state;



		switch( game.currentState ) {
	        case game.STATES.BET_CHOOSING:
	        	game.hints.changeText( game.hints.TEXTS.BET );
        		game.deactivateButtons([game.doubleButton, game.doubleHalfButton]);
				game.activateButtons([game.startButton]);
	        	game.bet.activateButtons();
	        break;

			case game.STATES.START:
				game.deactivateButtons([game.startButton]);
				game.bet.deactivateButtons();

				if ( !game.player.placeBet() ) {// failed to place bet
					game.deactivateButtons([game.doubleButton, game.doubleHalfButton]);

					game.message.events.messageHidden.addOnce(function(){
						game.newState(game.STATES.BET_CHOOSING);
					});
					game.message.show();
					return;
				}

				game.wins.showStartAmount( game.bet.getCurrentBet() );

				game.newState(game.STATES.DEAL);
			break;
			case game.STATES.DEAL:
				game.events.allCardsDealed.addOnce(function(){
					game.hints.changeText( game.hints.TEXTS.CHOOSE_BUTTON );
					game.deactivateButtons([game.startButton]);
					game.activateButtons([game.doubleButton, game.doubleHalfButton]);
				});

				game.hints.hide();
	        	game.deal();
	        	game.wins.showFutureWins();
	        break;
	        case game.STATES.PICK_A_CARD:
	        	game.deactivateButtons([game.doubleButton, game.doubleHalfButton]);
	        	game.wins.hideNotChosenMultiplierSum( game.chosenMultiplier );
	        	game.hints.hide();

	        	game.events.cardPicked.addOnce(function(){
					game.newState(game.STATES.RESULT);
	        	});

	        	game.events.dealersCardShown.addOnce(function(){
        			game.hints.changeText( game.hints.TEXTS.PICK );
	        		game.enableCardPick();
	        	});
	        	game.showDealersCard();
	        break;
	        case game.STATES.RESULT:
	        	var resultData = game.getResultData();
	        		game.wins.setWinner( resultData );

	        	var displayHintText;

	        	if ( resultData.dealer > resultData.player ) {
	        		displayHintText = game.hints.TEXTS.LOOSER;
	        	} else if ( resultData.dealer < resultData.player ) {
	        		displayHintText = game.hints.TEXTS.CONGRATS;
	        	} else {
		        	displayHintText = game.hints.TEXTS.TIE;
	        	}

		        game.hints.changeText(displayHintText);
        		game.showWinningCardEffects(function(){
	        		setTimeout(function(){
		        		game.flipTheOtherCards(function(){
		        			game.wins.updateWinAmount();
			        		var winAmount = game.wins.getWinAmount();
			        		if ( winAmount > 0 ) {
			        			game.player.receiveAmount(winAmount);
			        		}
		        			game.newState(game.STATES.CARDS_COLLECTION);
		        		});
		        	}, 500);
        		});
	        break;
	        case game.STATES.CARDS_COLLECTION:
		        game.hints.changeText(game.hints.TEXTS.KEEPING_CARD);
	        	game.collectButton.activate();
	        	setTimeout(function(){
		        	game.collectButton.deactivate();
	        		game.wins.hideFutureWins();
	        		game.hints.hide();

	        		game.events.allCardsHidden.addOnce(function(){
	        			game.newState(game.STATES.SWITCH_PLAYERS);
	        		});
	        		game.collect();
	        	}, 1000 * settings.cardKeepingTimeAvailable);
	        break;
	        case game.STATES.SWITCH_PLAYERS:
	        	game.wins.hide();
	        	game.switchPlayers(undefined, function(){
	        		if (game.deck.isEmpty()){
		        		game.newState(game.STATES.FINISH);
	        		} else {
			        	game.newState(game.STATES.BET_CHOOSING);
	        		}
	        	});
	        break;
	        case game.STATES.FINISH:
	        	var gameOverText = "GAME OVER!";
	        	game.players.forEach(function(player){
	        		gameOverText += "\n" + player.getFinalBalanceText();
	        	});
	        	game.hints.changeText( gameOverText );
	        break;
	        default:
	        	throw "no such state:"+state;
	        break;
	   	}
	};

	Game.prototype.start = function () {
		this.newState(this.STATES.BET_CHOOSING);
	};

	Game.prototype.activateButtons = function( buttons ){
		buttons.forEach(function( btn ){
			btn.activate();
		});
	};

	Game.prototype.deal = function () {
		var that = this,
			cardIndex = settings.totalPlayableCards - 1;

		var numberOfCardsToDeal = Math.min(settings.totalPlayableCards, that.deck.cardsLeft.length);

		[].range(0, numberOfCardsToDeal-1).forEach(function(index){
			var card = that.deck.cardsLeft.pop();
			that.cardsArr.unshift(card);
			card.events.clicked.add( function( pickedCard ){
				that.playerCard = pickedCard;
				that.disableCardPick();
				pickedCard.flip();
				that.setWinningCards();

				that.events.cardPicked.dispatch();
			});
			if (index===numberOfCardsToDeal-1){
				setTimeout(function(){
					card.deal(numberOfCardsToDeal-1-index, function(){
						that.events.allCardsDealed.dispatch();
					});
				}, (numberOfCardsToDeal-1-index)*100);
			} else {
				setTimeout(function(){
					card.deal(numberOfCardsToDeal-1-index);
				}, (numberOfCardsToDeal-1-index)*100);
			}
		});

	};

	Game.prototype.collect = function () {
		var that = this,
			cardIndex = that.cardsArr.length - 1;

		this.hideWinEffects();

		function animateCard () {
			if ( cardIndex >= 0 ) {
				var currentCard = that.cardsArr[cardIndex];
				currentCard.hide(function(){
					that.removeChild(currentCard);
					if (that.cardsArr[cardIndex] === that.playerCard && that.playerCard.keep){
						currentCard.reset();
					}
					cardIndex--;
					animateCard();
				});
			} else {
				that.cardsArr.length=0;
				that.events.allCardsHidden.dispatch();
			}
		}

		animateCard();
	};

	Game.prototype.showDealersCard = function(){
		this.dealerCard = this.cardsArr[0];

		this.dealerCard.flip(function(){
			this.events.dealersCardShown.dispatch();
		}.bind(this));
	};

	Game.prototype.enableCardPick = function(){
		for (var i = 1; i < this.cardsArr.length; i++) {
			this.cardsArr[i].enablePick();
		}
	};

	Game.prototype.disableCardPick = function(){
		for (var i = 1; i < this.cardsArr.length; i++) {
			this.cardsArr[i].disablePick();
		}
	};

	Game.prototype.getResultData = function(){
		return { dealer: this.dealerCard.rank, player: this.playerCard.rank }
	};

	Game.prototype.flipTheOtherCards = function(callback){
		this.cardsArr.forEach(function(card, i){
			card.flip(i===0 ? callback:undefined);
		});
	};

	Game.prototype.showWinningCardEffects = function(callback){
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

	Game.prototype.hideWinEffects = function(){
		this.cardsArr.forEach(function(card){
			if ( card.isWinCard ) {
				card.hideWinFrame();
			}
		});
	};

	Game.prototype.setChosenCardForKeeping = function(){
		this.cardsArr.splice(this.cardsArr.indexOf(this.playerCard), 1);
		this.deck.returnCard(this.playerCard);
	};

	Game.prototype.setWinningCards = function(){
		if ( this.dealerCard.rank > this.playerCard.rank ) {
			this.dealerCard.setWinning();
		} else if ( this.dealerCard.rank < this.playerCard.rank ) {
			this.playerCard.setWinning();
		} else {
			this.dealerCard.setWinning();
			this.playerCard.setWinning();
		}
	};


	Game.prototype.deactivateButtons = function( buttons ){
		buttons.forEach(function( btn ){
			btn.deactivate();
		});
	};

	return Game;
});