Array.prototype.range = function(start,end){
	return Array.apply(null, Array(end-start+1)).map(function (_, i){
	    // http://stackoverflow.com/a/10050831/3345926
	    return start+i;
	});
};


require(["libs/pixi.dev", "libs/TweenMax.min", "settings", "stage", "game" ],
	function( PIXI, TweenMax, settings, stage, Game ) {
	
	var loader = new PIXI.AssetLoader(settings.assets);
	loader.onComplete = function(){
		var game = new Game();
		stage.addChild(game);

		game.events.elementsCreated.addOnce(function(){
			game.start();
		});

		game.createGameElements();
	}
	
	loader.load();
});