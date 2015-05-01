define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings'),
		Button = require('button');

	function changeText ( textObj, newText ) {
		textObj.setText( newText.toFixed(2) );
		
		var bounds = textObj.getBounds();
		textObj.pivot = new PIXI.Point(bounds.width / 2, bounds.height / 2);
	}

	function toFixed(number){
		return Math.floor(number * 100) / 100;
	}

	var Bet = function( type ){
		PIXI.DisplayObjectContainer.call(this);

		this.amounts = [0.25, 0.5, 1, 2, 5, 10];
		this.amountIndex = 3;
		this.currentBet = 2;
		
		this.text = new PIXI.Text("", { font: 'bold 28px Arial', fill: '#f3d601', align: 'center' });
		changeText( this.text, toFixed(this.currentBet) );

		this.text.x = 258;
		this.text.y = settings.gameHeight - 25;
		this.addChild(this.text);

		this.decreaseBtn = new Button( "decrease" );
		this.decreaseBtn.setXY( 170, settings.gameHeight - 50 );
		this.addChild(this.decreaseBtn);

		this.increaseBtn = new Button( "increase" );
		this.increaseBtn.setXY( 300, settings.gameHeight - 50 );
		this.addChild(this.increaseBtn);
		
		this.addEventListeners();
	};

	Bet.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Bet.prototype.addEventListeners = function( x, y ){
		var that = this;

		this.increaseBtn.events.clicked.add(function(){
			if ( !that.increaseBtn.activate ) { return; }

			that.amountIndex++;

			if ( that.amountIndex === 1 ) {
				that.decreaseBtn.activate();
			}

			if ( that.amountIndex === that.amounts.length - 1 ) {
				that.amountIndex = that.amounts.length - 1;
				that.increaseBtn.deactivate();
			}

			changeText( that.text, toFixed(that.amounts[that.amountIndex]) );
		});

		this.decreaseBtn.events.clicked.add(function(){
			if ( !that.decreaseBtn.activate ) { return; }

			that.amountIndex--;

			if ( that.amountIndex === that.amounts.length - 2 ) {
				that.increaseBtn.activate();
			}

			if ( that.amountIndex === 0 ) {
				that.amountIndex = 0;
				that.decreaseBtn.deactivate();
			}

			changeText( that.text, toFixed(that.amounts[that.amountIndex]) );
		});
	};

	Bet.prototype.activateButtons = function(){
		this.increaseBtn.activate();
		this.decreaseBtn.activate();
	};

	Bet.prototype.deactivateButtons = function(){
		this.increaseBtn.deactivate();
		this.decreaseBtn.deactivate();
	};

	Bet.prototype.getCurrentBet = function(){
		return this.amounts[this.amountIndex];
	};

	return Bet;
});