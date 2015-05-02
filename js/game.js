define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings'),
		Signal = require('libs/signals.min'),
		Button = require('button'),
		Bangup = require('bangup'),
		Bet = require('bet'),
		Hints = require('hints'),
		Deck = require('deck'),
		Message = require('message'),
		Wins = require('wins');

	var Game = function(){
		PIXI.DisplayObjectContainer.call(this);

		this.doubleButton = null;
		this.doubleHalfButton = null;
		this.startButton = null;
		this.collectButton = null;
		this.dealedCardsContainer = null;
		this.balance = null;
		this.bet = null;
		this.hints = null;
		this.deck = null;
		this.message = null;
		this.dealedCards = [];
		this.balanceAmount = 0;
		this.chosenMultiplier = "";

		this.STATES = {
			START 		: 'start',
			DEAL 		: 'deal',
			BET 		: 'bet',
			PICK_A_CARD : 'pick',
			RESULT 		: 'result',
			WIN 		: 'win',
			LOOSE 		: 'loose',
			FINISH 		: 'finish'
		};

		this.currentState = "";

		this.events = {
			elementsCreated: new Signal()
		}
		

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

	Game.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Game.prototype.newState = function(){
		var game = this;

		switch( game.currentState ) {
			case game.STATES.START:
				if ( game.balanceAmount < game.bet.getCurrentBet() ) {
					game.deactivateButtons([game.doubleButton, game.doubleHalfButton, game.collectButton, game.startButton]);
					game.bet.deactivateButtons();

					game.message.events.messageHidden.addOnce(function(){
						game.activateButtons([game.startButton]);
						game.bet.activateButtons();
					});
					game.message.show();
					return;
				}

				game.deactivateButtons([game.startButton]);
				game.bet.deactivateButtons();
				game.wins.showStartAmount( game.bet.getCurrentBet() );

				var newBalance = game.balanceAmount - game.bet.getCurrentBet();
				game.balance.update( game.balanceAmount, newBalance );
				game.balanceAmount = newBalance;

				game.currentState = game.STATES.DEAL;
				game.newState();
			break;
			case game.STATES.DEAL:
				game.deck.events.allCardsDealed.addOnce(function(){
					game.hints.changeText( game.hints.TEXTS.CHOOSE_BUTTON );
					game.deactivateButtons([game.startButton]);
					game.activateButtons([game.doubleButton, game.doubleHalfButton, game.collectButton]);
				});

				game.hints.hide();
	        	game.deck.deal();
	        	game.wins.showFutureWins();
	        break;
	        case game.STATES.BET:
	        	game.hints.changeText( game.hints.TEXTS.BET );
	        	game.bet.activateButtons();
	        break;
	        case game.STATES.PICK_A_CARD:
	        	game.deactivateButtons([game.doubleButton, game.doubleHalfButton, game.collectButton]);
	        	game.wins.hideNotChosenMultiplierSum( game.chosenMultiplier );
	        	game.hints.hide();

	        	game.deck.events.cardPicked.addOnce(function(){
        			game.currentState = game.STATES.RESULT;
					game.newState();
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

	        	if ( resultData.dealer > resultData.player ) {
	        		game.currentState = game.STATES.LOOSE;
					game.newState();
	        	} else if ( resultData.dealer < resultData.player ) {
	        		game.currentState = game.STATES.WIN;
					game.newState();
	        	} else {
	        		game.currentState = game.STATES.TIE;
					game.newState();
	        	}
	        break;
	        case game.STATES.WIN:
	        	game.hints.changeText( game.hints.TEXTS.CONGRATS );
        		game.deck.showWinEffects();

        		setTimeout(function(){
	        		game.deck.flipTheOtherCards();
        			game.wins.updateWinAmount();
	        	}, 1500);

	        	setTimeout(function(){
	        		game.deck.events.allCardsHidden.addOnce(function(){
	        			game.currentState = game.STATES.DEAL;
						game.newState();
	        		});

	        		game.wins.hideFutureWins();
	        		game.hints.hide();
	        		game.deck.collect();
	        	}, 3500);
	        break;
	        case game.STATES.LOOSE:
        		game.hints.changeText( game.hints.TEXTS.LOOSER );
        		game.deck.showWinEffects();

        		setTimeout(function(){
	        		game.deck.flipTheOtherCards();
        			game.wins.updateWinAmount();
	        	}, 1500);

	        	setTimeout(function(){
	        		game.currentState = game.STATES.FINISH;
					game.newState();
	        	}, 3500);
	        break;
	        case game.STATES.TIE:
        		game.hints.changeText( game.hints.TEXTS.TIE );

        		setTimeout(function(){
	        		game.deck.flipTheOtherCards();
	        	}, 1500);

	        	setTimeout(function(){
	        		game.deck.events.allCardsHidden.addOnce(function(){
	        			game.currentState = game.STATES.DEAL;
						game.newState();
	        		});

	        		game.wins.hideFutureWins();
	        		game.hints.hide();
	        		game.deck.collect();
	        	}, 3000);
	        break;
	        case game.STATES.FINISH:
        		game.deactivateButtons([game.doubleButton, game.doubleHalfButton, game.collectButton]);
	        	game.wins.hideFutureWins();
	        	game.hints.hide();
	        	game.wins.hide();

	        	game.deck.events.allCardsHidden.addOnce(function(){
        			game.activateButtons([game.startButton]);
        			game.bet.activateButtons();
        			var winAmount = game.wins.getWinAmount();
        			if ( winAmount > 0 ) {
        				game.balance.update( game.balanceAmount, game.balanceAmount + winAmount );
        				game.balanceAmount = game.balanceAmount + winAmount;
        			}
        		});

	        	game.deck.collect();
	        break;
	   	}
	};

	Game.prototype.createGameElements = function () {
		var that = this;
		var background = new PIXI.Sprite.fromImage('img/bg.jpg');
		this.addChild(background);

	/* TEXTS */
		this.hints = new Hints();
		this.addChild(this.hints);
		
		var dealersCardText = new PIXI.Text("Dealer's card", { font: 'bold 24px Arial', fill: '#c2c2c2', align: 'left' });
		dealersCardText.x = 275;
		dealersCardText.y = 450;
		this.addChild(dealersCardText);

		var balanceText = new PIXI.Text("BALANCE:", { font: 'bold 24px Arial', fill: '#f3d601', align: 'left' });
		balanceText.x = 10;
		balanceText.y = 10;
		this.addChild(balanceText);

		var betPerGame = new PIXI.Text("Bet per game:", { font: 'bold 18px Arial', fill: '#c2c2c2', align: 'left' });
		betPerGame.x = 200;
		betPerGame.y = settings.gameHeight - 80;
		this.addChild(betPerGame);

	/* BUTTONS */
		this.doubleButton = new Button( "double" );
		this.doubleButton.events.clicked.add(function(){
			that.chosenMultiplier = "double";
			that.currentState = that.STATES.PICK_A_CARD;
			that.newState();
		});
		this.doubleButton.setXY( 750, 480 );
		this.addChild(this.doubleButton);

		this.doubleHalfButton = new Button( "doubleHalf" );
		this.doubleHalfButton.events.clicked.add(function(){
			that.chosenMultiplier = "doubleHalf";
			that.currentState = that.STATES.PICK_A_CARD;
			that.newState();
		});
		this.doubleHalfButton.setXY( 550, 480 );
		this.addChild(this.doubleHalfButton);

		this.startButton = new Button( "start" );
		this.startButton.setXY( 920, settings.gameHeight - 65 );
		this.startButton.events.clicked.add(function(){
			that.currentState = that.STATES.START;
			that.newState();
		});
		this.startButton.activate();
		this.addChild(this.startButton);

		this.collectButton = new Button( "collect" );
		this.collectButton.setXY( 1100, settings.gameHeight - 65 );
		this.collectButton.events.clicked.add(function(){
			that.currentState = that.STATES.FINISH;
			that.newState();
		});
		this.addChild(this.collectButton);

	/* BALANCE */
		this.balance = new Bangup();
		this.balance.setXY( 150, 28);
		this.balanceAmount = 1000;
		this.balance.update( this.balanceAmount, this.balanceAmount );
		this.addChild(this.balance);

	/* DECK OF CARDS */
		this.deck = new Deck();
		this.addChild(this.deck);

	/* WINS */
		this.wins = new Wins();
		this.addChild(this.wins);

	/* BET */
		this.bet = new Bet();
		this.addChild(this.bet);

		this.events.elementsCreated.dispatch();
	
	/* MESSAGE */
		this.message = new Message();
		this.addChild(this.message);
	};

	Game.prototype.start = function () {
		this.currentState = this.STATES.BET;
		this.newState();
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