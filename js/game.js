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

		// this.doubleButton = null;
		// this.doubleHalfButton = null;
		// this.startButton = null;
		// this.collectButton = null;
		// this.dealedCardsContainer = null;
		// this.hints = null;
		// this.message = null;
		// this.dealedCards = [];
		this.chosenMultiplier = "";


		var background = new PIXI.Sprite.fromImage('img/bg.jpg');
		this.addChildAt(background, 0);

		// /* TEXTS */
		// this.hints = new Hints();
		// this.addChild(this.hints);
		
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
			// that.newState(that.STATES.FINISH);
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
			DEBUG.game.deck.cardsArr[0].setRankAndSuit( 0 );

			for (var i = 1; i < 5; i++) {
				DEBUG.game.deck.cardsArr[i].setRankAndSuit( 12 );
			}
		};

		DEBUG.gaffs.dealerWins = function(){
			DEBUG.game.deck.cardsArr[0].setRankAndSuit( 12 );

			for (var i = 1; i < 5; i++) {
				DEBUG.game.deck.cardsArr[i].setRankAndSuit( 0 );
			}
		};

		DEBUG.gaffs.tie = function(){
			for (var i = 0; i < 5; i++) {
				DEBUG.game.deck.cardsArr[i].setRankAndSuit( 0 );
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
        		game.deactivateButtons([game.doubleButton, game.doubleHalfButton, game.collectButton]);
				game.activateButtons([game.startButton]);
	        	game.bet.activateButtons();
	        break;

			case game.STATES.START:
				game.deactivateButtons([game.startButton, game.collectButton]);
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
				game.deck.events.allCardsDealed.addOnce(function(){
					game.hints.changeText( game.hints.TEXTS.CHOOSE_BUTTON );
					game.deactivateButtons([game.startButton]);
					game.activateButtons([game.doubleButton, game.doubleHalfButton]);
				});

				game.hints.hide();
	        	game.deck.deal();
	        	game.wins.showFutureWins();
	        break;
	        case game.STATES.PICK_A_CARD:
	        	game.deactivateButtons([game.doubleButton, game.doubleHalfButton, game.collectButton]);
	        	game.wins.hideNotChosenMultiplierSum( game.chosenMultiplier );
	        	game.hints.hide();

	        	game.deck.events.cardPicked.addOnce(function(){
					game.newState(game.STATES.RESULT);
	        	});

	        	game.deck.events.dealersCardShown.addOnce(function(){
        			game.hints.changeText( game.hints.TEXTS.PICK );
	        		game.deck.enableCardPick();
	        	});
	        	game.deck.showDealersCard();
	        break;
	        case game.STATES.RESULT:
	        	var resultData = game.deck.getResultData();
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
        		game.deck.showWinningCardEffects(function(){
	        		setTimeout(function(){
		        		game.deck.flipTheOtherCards(function(){
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
	        	setTimeout(function(){
	        		game.wins.hideFutureWins();
	        		game.hints.hide();

	        		game.deck.events.allCardsHidden.addOnce(function(){
	        			game.newState(game.STATES.SWITCH_PLAYERS);
	        		});
	        		game.deck.collect();
	        	}, 500);
	        break;
	        case game.STATES.SWITCH_PLAYERS:
	        	game.wins.hide();
	        	game.switchPlayers(undefined, function(){
		        	game.newState(game.STATES.BET_CHOOSING);
	        	});
	        break;
	      //   case game.STATES.FINISH:
       //  		game.deactivateButtons([game.doubleButton, game.doubleHalfButton, game.collectButton]);
    			// game.activateButtons([game.startButton]);
    			// game.bet.activateButtons();
	      //   	game.wins.hide();
	      //   break;
	        default:
	        	throw "no state:"+state;
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

	Game.prototype.deactivateButtons = function( buttons ){
		buttons.forEach(function( btn ){
			btn.deactivate();
		});
	};

	return Game;
});