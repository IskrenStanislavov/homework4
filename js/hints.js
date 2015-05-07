define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings');

	var Hints = function(data){
		PIXI.DisplayObjectContainer.call(this);

		if(data.prefix !== undefined){
			this.prefix = data.prefix;
		} else {
			this.prefix = "PLAYER 1:"
		}

		this.hintText = new PIXI.Text("", { font: 'bold 24px Arial', fill: '#ffffff', align: 'center' });
		this.hintText.x = settings.gameWidth/2 - this.hintText.width/2 + 90;
		this.hintText.y = 120;
		this.hintText.alpha = 1;
		this.hintText.visible = false;
		this.addChild(this.hintText);

		this.TEXTS = {
			BET 				: this.prefix + "CHOOSE YOUR BET, PLEASE",
			CHOOSE_BUTTON 		: this.prefix + "CHOOSE DOUBLE OR DOUBLE HALF",
			PICK 				: this.prefix + "PICK A HIGHER CARD TO WIN!",
			LOOSER 				: this.prefix + "BETTER LUCK NEXT TIME!",
			CONGRATS 			: this.prefix + "CONGRATULATIONS! YOU WIN!",
			TIE 				: this.prefix + "IT'S A TIE. TRY AGAIN"
		};

	};

	Hints.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Hints.prototype.changeText = function( text ){
		var that = this;

		TweenMax.to( this.hintText, 0.2, { alpha: 0, onComplete: function(){
			that.hintText.setText(text);
			that.hintText.updateTransform();
			that.hintText.x = settings.gameWidth/2 - that.hintText.width/2 + 90;
			TweenMax.to(that.hintText, 0.2, { alpha: 1 });
		}});

		this.hintText.visible = true;
	};

	Hints.prototype.hide = function( text ){
		var that = this;
		TweenMax.to( this.hintText, 0.2, { alpha: 0, onComplete: function(){
			that.hintText.visible = false;
		}});
	};

	return Hints;
});