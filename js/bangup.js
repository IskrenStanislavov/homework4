define(function (require) {
	var PIXI = require('libs/pixi.dev'),
		settings = require('settings');

	function toFixed(number){
		return Math.floor(number * 100) / 100;
	}

	var Bangup = function(){
		PIXI.DisplayObjectContainer.call(this);

		this.text = new PIXI.Text("", { font: 'bold 22px Arial', fill: '#f3d601', align: 'center' });
		var bounds = this.text.getBounds();
		this.text.pivot = new PIXI.Point(bounds.width / 2, bounds.height / 2);
		this.addChild(this.text);
		this.centered = false;
	};

	Bangup.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

	Bangup.prototype.setXY = function( x, y ){
		this.text.x = x;
		this.text.y = y;
	};

	Bangup.prototype.setCentered = function(){
		this.centered = true;
	};

	Bangup.prototype.setFontSize = function( size ){
		this.text.setStyle({font: 'bold ' + size + 'px Arial', fill: '#f3d601', align: 'center'});
	};

	Bangup.prototype.update = function( startAmount, endAmount ){
		var that = this,
			bangup = { currentAmount: startAmount };

		endAmount = endAmount || 0;

		TweenMax.to(bangup, 1, {
			currentAmount: endAmount,
			onUpdate: onUpdate
		});

		function onUpdate () {
			var amountPercent = toFixed( this.progress() * (endAmount - startAmount) ),
			amountToUpdate = toFixed( startAmount + parseFloat(amountPercent) );

			that.text.setText( amountToUpdate.toFixed(2) );

			if ( that.centered ) {
				that.text.updateTransform();
				var bounds = that.text.getBounds();
				that.text.pivot = new PIXI.Point(bounds.width / 2, bounds.height / 2);
			}
		}
	};

	return Bangup;
});