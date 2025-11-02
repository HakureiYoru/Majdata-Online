"use client";
import React, { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    // 动态导入createjs和TweenMax库
    Promise.all([
      import('createjs/builds/1.0.0/createjs.js'),
      import('gsap')
    ]).then(([createjs, gsap]) => {
      // 获取所需的GSAP类
      const TweenMax = gsap.default;
      const Power1 = gsap.Power1;
      const Cubic = gsap.Cubic;

      // 粒子引擎类
      class ParticleEngine {
        constructor(canvas) {
          this.canvas = canvas;
          this.stage = new createjs.Stage(canvas);
          this.totalWidth = this.canvasWidth = canvas.width = canvas.offsetWidth;
          this.totalHeight = this.canvasHeight = canvas.height = canvas.offsetHeight;
          this.compositeStyle = "lighter";

          this.particleSettings = [{id:"small", num:300, fromX:0, toX:this.totalWidth, ballwidth:3, alphamax:0.4, areaHeight:.5, color:"#0cdbf3", fill:false}, 
                                  {id:"medium", num:100, fromX:0, toX:this.totalWidth,  ballwidth:8, alphamax:0.3, areaHeight:1, color:"#6fd2f3", fill:true}, 
                                  {id:"large", num:10, fromX:0, toX:this.totalWidth, ballwidth:30,  alphamax:0.2, areaHeight:1, color:"#93e9f3", fill:true}];
          this.particleArray = [];
          this.lights = [{ellipseWidth:400, ellipseHeight:100, alpha:0.6, offsetX:0, offsetY:0, color:"#6ac6e8"}, 
                          {ellipseWidth:350, ellipseHeight:250, alpha:0.3, offsetX:-50, offsetY:0, color:"#54d5e8"}, 
                          {ellipseWidth:100, ellipseHeight:80, alpha:0.2, offsetX:80, offsetY:-50, color:"#2ae8d8"}];

          this.stage.compositeOperation = this.compositeStyle;

          this.drawBgLight();
          this.drawParticles();
        }

        drawBgLight() {
          var light;
          var bounds;
          var blurFilter;
          for (var i = 0, len = this.lights.length; i < len; i++) {				
            light = new createjs.Shape();
            light.graphics.beginFill(this.lights[i].color).drawEllipse(0, 0, this.lights[i].ellipseWidth, this.lights[i].ellipseHeight);
            light.regX = this.lights[i].ellipseWidth/2;
            light.regY = this.lights[i].ellipseHeight/2; 
            light.y = light.initY = this.totalHeight/2 + this.lights[i].offsetY;
            light.x = light.initX = this.totalWidth/2 + this.lights[i].offsetX;

            blurFilter = new createjs.BlurFilter(this.lights[i].ellipseWidth, this.lights[i].ellipseHeight, 1);
            bounds = blurFilter.getBounds();
            light.filters = [blurFilter];
            light.cache(bounds.x - this.lights[i].ellipseWidth/2, bounds.y - this.lights[i].ellipseHeight/2, bounds.width*2, bounds.height*2);
            light.alpha = this.lights[i].alpha;

            light.compositeOperation = "screen";
            this.stage.addChildAt(light, 0);

            this.lights[i].elem = light;
          }

          TweenMax.fromTo(this.lights[0].elem, 10, {scaleX:1.5, x:this.lights[0].elem.initX, y:this.lights[0].elem.initY},{yoyo:true, repeat:-1, ease:Power1.easeInOut, scaleX:2, scaleY:0.7});
          TweenMax.fromTo(this.lights[1].elem, 12, { x:this.lights[1].elem.initX, y:this.lights[1].elem.initY},{delay:5, yoyo:true, repeat:-1, ease:Power1.easeInOut, scaleY:2, scaleX:2, y:this.totalHeight/2-50, x:this.totalWidth/2+100});
          TweenMax.fromTo(this.lights[2].elem, 8, { x:this.lights[2].elem.initX, y:this.lights[2].elem.initY},{delay:2, yoyo:true, repeat:-1, ease:Power1.easeInOut, scaleY:1.5, scaleX:1.5, y:this.totalHeight/2, x:this.totalWidth/2-200});
        }

        drawParticles() {
          var blurFilter;
          for (var i = 0, len = this.particleSettings.length; i < len; i++) {
            var ball = this.particleSettings[i];

            var circle;
            for (var s = 0; s < ball.num; s++ )
            {
              circle = new createjs.Shape();
              if(ball.fill){
                circle.graphics.beginFill(ball.color).drawCircle(0, 0, ball.ballwidth);
                blurFilter = new createjs.BlurFilter(ball.ballwidth/2, ball.ballwidth/2, 1);
                circle.filters = [blurFilter];
                var bounds = blurFilter.getBounds();
                circle.cache(-50+bounds.x, -50+bounds.y, 100+bounds.width, 100+bounds.height);
              }else{
                circle.graphics.beginStroke(ball.color).setStrokeStyle(1).drawCircle(0, 0, ball.ballwidth);
              }
              
              circle.alpha = this.range(0, 0.1);
              circle.alphaMax = ball.alphamax;
              circle.distance = ball.ballwidth * 2;
              circle.ballwidth = ball.ballwidth;
              circle.flag = ball.id;
              this.applySettings(circle, ball.fromX, ball.toX, ball.areaHeight);
              circle.speed = this.range(2, 10);
              circle.y = circle.initY;
              circle.x = circle.initX;
              circle.scaleX = circle.scaleY = this.range(0.3, 1);

              this.stage.addChild(circle);
              

              this.animateBall(circle);

              this.particleArray.push(circle);
            }
          }	
        }

        applySettings(circle, positionX, totalWidth, areaHeight) {
          circle.speed = this.range(1, 3);
          circle.initY = this.weightedRange(0, this.totalHeight , 1, [this.totalHeight * (2-areaHeight/2)/4, this.totalHeight*(2+areaHeight/2)/4], 0.8 );
          circle.initX = this.weightedRange(positionX, totalWidth, 1, [positionX+ ((totalWidth-positionX))/4, positionX+ ((totalWidth-positionX)) * 3/4], 0.6);
        }

        animateBall(ball) {
          var scale = this.range(0.3, 1);
          var xpos = this.range(ball.initX - ball.distance, ball.initX + ball.distance);
          var ypos = this.range(ball.initY - ball.distance, ball.initY + ball.distance);
          var speed = ball.speed;
          TweenMax.to(ball, speed, {scaleX:scale, scaleY:scale, x:xpos, y:ypos, onComplete:this.animateBall.bind(this), onCompleteParams:[ball], ease:Cubic.easeInOut});	
          TweenMax.to(ball, speed/2, {alpha:this.range(0.1, ball.alphaMax), onComplete:this.fadeout.bind(this), onCompleteParams:[ball, speed]});	
        }	

        fadeout(ball, speed) {
          ball.speed = this.range(2, 10);
          TweenMax.to(ball, speed/2, {alpha:0 });
        }

        render() {
          this.stage.update();
        }

        resize() {
          this.totalWidth = this.canvasWidth = this.canvas.width = this.canvas.offsetWidth;
          this.totalHeight = this.canvasHeight = this.canvas.height = this.canvas.offsetHeight;
          this.render();

          for (var i= 0, length = this.particleArray.length; i < length; i++)
          {
            this.applySettings(this.particleArray[i], 0, this.totalWidth, this.particleArray[i].areaHeight);
          }

          for (var j = 0, len = this.lights.length; j < len; j++) {
            this.lights[j].elem.initY = this.totalHeight/2 + this.lights[j].offsetY;
            this.lights[j].elem.initX = this.totalWidth/2 + this.lights[j].offsetX;
            TweenMax.to(this.lights[j].elem, .5, {x:this.lights[j].elem.initX, y:this.lights[j].elem.initY});		
          }
        }

        range(min, max) {
          return min + (max - min) * Math.random();
        }

        round(num, precision) {
          var decimal = Math.pow(10, precision);
          return Math.round(decimal* num) / decimal;
        }

        weightedRange(to, from, decimalPlaces, weightedRange, weightStrength) {
          if (typeof from === "undefined" || from === null) { 
            from = 0; 
          }
    if (typeof decimalPlaces === "undefined" || decimalPlaces === null) { 
      decimalPlaces = 0; 
    }
    if (typeof weightedRange === "undefined" || weightedRange === null) { 
      weightedRange = 0; 
    }
    if (typeof weightStrength === "undefined" || weightStrength === null) { 
      weightStrength = 0; 
    }

    var ret
    if(to == from){return(to);}

    if(weightedRange && Math.random()<=weightStrength){
      ret = this.round( Math.random()*(weightedRange[1]-weightedRange[0]) + weightedRange[0], decimalPlaces )
    }else{
      ret = this.round( Math.random()*(to-from)+from, decimalPlaces )
    }
    return(ret);
  }
}