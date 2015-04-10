 
/*
 * Sprite - prototype for sprite object
 * Possible arguments
 *  (image,options)
 *  (images,options)
 *  (options)
 *
 */

//arg1 is animation name eg. 'walk'
//arg2 is data for animation - x,y,width,height,no of frames
//arg3 is data for sprite - 
var Sprite = function (arg1,arg2,arg3) {
  var data;
  var params;
  // arg1 is img
  if(arg1 instanceof HTMLImageElement) {
    data = normalize_options(arg2,arg1); //the final data object would have a list of animations and the image. 
  }
  this.data = data;
  this.params = set_sprite_params(arg3);
  //console.log("PARAMS DATA: " + this.params.x + "," + this.params.y+","+this.params.angle+","+this.params.scaleX+","+this.params.scaleY+","+this.params.anchorX+","+this.params.anchorY);
  this.animators = createAnimators(data);
}

/*
 * exists - helper function to check if a key exists
 */
function exists(x) {
  return typeof x !== 'undefined';
}

/*
 * normalize_options - squeeze all possible options into the sprite data
 *  format
 */
function normalize_options(opts,img) {
  var data = {
    animations: {} //would populate this field after we fetch the list of anims, 'walk' ,'run' etc
  };

  if(img) {
    data.img = img;
  }

  var anims = opts;
  
  // loop each animation in opts
  for(var name in anims) {
    var anim = anims[name];  //anim is the string passed in the object definition, 'walk', 'run'
    if (exists(anim.size)) {
      anim.img = data.img;
      anim.frames = expand_repeat_opts(anim); //anim.frames is an array of individual sprites for that particular animation.
      data.animations[name] = anim;
    }
    else {
      throw new Error(name + ' did not match any valid animation definitions');
    }
  }
  return unroll_draw_data(data);
}

function expand_repeat_opts(opts) {
  var frames = [];

  // loop by size, collect each individual sprites and store it in the frames array
  for(var i = 0; i < opts.size; i++) {
    // increment location frame is read from
    var x = opts.x + i*opts.width; 
    var y = opts.y;

    // create new frame
    var tmp = {
      x: x % opts.img.width,
      y: y + Math.floor(x/opts.img.width)*opts.height
    }

    // store new frame
    frames.push(tmp);
  }
  return frames;
}

/*
 * unroll_draw_data - propogate information used by draw down to the frames
 *  this allows for properties of the sprite to be inherited to each animation,
 *  and properties of each animation to each frame
 */

function set_sprite_params(data) {
  var ParamData = {
    x: data.x,
    y: data.y,
    angle: data.angle,
    scaleX: data.scaleX,
    scaleY: data.scaleY,
    anchorX: data.anchorX,
    anchorY: data.anchorY
  };

  return ParamData;
}

//Setter functions
Sprite.prototype.setRotation = function (rotation) {
  this.params.angle = rotation;
}

Sprite.prototype.setScale = function (scaleX, scaleY) {
  this.params.scaleX = scaleX;
  this.params.scaleY = scaleY;
}

Sprite.prototype.setAnchor = function (anchorX, anchorY) {
  this.params.anchorX = anchorX;
  this.params.anchorY = anchorY;
}

Sprite.prototype.setPosition = function (x, y) {
  this.params.x = x;
  this.params.y = y;
}

function unroll_draw_data(data) {
  var spriteData = {
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height,
    img: data.img
  };

  for(var name in data.animations) {
    var anim = data.animations[name];
    var animData = propogate_draw_data(spriteData,anim);
    for(var i = 0; i < anim.frames.length; i++) {
      anim.frames[i] = propogate_draw_data(animData,anim.frames[i]);
    }
  }
  return data;
}

/*
 * propogate_draw_data - pass the draw data from prev to next, unless next has
 *  already defined it, in which case take the value of next
 */
function propogate_draw_data(prev,next) {
  return {
    x: exists(next.x) ? next.x : prev.x,
    y: exists(next.y) ? next.y : prev.y,
    width: exists(next.width) ? next.width : prev.width,
    height: exists(next.height) ? next.height : prev.height,
    img: exists(next.img) ? next.img : prev.img
  }
}

function createAnimators(drawData)
{
    var animators = {};
    for (var name in drawData.animations)
    {
        animators[name] = new Animator(drawData.animations[name].frames);
    }
    return animators;
}
/*
 * draw - draw the sprite animation specified
 * anim: animation name
 * x: x position in world space
 * y: y position in world space
 * angle: rotate by (in degrees)
 * scalex: x scale of sprite
 * scaley: y scale of sprite
 * anchorx: x anchor value (0-1)
 * anchory: y anchor value (0-1)
 */
//Sprite.prototype.draw = function (anim, x, y, angle, scalex, scaley, anchorx, anchory) {
Sprite.prototype.draw = function (anim) {
    var drawData = this.animators[anim].getNextFrameData();

//console.log(drawData.width);
  //draw this stuff
  if(window.sald.ctx) {
    window.sald.ctx.save();
	
    //this rotation does work
    //console.log("angle : " +angle);
    //this.rotate(this.params.x, this.params.y, drawData, this.params.angle, this.params.anchorX, this.params.anchorY);

    //locally flip the 'y' axis since images draw with upper-left origins:
    window.sald.ctx.transform(1, 0,
      0,-1,
      Math.round(this.params.x*drawData.width - this.params.anchorX*drawData.width)/drawData.width,
      Math.round(this.params.y*drawData.height - this.params.anchorY*drawData.height)/drawData.height
    );

     window.sald.ctx.drawImage(drawData.img,  
            0, 0,
            1, 1);

    /*window.sald.ctx.drawImage(drawData.img, drawData.x, drawData.y, 
            drawData.width, drawData.height, 
            0, 0,
            this.params.scaleX, this.params.scaleY);*/
    window.sald.ctx.restore();
  }
}

module.exports = Sprite;

Sprite.prototype.rotate = function (x, y, drawData, angle, anchorx, anchory)
{ 
    //console.log("W:" + drawData.width + "," + "H: " + drawData.height);
    var rotationPointx = x - anchorx * drawData.width;
    var rotationPointy = y - anchory * drawData.height;

    /*rotationPointx = Math.round(x*drawData.width - anchorx*drawData.width)/drawData.width;
    rotationPointy = Math.round(y*drawData.height - anchory*drawData.height)/drawData.height;
    */

    rotationPointx = Math.round(x*drawData.width - anchorx*drawData.width)/drawData.width;
    rotationPointy = Math.round(y*drawData.height - anchory*drawData.height)/drawData.height;

    window.sald.ctx.translate(rotationPointx, rotationPointy);
    window.sald.ctx.rotate(angle * Math.PI / 180);
    window.sald.ctx.translate(-rotationPointx, -rotationPointy);
}

/*
* Animator framework for handling animations in a simpler way.
* The user doesn't have to handle sending each frame every draw call.
* They just have to call the draw function with the animation the want
* to run and this object gives us what the next frame in the animation should be.
* Also provides neat features like animation speed, looping functionality
* and stop feature where it wont let the animation run anymore.
*/
function Animator(frames)
{
    this.isStopped = false;
    this.isLooping = false;
    // Frame being drawn
    this.currentFrame = 0;
    // The frame data for the particular animation
    this.animationFrames = frames;

    // The default speed at which to run the animation
    var animationSpeed = 60;

    // Convert the animation speed to "number of frames to skip"
    // before we move on to the next frame in the animation set
    this.animationSpeed = Math.floor(60 / animationSpeed);

    // A counter for skipping frames (related to animation speed)
    this.frameSkipCounter = 0;
}

Animator.prototype.loop = function (loop) {
    this.isLooping = loop;
}

Animator.prototype.speed = function(animationSpeed) {
    if (animationSpeed == 0) animationSpeed = 60;
    this.animationSpeed = Math.floor(60 / animationSpeed);
}

Animator.prototype.getNextFrameData = function () {
    if (this.isStopped)
    {
        // do nothing. Dont update animation frame
        // or reset the animation
        this.currentFrame = 0;
        this.frameSkipCounter = 0;
        this.isStopped = false;
        return this.animationFrames[this.currentFrame];
    }
    if(this.frameSkipCounter == this.animationSpeed)
    {
        this.currentFrame++;
        this.frameSkipCounter = 0;
    }
    this.frameSkipCounter++;

    if (this.animationFrames.length == this.currentFrame)
    {
        if (this.isLooping) {
            this.currentFrame = 0;
        } else {
            // Set the frame to the last frame in the animation
            // if looping is disabled
            this.currentFrame--;
        }
    }

    return this.animationFrames[this.currentFrame];
}

Animator.prototype.stop = function() {
  this.isLooping = false;
  this.isStopped = true;
}

/*module.exports = {
	drawLoop:drawLoop,
};*/
