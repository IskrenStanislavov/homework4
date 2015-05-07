define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings');
		Bangup = require('bangup');

	var Wins = function(){
		PIXI.DisplayObjectContainer.call(this);

		this.winAmountBangup = new Bangup();
		this.winAmountBangup.setCentered();
		this.winAmountBangup.setFontSize( 60 );
		this.winAmountBangup.setXY( 640, settings.gameHeight - 40);
		this.addChild(this.winAmountBangup);

		this.toWinDoubleHalf = new PIXI.Text("TO WIN:", { font: 'bold 18px Arial', fill: '#c2c2c2', align: 'left' });
		this.toWinDoubleHalf.position.x = 560;
		this.toWinDoubleHalf.position.y = 540;
		this.addChild(this.toWinDoubleHalf);

		this.toWinDouble = new PIXI.Text("TO WIN:", { font: 'bold 18px Arial', fill: '#c2c2c2', align: 'left' });
		this.toWinDouble.position.x = 760;
		this.toWinDouble.position.y = 540;
		this.addChild(this.toWinDouble);

		this.cumulativeWinAmoiunt = 0;
		this.futureWinAmount = 0;
		this.winner = "";
	};

	Wins.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Wins.prototype.showStartAmount = function( currentBet ){
		this.winAmountBangup.update( currentBet, currentBet );
		this.cumulativeWinAmoiunt = currentBet;
		this.winAmountBangup.visible = true;
	};

	Wins.prototype.updateWinAmount = function(){
		if ( this.winner === 'dealer' ) {
			this.futureWinAmount = 0;
		}

		this.winAmountBangup.update( this.cumulativeWinAmoiunt, this.futureWinAmount );
		this.cumulativeWinAmoiunt = Math.floor( this.futureWinAmount * 100) / 100;
	};

	Wins.prototype.hide = function(){
		this.winAmountBangup.visible = false;
	};

	Wins.prototype.showFutureWins = function(){
		this.toWinDoubleHalf.setText( "TO WIN: " + (Math.floor( this.getDoubleHalfFutureWin() * 100) / 100).toFixed(2));
		this.toWinDouble.setText( "TO WIN: " + (Math.floor( this.getDoubleFutureWin() * 100 ) / 100).toFixed(2));
		this.toWinDoubleHalf.visible = true;
		this.toWinDouble.visible = true;
	};

	Wins.prototype.hideFutureWins = function(){
		this.toWinDoubleHalf.visible = false;
		this.toWinDouble.visible = false;
	};

	Wins.prototype.getDoubleHalfFutureWin = function(){
		return this.cumulativeWinAmoiunt * 1.5;
	};

	Wins.prototype.getDoubleFutureWin = function(){
		return this.cumulativeWinAmoiunt * 2;
	};

	Wins.prototype.getWinAmount = function(){
		return this.cumulativeWinAmoiunt;
	};

	Wins.prototype.hideNotChosenMultiplierSum = function( chosenMultiplier ){
		if ( chosenMultiplier === 'doubleHalf' ) {
			this.toWinDouble.visible = false;
			this.futureWinAmount = this.getDoubleHalfFutureWin();
		} else if ( chosenMultiplier === 'double' ) {
			this.toWinDoubleHalf.visible = false;
			this.futureWinAmount = this.getDoubleFutureWin();
		}
	};

	Wins.prototype.setWinner = function( resultData ){
		if ( resultData.dealer > resultData.player ) {
    		this.winner = "dealer";
    	} else if ( resultData.dealer < resultData.player ) {
    		this.winner = "player";
    	} else {
    		this.winner = "tie";
    	}
	};

	return Wins;
});