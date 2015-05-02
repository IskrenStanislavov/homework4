Array.prototype.range = function(start,end){
	return Array.apply(null, Array(end-start+1)).map(function (_, i){
	    // http://stackoverflow.com/a/10050831/3345926
	    return start+i;
	});
};

Array.prototype.shuffle = function(){
	var result = [];
	while(this.length > 0 ){
		result.push( this.splice(Math.floor(Math.random() * this.length), 1)[0] );
	}
	return result;
};


require(["libs/pixi.dev", "libs/TweenMax.min", "settings", "stage", "game" ],
	function( PIXI, TweenMax, settings, stage, Game ) {
	
	var loader = new PIXI.AssetLoader(settings.assets);
	loader.onComplete = function(){
		var game = new Game();
		stage.addChild(game);

		game.start();
	}
	
	loader.load();
});