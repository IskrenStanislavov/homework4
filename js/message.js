define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings'),
		Signal = require('libs/signals.min');

	var Message = function( type ){
		PIXI.DisplayObjectContainer.call(this);
		
		this.background = new PIXI.Graphics().beginFill(0x000000, 0.7).drawRect(0, 0, settings.gameWidth, settings.gameHeight);
		this.addChild(this.background);

		this.text = new PIXI.Text("You have insufficient funds to place stake", { font: 'bold 24px Arial', fill: '#c2c2c2', align: 'center' });
		this.text.x = settings.gameWidth/2 - this.text.width/2;
		this.text.y = 250;
		this.addChild(this.text);

		this.buttonBg = new PIXI.Graphics().beginFill(0xffffff, 0.7).drawRect(settings.gameWidth/2 - 50, 300, 100, 50);
		this.addChild(this.buttonBg);
		this.buttonBg.interactive = false;
		this.buttonBg.buttonMode = false;

		this.buttonText = new PIXI.Text("OK", { font: 'bold 24px Arial', fill: '#000000', align: 'center' });
		this.buttonText.x = settings.gameWidth/2 - this.buttonText.width/2;
		this.buttonText.y = 310;
		this.addChild(this.buttonText);

		this.alpha = 0;

		this.events = {
			messageHidden: new Signal()
		}

		this.addEventListeners();
	};

	Message.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Message.prototype.addEventListeners = function(){
		var that = this;

		this.buttonBg.click = this.buttonBg.tap = function(){
			that.buttonBg.interactive = false;
			that.buttonBg.buttonMode = false;

			that.hide();
		};
	};

	Message.prototype.show = function(){
		TweenMax.to(this, 0.3, {alpha: 1, onComplete: function(){
			this.buttonBg.interactive = true;
			this.buttonBg.buttonMode = true;
		}.bind(this)});
	};

	Message.prototype.hide = function(){
		TweenMax.to(this, 0.3, {alpha: 0, onComplete: function(){
			this.buttonBg.interactive = false;
			this.buttonBg.buttonMode = false;
			this.events.messageHidden.dispatch();
		}.bind(this)});
	};

	return Message;
});