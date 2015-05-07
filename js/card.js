define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings'),
		Signal = require('libs/signals.min');

	var Card = function(data){
		//data.rank, data.suit; dataId is between [0,52)
		if (data === undefined){
			data = {
            	"cardId": 0,
                "suit": 0,
                "rank": 0
            };
		}
		this.rank = data.rank;
		this.suit = data.suit;
		this.cardId = data.cardId;

		//visuals
		PIXI.DisplayObjectContainer.call(this);

		this.position.x = settings.cardsDefaultPosition.x;
		this.position.y = settings.cardsDefaultPosition.y;

		this.interactive = false;
		this.buttonMode = false;
		this.active = false;
		this.flipped = false;
		this.isWinCard = false;

		this.backImage = PIXI.Sprite.fromImage( "img/cards_back.png" );
		this.backImage.anchor.x = this.backImage.anchor.y = 0.5;
		this.backImage.scale.x = this.backImage.scale.y = settings.cardsScale;
		this.backImage.visible = true;
		this.addChild(this.backImage);

		this.frontImage = new PIXI.Sprite.fromImage(this.cardId);
		this.frontImage.anchor.x = this.frontImage.anchor.y = 0.5;
		this.frontImage.scale.x = this.frontImage.scale.y = settings.cardsScale;
		this.frontImage.visible = false;
		this.addChild(this.frontImage);

		this.hoverFrame = PIXI.Sprite.fromImage( "img/green_frame.png" );
		this.hoverFrame.anchor.x = this.hoverFrame.anchor.y = 0.5;
		this.hoverFrame.visible = false;
		this.addChild(this.hoverFrame);

		this.winFrame = PIXI.Sprite.fromImage( "img/golden_frame.png" );
		this.winFrame.anchor.x = this.winFrame.anchor.y = 0.5;
		this.winFrame.visible = false;
		this.addChild(this.winFrame);

		this.addEventListeners();

		this.events = {
			clicked: new Signal()
		};
	};

	Card.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Card.prototype.addEventListeners = function(){
		var that = this;

		this.click = this.tap = function(){
			if ( !that.active ) { return; }

			that.hoverFrame.visible = false;
			that.events.clicked.dispatch(that);
		};

		this.mouseover = function(){
			if ( !that.active ) { return; }

			that.hoverFrame.visible = true;
		};

		this.mouseout = function(){
			if ( !that.active ) { return; }

			that.hoverFrame.visible = false;
		};
	};

	Card.prototype.showBack = function(){
		this.backImage.visible = true;
	};
	
	Card.prototype.deal = function( cardIndex, callback ){
		TweenMax.to(this.position, 0.2, {
					x: settings.cardPositions[cardIndex].x,
					y: settings.cardPositions[cardIndex].y,
					ease: Power4.easeOut,
					delay: 0.1,
					onComplete: callback
				});
	};

	Card.prototype.hide = function( callback ){
		var that = this;
		TweenMax.to(this.position, 0.2, {
					x: settings.cardPositionOutsideGame,
					ease: Power1.easeIn,
					onComplete: function(){
						that.reset();
						callback && callback();
					}
				});
	};

	Card.prototype.flip = function( callback ){
		if ( this.flipped ) {
			callback && callback();
			return;
		}
		var that = this;
		this.flipped = true;

		TweenMax.to(this, 0.1, { rotation: -0.2 });

		TweenMax.to(this.scale, 0.1, { x: 0.1, onComplete:function(){
			that.backImage.visible = false;
			that.frontImage.visible = true;

			TweenMax.to(that, 0.1, { rotation: 0 });
			TweenMax.to(that.scale, 0.1, { x: 1, onComplete:function(){
				callback && callback();
			}});
		}});
	};

	Card.prototype.enablePick = function(){
		this.interactive = true;
		this.buttonMode = true;
		this.active = true;
	};

	Card.prototype.disablePick = function(){
		this.interactive = false;
		this.buttonMode = false;
		this.active = false;
		this.flipped = false;
	};

	Card.prototype.setRankAndSuit = function( cardId ){
		this.frontImage.setTexture( PIXI.Texture.fromImage( cardId) );
		this.rank = cardId % settings.cardsMaxRank;
	};

	Card.prototype.showWinFrame = function(){
		this.winFrame.visible = true;
	};

	Card.prototype.hideWinFrame = function(){
		this.winFrame.visible = false;
	};

	Card.prototype.setWinning = function(){
		this.isWinCard = true;
	};

	Card.prototype.reset = function(){
		this.parent.removeChild(this);
	};

	return Card;
});