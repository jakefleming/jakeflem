!function(e){function o(a){if(t[a])return t[a].exports;var n=t[a]={i:a,l:!1,exports:{}};return e[a].call(n.exports,n,n.exports,o),n.l=!0,n.exports}var t={};o.m=e,o.c=t,o.d=function(e,t,a){o.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:a})},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,o){return Object.prototype.hasOwnProperty.call(e,o)},o.p="javascripts/",o(o.s=3)}([function(e,o,t){for(var a=document.querySelectorAll("[data-module]"),n=0;n<a.length;n++){var r=a[n],i=r.getAttribute("data-module");new(0,t(5)("./"+i).default)(r)}},function(e,o,t){"use strict";function a(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(o,"__esModule",{value:!0});var n=function e(o){a(this,e),this.el=o,console.log(o.textContent,"- From the example module")};o.default=n},function(e,o){function t(){u=c.add.physicsGroup(),n(375,400,"coin"),n(575,500,"coin"),n(225,500,"coin"),n(100,250,"coin"),n(575,150,"coin"),n(525,300,"coin"),n(650,250,"coin"),n(225,200,"coin"),n(375,100,"poison"),n(370,500,"poison"),n(100,375,"poison"),n(125,50,"star")}function a(){d=c.add.physicsGroup(),d.create(450,550,"platform"),d.create(100,550,"platform"),d.create(300,450,"platform"),d.create(250,150,"platform"),d.create(50,300,"platform"),d.create(150,250,"platform"),d.create(650,300,"platform"),d.create(550,200,"platform2"),d.create(300,450,"platform2"),d.create(400,350,"platform2"),d.create(100,100,"platform2"),d.setAll("body.immovable",!0)}function n(e,o,t){var a=u.create(e,o,t);a.animations.add("spin"),a.animations.play("spin",10,!0)}function r(){p=c.add.physicsGroup();var e=p.create(750,400,"badge");e.animations.add("spin"),e.animations.play("spin",10,!0)}function i(e,o){o.kill(),"coin"===o.key?g+=10:"poison"===o.key?g-=25:"star"===o.key&&(g+=25),g===v&&r()}function l(e,o){o.kill(),b=!0}var c,s,d,p,u,f,y,m,h,b=!1,g=0,v=100;window.onload=function(){function e(){c.stage.backgroundColor="#5db1ad",c.load.image("platform","platform_1.png"),c.load.image("platform2","platform_2.png"),c.load.spritesheet("player","chalkers.png",48,62),c.load.spritesheet("coin","coin.png",36,44),c.load.spritesheet("badge","badge.png",42,54),c.load.spritesheet("poison","poison.png",32,32),c.load.spritesheet("star","star.png",32,32)}function o(){s=c.add.sprite(50,600,"player"),s.animations.add("walk"),s.anchor.setTo(.5,1),c.physics.arcade.enable(s),s.body.collideWorldBounds=!0,s.body.gravity.y=500,t(),a(),f=c.input.keyboard.createCursorKeys(),y=c.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),m=c.add.text(16,16,"SCORE: "+g,{font:"bold 24px Arial",fill:"white"}),h=c.add.text(c.world.centerX,275,"",{font:"bold 48px Arial",fill:"white"}),h.anchor.setTo(.5,1)}function n(){m.text="SCORE: "+g,c.physics.arcade.collide(s,d),c.physics.arcade.overlap(s,u,i),c.physics.arcade.overlap(s,p,l),s.body.velocity.x=0,f.left.isDown?(s.animations.play("walk",10,!0),s.body.velocity.x=-300,s.scale.x=-1):f.right.isDown?(s.animations.play("walk",10,!0),s.body.velocity.x=300,s.scale.x=1):s.animations.stop(),y.isDown&&(s.body.onFloor()||s.body.touching.down)&&(s.body.velocity.y=-400),b&&(h.text="YOU WIN!!!")}function r(){}c=new Phaser.Game(800,600,Phaser.AUTO,"",{preload:e,create:o,update:n,render:r})}},function(e,o,t){e.exports=t(4)},function(e,o,t){"use strict";Object.defineProperty(o,"__esModule",{value:!0});var a=t(0);t.n(a);console.log("app.js has loaded!")},function(e,o,t){function a(e){return t(n(e))}function n(e){var o=r[e];if(!(o+1))throw new Error("Cannot find module '"+e+"'.");return o}var r={"./":0,"./example":1,"./example.js":1,"./game":2,"./game.js":2,"./index":0,"./index.js":0};a.keys=function(){return Object.keys(r)},a.resolve=n,e.exports=a,a.id=5}]);